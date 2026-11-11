/**
 * Ítem 4.5: autorización por rol, directo a la API HTTP.
 *
 * La tabla `MATRIZ` se escribió a partir de la tabla de acceso de
 * `docs/kb/arquitectura-y-acceso.md`, NO a partir de los decoradores `@Roles`
 * del código. Si alguien relaja un permiso en el código, la prueba falla.
 *
 * Qué comprueba para cada ruta y rol:
 *  - Rol no permitido: 403, sin detalle interno y sin que ningún servicio reciba
 *    una llamada (no se expone ni se modifica ningún dato).
 *  - Rol permitido: la petición pasa los guards (no es 401 ni 403). El resultado
 *    posterior (por ejemplo 400 por cuerpo vacío) no es asunto de esta prueba.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  FINCA_A,
  ID_RECURSO,
  ROLES,
  crearAmbiente,
  usuarioDe,
  type Ambiente,
  type Rol,
} from './support/ambiente.js';

type Metodo = 'get' | 'post' | 'patch' | 'delete';

interface Ruta {
  /** IDs de flujo y amenaza que cubre; van en el nombre de la prueba. */
  ids: string;
  metodo: Metodo;
  ruta: string;
  permitidos: readonly Rol[];
}

const P: Rol = 'propietario';
const A: Rol = 'administrador';
const E: Rol = 'peon';
const V: Rol = 'veterinario';

const MATRIZ: readonly Ruta[] = [
  // F-01: gestión del equipo de la finca
  { ids: '[F-01][T-02]', metodo: 'post', ruta: '/auth/invitar', permitidos: [P] },
  { ids: '[F-01][T-02]', metodo: 'get', ruta: '/auth/invitaciones', permitidos: [P] },

  // F-02: tratamientos y retiros
  { ids: '[F-02][T-02][T-04]', metodo: 'post', ruta: '/tratamientos', permitidos: [P, A, E, V] },
  { ids: '[F-02][T-02][T-04]', metodo: 'post', ruta: `/tratamientos/${ID_RECURSO}/correccion`, permitidos: [P, A, V] },
  { ids: '[F-02][T-02][T-04]', metodo: 'post', ruta: `/tratamientos/${ID_RECURSO}/anulacion`, permitidos: [P, A, V] },

  // Animales y documentos
  { ids: '[F-02][T-02]', metodo: 'post', ruta: '/animales', permitidos: [P, A] },
  { ids: '[F-02][T-02]', metodo: 'patch', ruta: `/animales/${ID_RECURSO}`, permitidos: [P, A] },
  { ids: '[F-02][T-02]', metodo: 'post', ruta: `/animales/${ID_RECURSO}/baja`, permitidos: [P, A] },
  { ids: '[F-02][T-02]', metodo: 'post', ruta: `/animales/${ID_RECURSO}/reactivar`, permitidos: [P, A] },
  { ids: '[F-02][T-02][T-07]', metodo: 'post', ruta: `/animales/${ID_RECURSO}/documentos`, permitidos: [P, A] },

  // Potreros
  { ids: '[F-03][T-02]', metodo: 'post', ruta: '/potreros', permitidos: [P, A] },
  { ids: '[F-03][T-02]', metodo: 'patch', ruta: `/potreros/${ID_RECURSO}`, permitidos: [P, A] },
  { ids: '[F-03][T-02]', metodo: 'delete', ruta: `/potreros/${ID_RECURSO}`, permitidos: [P, A] },
  { ids: '[F-03][T-02]', metodo: 'post', ruta: `/potreros/${ID_RECURSO}/asignar`, permitidos: [P, A, E] },

  // Pesajes
  { ids: '[F-03][T-02]', metodo: 'post', ruta: '/pesajes', permitidos: [P, A, E] },

  // Producción de leche y lactancia
  { ids: '[F-03][T-02]', metodo: 'post', ruta: '/produccion-leche', permitidos: [P, A, E] },
  { ids: '[F-03][T-02]', metodo: 'post', ruta: '/produccion-leche/lote', permitidos: [P, A, E] },
  { ids: '[F-03][T-02]', metodo: 'patch', ruta: `/produccion-leche/${ID_RECURSO}`, permitidos: [P, A, E] },
  { ids: '[F-03][T-02]', metodo: 'post', ruta: `/produccion-leche/${ID_RECURSO}/anulacion`, permitidos: [P, A] },
  { ids: '[F-03][T-02]', metodo: 'post', ruta: `/lactancia/animal/${ID_RECURSO}/inicio`, permitidos: [P, A] },
  { ids: '[F-03][T-02]', metodo: 'post', ruta: `/lactancia/animal/${ID_RECURSO}/fin`, permitidos: [P, A] },

  // Eventos reproductivos
  { ids: '[F-03][T-02]', metodo: 'post', ruta: `/animales/${ID_RECURSO}/servicios`, permitidos: [P, A, E, V] },
  { ids: '[F-03][T-02]', metodo: 'post', ruta: `/animales/${ID_RECURSO}/diagnosticos`, permitidos: [P, A, V] },
  { ids: '[F-03][T-02]', metodo: 'post', ruta: `/animales/${ID_RECURSO}/partos`, permitidos: [P, A, E, V] },
  { ids: '[F-03][T-02]', metodo: 'post', ruta: `/animales/${ID_RECURSO}/secados`, permitidos: [P, A, E, V] },
];

describe('Autorización por rol directo a la API (4.5)', () => {
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

  for (const { ids, metodo, ruta, permitidos } of MATRIZ) {
    for (const rol of ROLES) {
      const permitido = permitidos.includes(rol);
      const nombre = permitido
        ? `${ids} ${rol} puede pasar la autorización en ${metodo.toUpperCase()} ${ruta}`
        : `${ids} ${rol} es rechazado con 403 en ${metodo.toUpperCase()} ${ruta} y no se toca ningún dato`;

      it(nombre, async () => {
        const token = await ambiente.token(usuarioDe(FINCA_A, rol));
        const respuesta = await request(ambiente.app.getHttpServer())
          [metodo](ruta)
          .set('Authorization', `Bearer ${token}`)
          .send({});

        if (permitido) {
          expect([401, 403]).not.toContain(respuesta.status);
          return;
        }

        expect(respuesta.status).toBe(403);
        // El rechazo no filtra detalles internos.
        expect(JSON.stringify(respuesta.body)).not.toMatch(/stack|at .*\.ts/i);
        // Ningún servicio recibió una llamada: no se leyó ni se modificó nada.
        expect(ambiente.llamadas).toEqual([]);
      });
    }
  }
});
