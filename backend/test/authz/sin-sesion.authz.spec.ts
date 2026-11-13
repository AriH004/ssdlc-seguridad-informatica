/**
 * Ítem 4.5: acceso sin sesión y con credenciales inválidas, directo a la API.
 *
 * Cubre F-01/R-02 y R-03 (toda ruta exige sesión salvo las `@Public`, y un JWT
 * sin claims o con rol desconocido se rechaza) y la amenaza T-08 (suplantación).
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { SignJWT } from 'jose';
import {
  CONTROLADORES,
  FINCA_A,
  ID_RECURSO,
  crearAmbiente,
  usuarioDe,
  type Ambiente,
} from './support/ambiente.js';

// Equivalencia con `RequestMethod` de NestJS: 0 GET, 1 POST, 2 PUT, 3 DELETE, 4 PATCH.
const METODOS_HTTP = ['get', 'post', 'put', 'delete', 'patch'] as const;

interface RutaDescubierta {
  metodo: (typeof METODOS_HTTP)[number];
  ruta: string;
  publica: boolean;
}

/** Descubre TODAS las rutas de los controladores, para que una nueva no quede sin probar. */
function descubrirRutas(): RutaDescubierta[] {
  const rutas: RutaDescubierta[] = [];
  for (const controlador of CONTROLADORES) {
    const prefijo = String(Reflect.getMetadata('path', controlador) ?? '');
    const claseEsPublica = Reflect.getMetadata('isPublic', controlador) === true;
    for (const nombre of Object.getOwnPropertyNames(controlador.prototype)) {
      const manejador = (controlador.prototype as Record<string, unknown>)[nombre];
      if (typeof manejador !== 'function') continue;
      const indiceMetodo = Reflect.getMetadata('method', manejador);
      if (indiceMetodo === undefined) continue;
      const sufijo = String(Reflect.getMetadata('path', manejador) ?? '');
      const ruta =
        '/' +
        [prefijo, sufijo]
          .join('/')
          .split('/')
          .filter(Boolean)
          .map((parte) => (parte.startsWith(':') ? ID_RECURSO : parte))
          .join('/');
      rutas.push({
        metodo: METODOS_HTTP[indiceMetodo],
        ruta,
        publica: claseEsPublica || Reflect.getMetadata('isPublic', manejador) === true,
      });
    }
  }
  return rutas;
}

