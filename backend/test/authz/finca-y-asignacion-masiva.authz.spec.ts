/**
 * Ítem 4.5: propiedad del recurso por finca y asignación masiva, directo a la API.
 *
 * Aquí se comprueba lo que se puede comprobar sin base de datos: el `tenantId`
 * y el `rol` NUNCA se aceptan desde el cuerpo de la petición (T-03, T-04, S-02).
 *
 * Lo que NO comprueba (queda en las pruebas de integración con RLS, que
 * necesitan una base PostgreSQL y no corren en este CI): que la base devuelva
 * "no encontrado" para un recurso de otra finca. Ver docs/kb/amenazas.md, T-01.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import {
  FINCA_A,
  FINCA_B,
  ID_RECURSO,
  crearAmbiente,
  usuarioDe,
  type Ambiente,
  type Rol,
} from './support/ambiente.js';

interface Caso {
  ids: string;
  ruta: string;
  rol: Rol;
}

// Rutas de escritura donde cada rol sí tiene permiso, para llegar hasta la validación.
const CASOS: readonly Caso[] = [
  { ids: '[F-03][T-01][T-03]', ruta: '/animales', rol: 'propietario' },
  { ids: '[F-03][T-01][T-03]', ruta: '/potreros', rol: 'propietario' },
  { ids: '[F-03][T-01][T-03]', ruta: '/pesajes', rol: 'peon' },
  { ids: '[F-02][T-01][T-04]', ruta: '/tratamientos', rol: 'veterinario' },
  { ids: '[F-03][T-01][T-03]', ruta: '/produccion-leche', rol: 'peon' },
  { ids: '[F-03][T-01][T-03]', ruta: `/animales/${ID_RECURSO}/servicios`, rol: 'peon' },
];

describe('Finca y asignación masiva (4.5)', () => {
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

  for (const { ids, ruta, rol } of CASOS) {
    it(`${ids} ${rol} no puede fijar tenantId de otra finca desde el cuerpo de POST ${ruta}`, async () => {
      const token = await ambiente.token(usuarioDe(FINCA_A, rol));
      const respuesta = await request(ambiente.app.getHttpServer())
        .post(ruta)
        .set('Authorization', `Bearer ${token}`)
        .send({ tenantId: FINCA_B, tenant_id: FINCA_B });

      expect(respuesta.status).toBe(400);
      // El rechazo nombra el campo prohibido: no es un 400 por otra causa.
      expect(JSON.stringify(respuesta.body)).toMatch(/tenantId|tenant_id/);
      expect(ambiente.llamadas).toEqual([]);
    });

    it(`${ids} ${rol} no puede elevar su rol ni su identidad desde el cuerpo de POST ${ruta}`, async () => {
      const token = await ambiente.token(usuarioDe(FINCA_A, rol));
      const respuesta = await request(ambiente.app.getHttpServer())
        .post(ruta)
        .set('Authorization', `Bearer ${token}`)
        .send({ rol: 'propietario', userId: usuarioDe(FINCA_A, 'propietario').sub });

      expect(respuesta.status).toBe(400);
      expect(JSON.stringify(respuesta.body)).toMatch(/rol|userId/);
      expect(ambiente.llamadas).toEqual([]);
    });
  }

  it('[F-01][T-03] confirmar-invitacion rechaza un rol o una finca enviados por el invitado', async () => {
    const token = await ambiente.token(usuarioDe(FINCA_A, 'peon'));
    const respuesta = await request(ambiente.app.getHttpServer())
      .post('/auth/confirmar-invitacion')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombreCompleto: 'Persona Ficticia',
        invitacionId: ID_RECURSO,
        rol: 'propietario',
        tenantId: FINCA_B,
      });

    expect(respuesta.status).toBe(400);
    expect(JSON.stringify(respuesta.body)).toMatch(/rol|tenantId/);
    expect(ambiente.llamadas).toEqual([]);
  });
});
