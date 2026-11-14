(function () {
  "use strict";

  var STATES = Markov.STATES;
  var STEPS = [1, 3, 5, 10];
  var LINE_STEPS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  var COLORS = ["#0f766e", "#b45309", "#9f1239"];
  var SVG_NS = "http://www.w3.org/2000/svg";

  var form = document.getElementById("model-form");
  var initialState = document.getElementById("initial-state");
  var matrixInputs = Array.prototype.slice.call(
    document.querySelectorAll("input[data-row][data-column]")
  );
  var errorBox = document.getElementById("error");
  var results = document.getElementById("results");
  var resultsBody = document.getElementById("results-body");
  var barChart = document.getElementById("bar-chart");
  var lineChart = document.getElementById("line-chart");

  function readMatrix() {
    var matrix = STATES.map(function () {
      return new Array(STATES.length).fill(0);
    });

    matrixInputs.forEach(function (input) {
      var row = Number(input.dataset.row);
      var column = Number(input.dataset.column);
      var raw = input.value.trim();

      matrix[row][column] = raw === "" ? NaN : Number(raw);
    });

    return matrix;
  }

  function formatProbability(value) {
    var safe = Math.abs(value) < 0.00005 ? 0 : value;
    return safe.toFixed(4);
  }

  function clearCharts() {
    resultsBody.textContent = "";
    barChart.textContent = "";
    lineChart.textContent = "";
  }

  function showErrors(errors) {
    errorBox.textContent = errors.join(" ");
    errorBox.hidden = false;
    results.hidden = true;
    clearCharts();
  }

  function clearErrors() {
    errorBox.textContent = "";
    errorBox.hidden = true;
  }

  function makeValueCell(value, label) {
    var cell = document.createElement("td");
    cell.dataset.label = label;
    cell.textContent = formatProbability(value);
    return cell;
  }

  function renderTable(stepResults, stationary) {
    resultsBody.textContent = "";

    STATES.forEach(function (state, stateIndex) {
      var row = document.createElement("tr");
      var header = document.createElement("th");

      header.scope = "row";
      header.textContent = state;
      row.appendChild(header);

      stepResults.forEach(function (item) {
        var label = item.step === 1 ? "1 paso" : item.step + " pasos";
        row.appendChild(makeValueCell(item.distribution[stateIndex], label));
      });

      row.appendChild(makeValueCell(stationary[stateIndex], "Estacionaria"));
      resultsBody.appendChild(row);
    });
  }

  function svgElement(name, attributes) {
    var element = document.createElementNS(SVG_NS, name);

    Object.keys(attributes || {}).forEach(function (key) {
      element.setAttribute(key, String(attributes[key]));
    });

    return element;
  }

  function svgText(x, y, content, className, anchor) {
    var text = svgElement("text", {
      x: x,
      y: y,
      "class": className,
      "text-anchor": anchor || "start"
    });

    text.textContent = content;
    return text;
  }

  function addTitle(svg, content) {
    var title = svgElement("title");
    title.textContent = content;
    svg.appendChild(title);
  }

  function addLegend(svg, left, top) {
    var legend = svgElement("g", { "aria-hidden": "true" });

    STATES.forEach(function (state, index) {
      var x = left + index * 92;

      legend.appendChild(
        svgElement("rect", {
          x: x,
          y: top,
          width: 12,
          height: 12,
          rx: 2,
          fill: COLORS[index]
        })
      );
      legend.appendChild(svgText(x + 18, top + 10, state, "legend-label", "start"));
    });

    svg.appendChild(legend);
  }

  function addYAxis(svg, left, top, plotWidth, plotHeight, scale) {
    [0, 0.25, 0.5, 0.75, 1].forEach(function (tick) {
      var y = top + (1 - tick) * plotHeight;

      svg.appendChild(
        svgElement("line", {
          x1: left,
          y1: y,
          x2: left + plotWidth,
          y2: y,
          stroke: "#e4dfd4",
          "stroke-width": 1
        })
      );
      svg.appendChild(svgText(left - 8, y + 3, tick.toFixed(2), "tick-label", "end"));
    });

    svg.appendChild(
      svgElement("line", {
        x1: left,
        y1: top,
        x2: left,
        y2: top + plotHeight,
        stroke: "#b8b1a3",
        "stroke-width": 1
      })
    );
  }

  function addAxisLabels(svg, left, top, plotWidth, plotHeight, height) {
    var probability = svgText(14, top + plotHeight / 2, "Probabilidad", "axis-label", "middle");
    probability.setAttribute("transform", "rotate(-90 14 " + (top + plotHeight / 2) + ")");
    svg.appendChild(probability);
    svg.appendChild(
      svgText(left + plotWidth / 2, height - 10, "Pasos", "axis-label", "middle")
    );
  }

  function renderBarChart(stepResults) {
    barChart.textContent = "";

    var width = 640;
    var height = 360;
    var margin = { top: 44, right: 16, bottom: 52, left: 52 };
    var plotWidth = width - margin.left - margin.right;
    var plotHeight = height - margin.top - margin.bottom;
    var groupWidth = plotWidth / stepResults.length;
    var barGap = 4;
    var barWidth = (groupWidth * 0.72 - barGap * (STATES.length - 1)) / STATES.length;
    var svg = svgElement("svg", {
      viewBox: "0 0 " + width + " " + height,
      role: "img",
      "aria-label": "Gráfica de barras agrupadas por paso"
    });

    addTitle(svg, "Probabilidad de Alto, Medio y Bajo en los pasos 1, 3, 5 y 10");
    addLegend(svg, margin.left, 12);
    addYAxis(svg, margin.left, margin.top, plotWidth, plotHeight);

    stepResults.forEach(function (item, groupIndex) {
      var groupLeft = margin.left + groupIndex * groupWidth;
      var barsLeft = groupLeft + (groupWidth - (barWidth * STATES.length + barGap * (STATES.length - 1))) / 2;

      STATES.forEach(function (state, stateIndex) {
        var value = item.distribution[stateIndex];
        var barHeight = value * plotHeight;
        var x = barsLeft + stateIndex * (barWidth + barGap);
        var y = margin.top + plotHeight - barHeight;
        var bar = svgElement("rect", {
          x: x,
          y: y,
          width: barWidth,
          height: barHeight,
          rx: 3,
          fill: COLORS[stateIndex]
        });

        bar.appendChild(svgElement("title"));
        bar.lastChild.textContent = state + " en " + item.step + " pasos: " + formatProbability(value);
        svg.appendChild(bar);
      });

      var label = svgText(
        groupLeft + groupWidth / 2,
        margin.top + plotHeight + 20,
        item.step === 1 ? "1 paso" : item.step + " pasos",
        "tick-label",
        "middle"
      );

      svg.appendChild(label);
    });

    svg.appendChild(
      svgElement("line", {
        x1: margin.left,
        y1: margin.top + plotHeight,
        x2: margin.left + plotWidth,
        y2: margin.top + plotHeight,
        stroke: "#b8b1a3",
        "stroke-width": 1
      })
    );

    addAxisLabels(svg, margin.left, margin.top, plotWidth, plotHeight, height);
    barChart.appendChild(svg);
  }

  function renderLineChart(lineResults) {
    lineChart.textContent = "";

    var width = 640;
    var height = 360;
    var margin = { top: 44, right: 20, bottom: 52, left: 52 };
    var plotWidth = width - margin.left - margin.right;
    var plotHeight = height - margin.top - margin.bottom;
    var svg = svgElement("svg", {
      viewBox: "0 0 " + width + " " + height,
      role: "img",
      "aria-label": "Gráfica de líneas de 0 a 10 pasos"
    });

    addTitle(svg, "Evolución de la probabilidad de Alto, Medio y Bajo entre 0 y 10 pasos");
    addLegend(svg, margin.left, 12);
    addYAxis(svg, margin.left, margin.top, plotWidth, plotHeight);

    [0, 2, 4, 6, 8, 10].forEach(function (step) {
      var x = margin.left + (step / 10) * plotWidth;

      svg.appendChild(
        svgElement("line", {
          x1: x,
          y1: margin.top,
          x2: x,
          y2: margin.top + plotHeight,
          stroke: "#f0ece3",
          "stroke-width": 1
        })
      );
      svg.appendChild(
        svgText(x, margin.top + plotHeight + 20, String(step), "tick-label", "middle")
      );
    });

    STATES.forEach(function (state, stateIndex) {
      var points = lineResults.map(function (item) {
        return {
          x: margin.left + (item.step / 10) * plotWidth,
          y: margin.top + (1 - item.distribution[stateIndex]) * plotHeight,
          value: item.distribution[stateIndex],
          step: item.step
        };
      });

      svg.appendChild(
        svgElement("polyline", {
          points: points.map(function (point) {
            return point.x + "," + point.y;
          }).join(" "),
          fill: "none",
          stroke: COLORS[stateIndex],
          "stroke-width": 2.5,
          "stroke-linejoin": "round",
          "stroke-linecap": "round"
        })
      );

      points.forEach(function (point) {
        var circle = svgElement("circle", {
          cx: point.x,
          cy: point.y,
          r: 3,
          fill: "#fffdf8",
          stroke: COLORS[stateIndex],
          "stroke-width": 2
        });

        circle.appendChild(svgElement("title"));
        circle.lastChild.textContent =
          state + " en " + point.step + " pasos: " + formatProbability(point.value);
        svg.appendChild(circle);
      });
    });

    svg.appendChild(
      svgElement("line", {
        x1: margin.left,
        y1: margin.top + plotHeight,
        x2: margin.left + plotWidth,
        y2: margin.top + plotHeight,
        stroke: "#b8b1a3",
        "stroke-width": 1
      })
    );

    addAxisLabels(svg, margin.left, margin.top, plotWidth, plotHeight, height);
    lineChart.appendChild(svg);
  }

  function render() {
    var matrix = readMatrix();
    var errors = Markov.validateMatrix(matrix);

    if (errors.length > 0) {
      showErrors(errors);
      return;
    }

    clearErrors();

    try {
      var vector = Markov.initialVector(Number(initialState.value));
      var stepResults = STEPS.map(function (step) {
        return {
          step: step,
          distribution: Markov.distributionAfter(matrix, vector, step)
        };
      });
      var lineResults = LINE_STEPS.map(function (step) {
        return {
          step: step,
          distribution: Markov.distributionAfter(matrix, vector, step)
        };
      });
      var stationary = Markov.stationaryDistribution(matrix);

      renderTable(stepResults, stationary);
      renderBarChart(stepResults);
      renderLineChart(lineResults);
      results.hidden = false;
    } catch (error) {
      showErrors(["No se pudo calcular: " + error.message]);
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    render();
  });
  form.addEventListener("input", render);
  form.addEventListener("change", render);

  render();
})();
