(function (root, factory) {
  "use strict";

  var api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.Markov = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var STATES = ["Alto", "Medio", "Bajo"];

  var DEFAULT_MATRIX = [
    [0.70, 0.25, 0.05],
    [0.20, 0.55, 0.25],
    [0.05, 0.35, 0.60]
  ];

  var DEFAULT_TOLERANCE = 0.001;

  function initialVector(stateIndex, size) {
    var count = typeof size === "number" ? size : STATES.length;

    if (!Number.isInteger(stateIndex) || stateIndex < 0 || stateIndex >= count) {
      throw new Error("El estado inicial no es válido.");
    }

    var vector = new Array(count).fill(0);
    vector[stateIndex] = 1;
    return vector;
  }

  function assertSquareMatrix(matrix) {
    if (!Array.isArray(matrix) || matrix.length === 0) {
      throw new Error("La matriz debe tener al menos una fila.");
    }

    var size = matrix.length;

    for (var i = 0; i < size; i++) {
      if (!Array.isArray(matrix[i]) || matrix[i].length !== size) {
        throw new Error("La matriz debe ser cuadrada.");
      }
    }

    return size;
  }

  function multiplyVectorMatrix(vector, matrix) {
    var size = assertSquareMatrix(matrix);

    if (!Array.isArray(vector) || vector.length !== size) {
      throw new Error("El vector y la matriz deben tener el mismo tamaño.");
    }

    var result = new Array(size).fill(0);

    for (var column = 0; column < size; column++) {
      var sum = 0;

      for (var row = 0; row < size; row++) {
        sum += vector[row] * matrix[row][column];
      }

      result[column] = sum;
    }

    return result;
  }

  function multiplyMatrices(left, right) {
    var size = assertSquareMatrix(left);
    assertSquareMatrix(right);

    if (right.length !== size) {
      throw new Error("Las matrices deben tener el mismo tamaño.");
    }

    var result = [];

    for (var row = 0; row < size; row++) {
      var nextRow = new Array(size).fill(0);

      for (var column = 0; column < size; column++) {
        var sum = 0;

        for (var index = 0; index < size; index++) {
          sum += left[row][index] * right[index][column];
        }

        nextRow[column] = sum;
      }

      result.push(nextRow);
    }

    return result;
  }

  function identityMatrix(size) {
    var result = [];

    for (var row = 0; row < size; row++) {
      var nextRow = new Array(size).fill(0);
      nextRow[row] = 1;
      result.push(nextRow);
    }

    return result;
  }

  function matrixPower(matrix, steps) {
    var size = assertSquareMatrix(matrix);

    if (!Number.isInteger(steps) || steps < 0) {
      throw new Error("Los pasos deben ser un entero mayor o igual a 0.");
    }

    var result = identityMatrix(size);

    for (var step = 0; step < steps; step++) {
      result = multiplyMatrices(result, matrix);
    }

    return result;
  }

  function distributionAfter(matrix, vector, steps) {
    return multiplyVectorMatrix(vector, matrixPower(matrix, steps));
  }

  function validateMatrix(matrix, tolerance) {
    var limit = typeof tolerance === "number" ? tolerance : DEFAULT_TOLERANCE;
    var errors = [];

    if (!Array.isArray(matrix) || matrix.length === 0) {
      return ["La matriz debe tener al menos una fila."];
    }

    var size = matrix.length;

    for (var row = 0; row < size; row++) {
      var values = matrix[row];

      if (!Array.isArray(values) || values.length !== size) {
        errors.push("La fila " + (row + 1) + " debe tener " + size + " valores.");
        continue;
      }

      var sum = 0;
      var hasInvalidValue = false;

      for (var column = 0; column < size; column++) {
        var value = values[column];

        if (typeof value !== "number" || !Number.isFinite(value)) {
          errors.push(
            "El valor de la fila " + (row + 1) + ", columna " + (column + 1) + " debe ser un número."
          );
          hasInvalidValue = true;
        } else if (value < 0) {
          errors.push(
            "El valor de la fila " + (row + 1) + ", columna " + (column + 1) + " no puede ser negativo."
          );
          sum += value;
        } else {
          sum += value;
        }
      }

      if (!hasInvalidValue && Math.abs(sum - 1) > limit) {
        errors.push(
          "La fila " + (row + 1) + " debe sumar 1 (suma " + sum.toFixed(4) + ")."
        );
      }
    }

    return errors;
  }

  function solveLinearSystem(matrix, values, epsilon) {
    var size = matrix.length;
    var augmented = [];

    for (var row = 0; row < size; row++) {
      augmented.push(matrix[row].slice().concat(values[row]));
    }

    var pivotRow = 0;
    var pivotColumns = [];

    for (var column = 0; column < size && pivotRow < size; column++) {
      var bestRow = pivotRow;

      for (var candidate = pivotRow + 1; candidate < size; candidate++) {
        if (Math.abs(augmented[candidate][column]) > Math.abs(augmented[bestRow][column])) {
          bestRow = candidate;
        }
      }

      if (Math.abs(augmented[bestRow][column]) < epsilon) {
        continue;
      }

      var swap = augmented[pivotRow];
      augmented[pivotRow] = augmented[bestRow];
      augmented[bestRow] = swap;

      var pivot = augmented[pivotRow][column];

      for (var normalize = column; normalize <= size; normalize++) {
        augmented[pivotRow][normalize] /= pivot;
      }

      for (var other = 0; other < size; other++) {
        if (other === pivotRow) {
          continue;
        }

        var factor = augmented[other][column];

        if (Math.abs(factor) < epsilon) {
          continue;
        }

        for (var update = column; update <= size; update++) {
          augmented[other][update] -= factor * augmented[pivotRow][update];
        }
      }

      pivotColumns.push(column);
      pivotRow++;
    }

    for (var check = 0; check < size; check++) {
      var hasCoefficient = false;

      for (var coefficient = 0; coefficient < size; coefficient++) {
        if (Math.abs(augmented[check][coefficient]) > epsilon) {
          hasCoefficient = true;
          break;
        }
      }

      if (!hasCoefficient && Math.abs(augmented[check][size]) > epsilon) {
        throw new Error("El sistema no tiene solución.");
      }
    }

    var solution = new Array(size).fill(0);

    for (var index = 0; index < pivotColumns.length; index++) {
      solution[pivotColumns[index]] = augmented[index][size];
    }

    return solution;
  }

  function stationaryDistribution(matrix, tolerance) {
    var size = assertSquareMatrix(matrix);
    var epsilon = typeof tolerance === "number" ? tolerance : 1e-10;
    var equations = [];

    for (var row = 0; row < size - 1; row++) {
      var nextRow = [];

      for (var column = 0; column < size; column++) {
        nextRow.push(matrix[column][row] - (row === column ? 1 : 0));
      }

      equations.push(nextRow);
    }

    equations.push(new Array(size).fill(1));

    var values = new Array(size - 1).fill(0);
    values.push(1);

    var solution = solveLinearSystem(equations, values, epsilon);
    var cleaned = solution.map(function (value) {
      return Math.abs(value) < epsilon * 10 ? 0 : value;
    });

    var sum = 0;

    for (var index = 0; index < cleaned.length; index++) {
      sum += cleaned[index];
    }

    if (!Number.isFinite(sum) || Math.abs(sum) < epsilon) {
      throw new Error("No se pudo normalizar la distribución estacionaria.");
    }

    return cleaned.map(function (value) {
      return value / sum;
    });
  }

  return {
    STATES: STATES,
    DEFAULT_MATRIX: DEFAULT_MATRIX,
    DEFAULT_TOLERANCE: DEFAULT_TOLERANCE,
    initialVector: initialVector,
    validateMatrix: validateMatrix,
    multiplyVectorMatrix: multiplyVectorMatrix,
    multiplyMatrices: multiplyMatrices,
    matrixPower: matrixPower,
    distributionAfter: distributionAfter,
    stationaryDistribution: stationaryDistribution
  };
});
