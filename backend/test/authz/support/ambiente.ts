/**
 * Ambiente aislado de pruebas de autorización (ítem 4.1).
 *
 * Qué levanta, todo en memoria y sin tocar producción ni ninguna base real:
 *   1. Un servidor HTTP local que publica un JWKS con una llave ES256 generada
 *      al vuelo. Hace de "Supabase Auth" falso.
 *   2. La API real (controladores, AuthGuard, RolesGuard, ValidationPipe y filtro
 *      de excepciones) apuntando a ese JWKS, de modo que el `SupabaseJwtService`
 *      verifica firmas reales (algoritmo, emisor y audiencia incluidos).
 *   3. Servicios falsos que anotan cada llamada. Si una petición es rechazada y
 *      algún servicio recibió una llamada, hubo exposición o modificación de datos.
 *
 * Cuentas y datos son ficticios: dos fincas (A y B) con un usuario por rol.
 * No hay nada que limpiar: todo vive y muere con el proceso de prueba.
 */
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Injectable, ValidationPipe, BadRequestException } from '@nestjs/common';
import type {
  CallHandler,
  ExecutionContext,
  INestApplication,
  NestInterceptor,
  Type,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { SignJWT, exportJWK, generateKeyPair, type JWK } from 'jose';
import { AppController } from '../../../src/app.controller.js';
import { AnimalesController } from '../../../src/animales/animales.controller.js';
import { AuthController } from '../../../src/auth/auth.controller.js';
import { AuthGuard } from '../../../src/auth/guards/auth.guard.js';
import { RolesGuard } from '../../../src/auth/guards/roles.guard.js';
import { SupabaseJwtService } from '../../../src/auth/services/supabase-jwt.service.js';
import { CatalogosController } from '../../../src/catalogos/catalogos.controller.js';
import { AllExceptionsFilter } from '../../../src/common/filters/all-exceptions.filter.js';
import { validationMessagesEs } from '../../../src/common/validation-messages.js';
import { PesajesController } from '../../../src/pesajes/pesajes.controller.js';
import { PotrerosController } from '../../../src/potreros/potreros.controller.js';
import { LactanciaController } from '../../../src/produccion/lactancia.controller.js';
import { ProduccionLecheController } from '../../../src/produccion/produccion-leche.controller.js';
import { ReproductiveController } from '../../../src/reproductivo/reproductive.controller.js';
import { SanitaryController } from '../../../src/sanitary/sanitary.controller.js';
import { TratamientosController } from '../../../src/tratamientos/tratamientos.controller.js';

export type Rol = 'propietario' | 'administrador' | 'peon' | 'veterinario';
export const ROLES: readonly Rol[] = [
  'propietario',
  'administrador',
  'peon',
  'veterinario',
];

// Datos ficticios: dos fincas y un usuario por rol en cada una.
export const FINCA_A = '00000000-0000-4000-8000-00000000000a';
export const FINCA_B = '00000000-0000-4000-8000-00000000000b';
export const ID_RECURSO = '11111111-1111-4111-8111-111111111111';

export function usuarioDe(finca: string, rol: Rol) {
  const sufijo = finca === FINCA_A ? 'a' : 'b';
  const indice = ROLES.indexOf(rol) + 1;
  return {
    sub: `22222222-2222-4222-8222-${sufijo.repeat(11)}${indice}`,
    tenant_id: finca,
    rol,
    email: `${rol}.${sufijo}@finca-ficticia.test`,
  };
}

export const CONTROLADORES: readonly Type<unknown>[] = [
  AppController,
  AuthController,
  AnimalesController,
  CatalogosController,
  PesajesController,
  PotrerosController,
  LactanciaController,
  ProduccionLecheController,
  ReproductiveController,
  SanitaryController,
  TratamientosController,
];

export interface LlamadaFalsa {
  servicio: string;
  metodo: string;
}

/** Interceptor de prueba: reemplaza al de RLS, que necesita una base real. */
@Injectable()
class InterceptorSinBase implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<{
      user?: unknown;
      entityManager?: unknown;
    }>();
    if (request.user) {
      request.entityManager = { query: async () => [] };
    }
    return next.handle();
  }
}

