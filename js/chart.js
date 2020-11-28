import { getSessionUserCredentialValue } from "../js/app.js";

let graphData;

/**
 * Dados retornados da API de detecção de anomalia da azure
 * @param {object} data
 */
function responseData(data) {
  if (!data) {
    return;
  }

  const {
    dataPoints,
    anomalyData: { expectedValues, upperMargins, lowerMargins },
  } = data;

  graphData = { expectedValues, lowerMargins, upperMargins, dataPoints };
}

/**
 * Calcula os valores mínimos para o grafico
 */
function getLowerValues() {
  return graphData.expectedValues.map(
    (expectedValue, expectedIndex) =>
      (expectedValue - graphData.lowerMargins[expectedIndex])
  );
}

/**
 * Calcula os valores máximos para o gráfico
 */
function getUpperValues() {
  return graphData.expectedValues.map(
    (expectedValue, expectedIndex) =>
      expectedValue + graphData.upperMargins[expectedIndex]
  );
}

/**
 * Retorna a data da API
 */
function getDataDate() {
  return graphData.dataPoints.map((value) => value["timestamp"]);
}

/**
 * Retorna os valores da API
 */
function getDataValue() {
  return graphData.dataPoints.map((value) => value["value"]);
}

/**
 * Retorna um array contendo os dados enviados para a API de detector de anomalias,
 * os valores mínimos, e os valores máximos
 * @returns Array com os dados de entrada, valor mínimo e valor máximo
 */
function range() {
  return getDataDate().map((data, index) => [
    data,
    getLowerValues()[index],
    getUpperValues()[index],
  ]);
}

/**
 * Retorna um array contendo os dados enviados para a API de detector de anomalias
 * @returns Array com a data e o valor 
 */
function average() {
  return getDataDate().map((value, index) => [value, getDataValue()[index]]);
}

/**
 * Altera a propriedade display dos elementos
 * responsáveis pro exibir o chart no dashboard.
 */
function displayChart() {
    document.getElementById("plot-info").style.display = "none";
    document.getElementById("calibration-chart-container").style.display = "";
  }

/**
 * busca os metadados e cria o chart de detector de anomalias
 * @param {string} chartContainerElement id do container onde será renderizado o chart
 */
export function createChart(chartContainerElement) {
  Highcharts.chart(chartContainerElement, {
    title: {
      text: "Anomalias Respiratórias",
    },
    xAxis: {
      type: "datetime",
    },
    yAxis: {
      title: {
        text: null,
      },
    },
    tooltip: {
      crosshairs: true,
      shared: true,
    },
    series: [
      {
        name: "Frequência Respiratória",
        data: average(),
        zIndex: 1,
        marker: {
          fillColor: "white",
          lineWidth: 2,
          lineColor: Highcharts.getOptions().colors[0],
        },
      },
      {
        name: "Minímo/Máximo",
        data: range(),
        type: "arearange",
        lineWidth: 0,
        linkedTo: ":previous",
        color: Highcharts.getOptions().colors[0],
        fillOpacity: 0.3,
        zIndex: 0,
        marker: {
          enabled: false,
        },
      },
    ],
  });

  displayChart();
}

/**
 * Realiza a busca na API de Serviços Cognitivos Detecção de anomalias.
 */
export function fetchChartData() {
  $("#main-content").block({
    message: `Carregando...`,
  });

  $.ajax({
    url: `${window.API_ENDPOINT}/pacients/5ecdaa5d0468d84facbb1ae5/calibrations?sort=asc&gameDevice=Pitaco&calibrationExercise=RespiratoryFrequency`,
    type: "GET",
    dataType: "json",
    beforeSend: function (r) {
      r.setRequestHeader(
        "GameToken",
        getSessionUserCredentialValue("gameToken")
      );
    },
    success: function (response) {
      $("#main-content").unblock();
      responseData(response.data);
      createChart("calibration-chart-container");
    },
    error: function () {
      $("#main-content").unblock();
      alert(
        "Ocorreu um erro ao carregar os dados. Reinicie a página e tente novamente"
      );
    },
  });
}