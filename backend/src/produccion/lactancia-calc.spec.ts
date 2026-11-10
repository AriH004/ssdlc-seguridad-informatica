import { describe, it, expect } from 'vitest';
import {
  derivarLactancia,
  mensajeSinPartoPrevio,
  tienePartoPrevio,
  type EventoLactancia,
} from './lactancia-calc.js';

const ev = (
  id: string,
  tipo: EventoLactancia['tipo'],
  fechaEvento: string,
  extra: Partial<EventoLactancia> = {},
): EventoLactancia => ({
  id,
  tipo,
  fechaEvento,
  fechaRegistro: new Date(`${fechaEvento}T12:00:00Z`),
  ...extra,
});

describe('derivarLactancia', () => {
  it('la baja y el retorno no restauran una lactancia anterior, incluso al corregir la baja', () => {
    const eventos = [ev('i', 'INICIO_LACTANCIA', '2026-10-01'), ev('b', 'BAJA', '2026-10-20'), ev('r', 'REACTIVACION', '2026-10-22')];
    expect(derivarLactancia(eventos, '2026-10-19').enLactancia).toBe(true);
    expect(derivarLactancia(eventos, '2026-10-21').enLactancia).toBe(false);
    expect(derivarLactancia(eventos, '2026-10-22').enLactancia).toBe(false);
    eventos[1].revertido = true;
    expect(derivarLactancia(eventos, '2026-10-22').enLactancia).toBe(false);
  });
  it('un parto abre la lactancia', () => {
    expect(derivarLactancia([ev('p1', 'PARTO', '2026-08-01')], '2026-09-01')).toEqual({
      enLactancia: true,
      fechaInicio: '2026-08-01',
      eventoInicioId: 'p1',
    });
  });

  it('el secado la cierra solo desde su fecha', () => {
    const eventos = [ev('p1', 'PARTO', '2026-01-10'), ev('s1', 'SECADO', '2026-09-15')];
    expect(derivarLactancia(eventos, '2026-09-20').enLactancia).toBe(false);
    expect(derivarLactancia(eventos, '2026-09-10').enLactancia).toBe(true);
  });

  it('un aborto no abre la lactancia', () => {
    expect(
      derivarLactancia([ev('p1', 'PARTO', '2026-08-01', { esAborto: true })], '2026-09-01')
        .enLactancia,
    ).toBe(false);
  });

  it('un aborto posterior no cierra una lactancia abierta', () => {
    const eventos = [
      ev('i1', 'INICIO_LACTANCIA', '2026-05-01'),
      ev('p1', 'PARTO', '2026-08-01', { esAborto: true }),
    ];
    expect(derivarLactancia(eventos, '2026-09-01').eventoInicioId).toBe('i1');
  });

  it('ignora eventos revertidos', () => {
    expect(
      derivarLactancia([ev('p1', 'PARTO', '2026-08-01', { revertido: true })], '2026-09-01')
        .enLactancia,
    ).toBe(false);
  });

  it('sin eventos no está en lactancia', () => {
    expect(derivarLactancia([], '2026-09-01')).toEqual({
      enLactancia: false,
      fechaInicio: null,
      eventoInicioId: null,
    });
  });

  it('inicio y fin manuales abren y cierran', () => {
    const eventos = [
      ev('i1', 'INICIO_LACTANCIA', '2026-09-01'),
      ev('f1', 'FIN_LACTANCIA', '2026-09-20'),
    ];
    expect(derivarLactancia(eventos, '2026-09-10').fechaInicio).toBe('2026-09-01');
    expect(derivarLactancia(eventos, '2026-09-20').enLactancia).toBe(false);
  });

  it('con la misma fecha decide el registrado después', () => {
    const fin = ev('f1', 'FIN_LACTANCIA', '2026-09-10', {
      fechaRegistro: new Date('2026-09-10T08:00:00Z'),
    });
    const inicio = ev('i1', 'INICIO_LACTANCIA', '2026-09-10', {
      fechaRegistro: new Date('2026-09-10T09:00:00Z'),
    });
    expect(derivarLactancia([inicio, fin], '2026-09-10').enLactancia).toBe(true);
    expect(
      derivarLactancia(
        [inicio, { ...fin, fechaRegistro: new Date('2026-09-10T10:00:00Z') }],
        '2026-09-10',
      ).enLactancia,
    ).toBe(false);
  });
});

describe('derivarLactancia: valores límite de fecha', () => {
  const parto = [ev('p1', 'PARTO', '2026-08-01')];

  it('el día anterior al parto aún no está en lactancia; el mismo día sí', () => {
    expect(derivarLactancia(parto, '2026-07-31').enLactancia).toBe(false);
    expect(derivarLactancia(parto, '2026-08-01').enLactancia).toBe(true);
  });

  it('la fecha de referencia con hora se compara solo por día', () => {
    expect(derivarLactancia(parto, '2026-08-01T00:00:00Z').enLactancia).toBe(true);
    expect(derivarLactancia(parto, '2026-07-31T23:59:59Z').enLactancia).toBe(false);
  });

  it('el secado el mismo día de la referencia ya cierra la lactancia; el día anterior no', () => {
    const eventos = [...parto, ev('s1', 'SECADO', '2026-09-15')];
    expect(derivarLactancia(eventos, '2026-09-14').enLactancia).toBe(true);
    expect(derivarLactancia(eventos, '2026-09-15').enLactancia).toBe(false);
  });

  it('un parto revertido deja a la lactancia anterior como la vigente', () => {
    const eventos = [
      ev('p1', 'PARTO', '2026-01-10'),
      ev('p2', 'PARTO', '2026-08-01', { revertido: true }),
    ];
    expect(derivarLactancia(eventos, '2026-09-01').eventoInicioId).toBe('p1');
  });
});

describe('tienePartoPrevio: límite de fecha', () => {
  it('un parto en la misma fecha de referencia cuenta; al día siguiente no', () => {
    const eventos = [ev('p1', 'PARTO', '2026-09-01')];
    expect(tienePartoPrevio(eventos, '2026-09-01')).toBe(true);
    expect(tienePartoPrevio(eventos, '2026-08-31')).toBe(false);
  });
});

describe('tienePartoPrevio', () => {
  it('un parto viable o un aborto cuentan; un inicio de lactancia no', () => {
    expect(tienePartoPrevio([ev('p1', 'PARTO', '2026-08-01')], '2026-09-01')).toBe(true);
    expect(
      tienePartoPrevio([ev('p1', 'PARTO', '2026-08-01', { esAborto: true })], '2026-09-01'),
    ).toBe(true);
    expect(tienePartoPrevio([ev('i1', 'INICIO_LACTANCIA', '2026-08-01')], '2026-09-01')).toBe(
      false,
    );
  });

  it('ignora partos revertidos o posteriores a la fecha', () => {
    expect(
      tienePartoPrevio([ev('p1', 'PARTO', '2026-08-01', { revertido: true })], '2026-09-01'),
    ).toBe(false);
    expect(tienePartoPrevio([ev('p1', 'PARTO', '2026-09-02')], '2026-09-01')).toBe(false);
  });

  it('el mensaje distingue ordeño de inicio de lactancia', () => {
    expect(mensajeSinPartoPrevio('101', 'ordeñarse')).toMatch(/primer parto/);
    expect(mensajeSinPartoPrevio('101', 'iniciar lactancia')).toMatch(/parto o aborto previo/);
  });
});