describe('Sin sesión y credenciales inválidas (4.5)', () => {
  let ambiente: Ambiente;

  beforeAll(async () => {
    ambiente = await crearAmbiente();
  });

  afterAll(async () => {
    await ambiente.cerrar();
  });

  beforeEach(() => {
    ambiente.reiniciar();
  });

  const rutas = descubrirRutas();

  it('[F-01][T-08] se descubrieron las rutas de la API (la prueba no puede quedar vacía)', () => {
    expect(rutas.length).toBeGreaterThan(50);
    expect(rutas.some((r) => r.publica)).toBe(true);
  });

  for (const { metodo, ruta, publica } of rutas) {
    if (publica) {
      it(`[F-01] ${metodo.toUpperCase()} ${ruta} es pública y responde sin sesión`, async () => {
        const respuesta = await request(ambiente.app.getHttpServer())[metodo](ruta);
        expect([401, 403]).not.toContain(respuesta.status);
      });
      continue;
    }
    it(`[F-01][T-08] sin sesión: ${metodo.toUpperCase()} ${ruta} responde 401 y no toca ningún dato`, async () => {
      const respuesta = await request(ambiente.app.getHttpServer())[metodo](ruta).send({});
      expect(respuesta.status).toBe(401);
      expect(ambiente.llamadas).toEqual([]);
    });
  }

  describe('credenciales inválidas contra una ruta protegida', () => {
    const RUTA = `/animales/${ID_RECURSO}`;
    const base = usuarioDe(FINCA_A, 'propietario');

    async function llamarCon(authorization?: string) {
      const peticion = request(ambiente.app.getHttpServer()).get(RUTA);
      if (authorization !== undefined) peticion.set('Authorization', authorization);
      return peticion;
    }

    function esperarRechazo(respuesta: { status: number; body: unknown }) {
      expect(respuesta.status).toBe(401);
      expect(ambiente.llamadas).toEqual([]);
      // No se filtra el detalle técnico de `jose` (firma, algoritmo, emisor,
      // audiencia): le ahorraría trabajo a un atacante. El mensaje genérico
      // "inválido o expirado" sí es aceptable.
      expect(JSON.stringify(respuesta.body)).not.toMatch(
        /signature|JWS|JWTExpired|JWTClaim|jose|ES256|issuer|audience|unexpected/i,
      );
    }

    it('[F-01][T-08] token vencido', async () => {
      const vencido = await ambiente.token(base, {
        expiracion: Math.floor(Date.now() / 1000) - 3600,
      });
      esperarRechazo(await llamarCon(`Bearer ${vencido}`));
    });

    it('[F-01][T-08] token firmado con una llave que Supabase no publicó', async () => {
      esperarRechazo(
        await llamarCon(`Bearer ${await ambiente.tokenDeOtraLlave(base)}`),
      );
    });

    it('[F-01][T-08] token de otro emisor', async () => {
      const token = await ambiente.token(base, { emisor: 'https://otro.test/auth/v1' });
      esperarRechazo(await llamarCon(`Bearer ${token}`));
    });

    it('[F-01][T-08] token con otra audiencia', async () => {
      const token = await ambiente.token(base, { audiencia: 'anon' });
      esperarRechazo(await llamarCon(`Bearer ${token}`));
    });

    it('[F-01][T-08] token sin firma (alg none)', async () => {
      const codificar = (objeto: unknown) =>
        Buffer.from(JSON.stringify(objeto)).toString('base64url');
      const sinFirma = `${codificar({ alg: 'none', typ: 'JWT' })}.${codificar({
        sub: base.sub,
        tenant_id: base.tenant_id,
        rol: base.rol,
        aud: 'authenticated',
      })}.`;
      esperarRechazo(await llamarCon(`Bearer ${sinFirma}`));
    });

    it('[F-01][T-08] token firmado con HS256 usando la llave pública como secreto', async () => {
      const hs256 = await new SignJWT({ tenant_id: base.tenant_id, rol: base.rol })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(base.sub)
        .setAudience('authenticated')
        .setExpirationTime('10m')
        .sign(new TextEncoder().encode('secreto-que-el-atacante-conoce'));
      esperarRechazo(await llamarCon(`Bearer ${hs256}`));
    });

    it('[F-01][T-08] cadena que no es un JWT', async () => {
      esperarRechazo(await llamarCon('Bearer no-es-un-jwt'));
    });

    it('[F-01][T-08] esquema distinto de Bearer', async () => {
      const token = await ambiente.token(base);
      esperarRechazo(await llamarCon(`Basic ${token}`));
    });

    it('[F-01][R-03] token válido sin tenant_id', async () => {
      const { tenant_id: _omitido, ...sinFinca } = base;
      esperarRechazo(await llamarCon(`Bearer ${await ambiente.token(sinFinca)}`));
    });

    it('[F-01][R-03] token válido sin rol', async () => {
      const { rol: _omitido, ...sinRol } = base;
      esperarRechazo(await llamarCon(`Bearer ${await ambiente.token(sinRol)}`));
    });

    it('[F-01][T-02] token válido con un rol inexistente (superadmin)', async () => {
      esperarRechazo(
        await llamarCon(`Bearer ${await ambiente.token({ ...base, rol: 'superadmin' })}`),
      );
    });

    it('[F-01][T-08] token válido sin sub', async () => {
      const { sub: _omitido, ...sinSub } = base;
      esperarRechazo(await llamarCon(`Bearer ${await ambiente.token(sinSub)}`));
    });

    it('[F-01] control: el mismo token válido sí pasa los guards', async () => {
      const respuesta = await llamarCon(`Bearer ${await ambiente.token(base)}`);
      expect([401, 403]).not.toContain(respuesta.status);
    });
  });
});