export interface Ambiente {
  app: INestApplication;
  /** Llamadas recibidas por cualquier servicio falso desde el último `reiniciar()`. */
  llamadas: LlamadaFalsa[];
  reiniciar(): void;
  /** Firma un JWT ES256 válido para el usuario indicado. */
  token(
    claims: Record<string, unknown>,
    opciones?: OpcionesToken,
  ): Promise<string>;
  /** Firma un JWT con una llave que el JWKS no conoce. */
  tokenDeOtraLlave(claims: Record<string, unknown>): Promise<string>;
  cerrar(): Promise<void>;
}

export interface OpcionesToken {
  emisor?: string;
  audiencia?: string;
  expiracion?: string | number;
}

function crearServicioFalso(nombre: string, llamadas: LlamadaFalsa[]) {
  return new Proxy(
    {},
    {
      get(_objetivo, propiedad) {
        if (typeof propiedad !== 'string' || propiedad === 'then') return undefined;
        return async () => {
          llamadas.push({ servicio: nombre, metodo: propiedad });
          return undefined;
        };
      },
    },
  );
}

export async function crearAmbiente(): Promise<Ambiente> {
  const { publicKey, privateKey } = await generateKeyPair('ES256');
  const otraLlave = await generateKeyPair('ES256');
  const jwk: JWK = {
    ...(await exportJWK(publicKey)),
    kid: 'llave-de-prueba',
    alg: 'ES256',
    use: 'sig',
  };

  const servidorJwks: Server = createServer((_req, res) => {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ keys: [jwk] }));
  });
  await new Promise<void>((resolver) =>
    servidorJwks.listen(0, '127.0.0.1', resolver),
  );
  const { port } = servidorJwks.address() as AddressInfo;
  const supabaseUrl = `http://127.0.0.1:${port}`;
  const emisorValido = `${supabaseUrl}/auth/v1`;

  const llamadas: LlamadaFalsa[] = [];

  // Un servicio falso por cada dependencia que declare algún controlador.
  const dependencias = new Set<Type<unknown>>();
  for (const controlador of CONTROLADORES) {
    const tipos: unknown[] =
      Reflect.getMetadata('design:paramtypes', controlador) ?? [];
    for (const tipo of tipos) {
      if (typeof tipo === 'function') dependencias.add(tipo as Type<unknown>);
    }
  }

  const modulo = await Test.createTestingModule({
    controllers: [...CONTROLADORES],
    providers: [
      {
        provide: ConfigService,
        useValue: { get: (clave: string) => (clave === 'SUPABASE_URL' ? supabaseUrl : undefined) },
      },
      SupabaseJwtService,
      { provide: APP_GUARD, useClass: AuthGuard },
      { provide: APP_GUARD, useClass: RolesGuard },
      { provide: APP_INTERCEPTOR, useClass: InterceptorSinBase },
      ...[...dependencias].map((tipo) => ({
        provide: tipo,
        useValue: crearServicioFalso(tipo.name, llamadas),
      })),
    ],
  }).compile();

  const app = modulo.createNestApplication();
  // Misma configuración de validación y de errores que `src/main.ts`.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
      exceptionFactory: (errores) =>
        new BadRequestException(validationMessagesEs(errores)),
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  await app.init();

  async function firmar(
    claims: Record<string, unknown>,
    llave: CryptoKey | Uint8Array,
    opciones: OpcionesToken = {},
  ): Promise<string> {
    const { sub, ...resto } = claims;
    return new SignJWT(resto)
      .setProtectedHeader({ alg: 'ES256', kid: 'llave-de-prueba' })
      .setSubject(typeof sub === 'string' ? sub : '')
      .setIssuer(opciones.emisor ?? emisorValido)
      .setAudience(opciones.audiencia ?? 'authenticated')
      .setIssuedAt()
      .setExpirationTime(opciones.expiracion ?? '10m')
      .sign(llave);
  }

  return {
    app,
    llamadas,
    reiniciar: () => {
      llamadas.length = 0;
    },
    token: (claims, opciones) => firmar(claims, privateKey, opciones),
    tokenDeOtraLlave: (claims) => firmar(claims, otraLlave.privateKey),
    cerrar: async () => {
      await app.close();
      await new Promise<void>((resolver) => servidorJwks.close(() => resolver()));
    },
  };
}
