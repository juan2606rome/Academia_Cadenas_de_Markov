"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Markov = require("./markov.js");

test("la matriz por defecto tiene filas que suman 1", () => {
  assert.deepEqual(Markov.validateMatrix(Markov.DEFAULT_MATRIX), []);

  Markov.DEFAULT_MATRIX.forEach(function (row, index) {
    const sum = row.reduce(function (total, value) {
      return total + value;
    }, 0);

    assert.ok(
      Math.abs(sum - 1) <= Markov.DEFAULT_TOLERANCE,
      "la fila " + (index + 1) + " suma " + sum
    );
  });
});

test("acepta una fila con una diferencia dentro de la tolerancia", () => {
  const matrix = [
    [0.7005, 0.25, 0.05],
    [0.20, 0.55, 0.25],
    [0.05, 0.35, 0.60]
  ];

  assert.deepEqual(Markov.validateMatrix(matrix), []);
});

test("rechaza una fila que no suma 1", () => {
  const matrix = [
    [0.70, 0.25, 0.04],
    [0.20, 0.55, 0.25],
    [0.05, 0.35, 0.60]
  ];

  const errors = Markov.validateMatrix(matrix);

  assert.equal(errors.length, 1);
  assert.match(errors[0], /fila 1 debe sumar 1/);
});

test("rechaza valores negativos", () => {
  const matrix = [
    [0.70, 0.35, -0.05],
    [0.20, 0.55, 0.25],
    [0.05, 0.35, 0.60]
  ];

  const errors = Markov.validateMatrix(matrix);

  assert.ok(errors.some(function (error) {
    return /no puede ser negativo/.test(error);
  }));
});

test("rechaza valores que no son números", () => {
  const matrix = [
    [0.70, 0.30, NaN],
    [0.20, 0.55, 0.25],
    [0.05, 0.35, 0.60]
  ];

  const errors = Markov.validateMatrix(matrix);

  assert.ok(errors.some(function (error) {
    return /debe ser un número/.test(error);
  }));
});

test("rechaza una matriz que no es cuadrada", () => {
  const matrix = [
    [1, 0],
    [0, 1],
    [0, 1]
  ];

  const errors = Markov.validateMatrix(matrix);

  assert.match(errors[0], /fila 1 debe tener 3 valores/);
});

function assertVectorClose(actual, expected, tolerance, message) {
  assert.equal(actual.length, expected.length, message);

  actual.forEach(function (value, index) {
    assert.ok(
      Math.abs(value - expected[index]) <= tolerance,
      (message || "vector") + " en la posición " + index + ": " + value + " vs " + expected[index]
    );
  });
}

test("0 pasos devuelve el vector inicial", () => {
  const vector = Markov.initialVector(1);

  assertVectorClose(
    Markov.distributionAfter(Markov.DEFAULT_MATRIX, vector, 0),
    vector,
    1e-12,
    "0 pasos"
  );
});

test("un paso multiplica el vector inicial por la matriz", () => {
  const result = Markov.distributionAfter(Markov.DEFAULT_MATRIX, Markov.initialVector(0), 1);

  assertVectorClose(result, [0.70, 0.25, 0.05], 1e-12, "1 paso desde Alto");
});

test("el ejemplo de dos estados coincide con el cálculo a mano", () => {
  const matrix = [
    [0.9, 0.1],
    [0.2, 0.8]
  ];
  const initial = [1, 0];

  assertVectorClose(Markov.distributionAfter(matrix, initial, 0), [1, 0], 1e-12, "0 pasos");
  assertVectorClose(Markov.distributionAfter(matrix, initial, 1), [0.9, 0.1], 1e-12, "1 paso");
  assertVectorClose(Markov.distributionAfter(matrix, initial, 2), [0.83, 0.17], 1e-12, "2 pasos");
  assertVectorClose(Markov.distributionAfter(matrix, initial, 3), [0.781, 0.219], 1e-12, "3 pasos");
});

test("cada distribución suma 1", () => {
  [0, 1, 2].forEach(function (stateIndex) {
    const vector = Markov.initialVector(stateIndex);

    [1, 3, 5, 10].forEach(function (steps) {
      const result = Markov.distributionAfter(Markov.DEFAULT_MATRIX, vector, steps);
      const sum = result.reduce(function (total, value) {
        return total + value;
      }, 0);

      assert.ok(
        Math.abs(sum - 1) <= Markov.DEFAULT_TOLERANCE,
        "estado " + stateIndex + " y " + steps + " pasos suman " + sum
      );
    });
  });
});

test("la distribución estacionaria cumple pi = pi * P y suma 1", () => {
  const cases = [
    {
      name: "matriz por defecto",
      matrix: Markov.DEFAULT_MATRIX
    },
    {
      name: "ejemplo de dos estados",
      matrix: [
        [0.9, 0.1],
        [0.2, 0.8]
      ]
    }
  ];

  cases.forEach(function (item) {
    const stationary = Markov.stationaryDistribution(item.matrix);
    const next = Markov.multiplyVectorMatrix(stationary, item.matrix);
    const sum = stationary.reduce(function (total, value) {
      return total + value;
    }, 0);

    assertVectorClose(next, stationary, 1e-9, item.name + ": pi * P");
    assert.ok(Math.abs(sum - 1) <= Markov.DEFAULT_TOLERANCE, item.name + " suma " + sum);
  });

  assertVectorClose(
    Markov.stationaryDistribution([
      [0.9, 0.1],
      [0.2, 0.8]
    ]),
    [2 / 3, 1 / 3],
    1e-9,
    "estacionaria de dos estados"
  );
});

test("los pasos 1, 3, 5 y 10 coinciden con multiplicar paso a paso", () => {
  const vector = Markov.initialVector(0);

  [1, 3, 5, 10].forEach(function (steps) {
    let stepByStep = vector.slice();

    for (let step = 0; step < steps; step++) {
      stepByStep = Markov.multiplyVectorMatrix(stepByStep, Markov.DEFAULT_MATRIX);
    }

    const direct = Markov.distributionAfter(Markov.DEFAULT_MATRIX, vector, steps);

    assertVectorClose(direct, stepByStep, 1e-10, steps + " pasos");
  });
});
