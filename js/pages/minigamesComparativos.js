import {
    getSessionUserCredentialValue,
    getCurrentPacient,
    getAge
} from './../app.js';

function initMinigameCompareView() {

    $('#compare-filters').load("./../shared/compareFilters.html", function () {
        let dateString = getCurrentPacient('birthday');
        let age = getAge(dateString);
        $("#initial-age").val(age - 3);
        $("#final-age").val(age + 3);
        let sex = getCurrentPacient('sex');
        $("pacient-sex").val(sex);
    });

    $('#btnFiltrar').on('click', function () {
        document.getElementById('minigamesCompare-chart-container').style.display = "";

        var filterObj = {};

        filterObj.condition = $("#pacient-condition").val();
        filterObj.sex = $("#pacient-sex").val();
        filterObj.devices = $("#device-name").val();
        filterObj.minigameName = $("#minigame-name").val();

        var today = new Date();
        if ($("#initial-age").val() !== "") filterObj.toBirthday = today.getFullYear() - $("#initial-age").val() + '-01-01';
        if ($("#final-age").val() !== "") filterObj.fromBirthday = today.getFullYear() - $("#final-age").val() + '-12-31';

        callAjaxRequest(filterObj);

    });

    if (getSessionUserCredentialValue('role') == "User") {
        document.getElementById('content-info').style.display = "none";
        document.getElementById('minigamesComparativos-main-container').style.display = '';
    } else if (getSessionUserCredentialValue('role') == "Administrator") {
        if ($("#pacient-select").val() != "" && $("#pacient-select").val() != undefined) {
            document.getElementById('content-info').style.display = "none";
            document.getElementById('minigamesComparativos-main-container').style.display = '';
        }
    }
};

function updateMinigameCompareView() {
    document.getElementById('minigamesComparativos-main-container').style.display = '';
    document.getElementById('content-info').style.display = "none";
    document.getElementById('minigamesCompare-chart-container').style.display = 'none';
    let dateString = getCurrentPacient('birthday');
    let age = getAge(dateString);
    let sex = getCurrentPacient('sex');
    $("#initial-age").val(age - 3);
    $("#final-age").val(age + 3);
    $("pacient-sex").val(sex);
}

function callAjaxRequest(filterObj) {
    $('#main-content').block({
        message: `Carregando...`
    });

    let filters = { sort: 'asc' };
    if (filterObj != undefined) {
        Object.assign(filters, filters, filterObj);
    }

    $.ajax({
        url: `${window.API_ENDPOINT}/minigames/statistics`,
        type: "GET",
        dataType: "json",
        data: filters,
        beforeSend: function (r) {
            r.setRequestHeader("GameToken", getSessionUserCredentialValue('gameToken'));
        },
        success: function (d) {

            let flowData = { flows: {} };

            let flowDataSelectedPacient = d.data.filter(x => x.pacientId == getCurrentPacient("_id"));
            flowDataSelectedPacient[0].maxFlows.sort((a, b) => (a.sessionNumber > b.sessionNumber) ? 1 : ((b.sessionNumber > a.sessionNumber) ? -1 : 0))

            let currentPacientId = getCurrentPacient("_id");
            let flowDataPacients = d.data.filter(x => x.pacientId != currentPacientId);

            flowDataPacients.forEach(element => {
                element.maxFlows.sort((a, b) => (a.sessionNumber > b.sessionNumber) ? 1 : ((b.sessionNumber > a.sessionNumber) ? -1 : 0));
            });

            let flowDataPac = { sessoes: flowDataSelectedPacient[0].maxFlows.length, flows: [] };

            flowDataPacients.map(function (element) {
                for (let index = 0; index < element.maxFlows.length; index++) {
                    if (flowData.flows[index] == undefined)
                        flowData.flows[index] = [];

                    flowData.flows[index].push(element.maxFlows[index].flow);
                }
            });

            for (let index = 0; index < flowDataSelectedPacient[0].maxFlows.length; index++) {
                flowDataPac.flows.push(flowDataSelectedPacient[0].maxFlows[index].flow);
            }

            let quartilSuperiorExp = [];
            let quartilInferiorExp = [];

            for (const [key, value] of Object.entries(flowData.flows)) {
                value.sort(function (a, b) { return a - b; });
                quartilSuperiorExp.push(quantile(value, .75));
                quartilInferiorExp.push(quantile(value, .25));
            }

            for (let i = 1; i < quartilSuperiorExp.length - 1; i++) {
                if (quartilSuperiorExp[i] == undefined && quartilSuperiorExp[i - 1] != undefined && quartilSuperiorExp[i + 1] != undefined) {
                    quartilSuperiorExp[i] = quartilSuperiorExp[i - 1] + quartilSuperiorExp[i + 1];
                };
            };
            for (let i = 1; i < quartilInferiorExp.length - 1; i++) {
                if (quartilInferiorExp[i] == undefined && quartilInferiorExp[i - 1] != undefined && quartilInferiorExp[i + 1] != undefined) {
                    quartilInferiorExp[i] = quartilInferiorExp[i - 1] + quartilInferiorExp[i + 1];
                };
            };

            let areaRangeValues = [];
            for (let i = 0; i < flowDataPac.sessoes; i++) {
                areaRangeValues[i] = [i + 1, quartilInferiorExp[i], quartilSuperiorExp[i]];
            }

            let playerLineValues = [];
            for (let i = 0; i < flowDataPac.sessoes; i++) {
                playerLineValues[i] = [i + 1, flowDataPac.flows[i]];
            }
            
            let plotObj = {
                title: `Dados Comparativos - Minigame [${$("#minigame-name").val() === "CakeGame" ? "Velas no Bolo" : "Copo D'Água"}]`,
                yAxisTitleText: $("#minigame-name").val() === "CakeGame" ? "Pico Expiratório (L/min)" : "Pico Inspiratório (L/min)",
                seriesLineName: 'Picos Expiratórios do paciente selecionado',
                areaRange: areaRangeValues,
                lineData: playerLineValues
            }

            plot(plotObj);
        }
    });


    $('#main-content').unblock();
}

//Needs to be a sorted array (ascending)
function quantile(array, quartile) {
    const pos = (array.length - 1) * quartile;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (array[base + 1] !== undefined) {
        return array[base] + rest * (array[base + 1] - array[base]);
    } else {
        return array[base];
    }
};

function plot(plotObj) {
    var chart = Highcharts.chart('minigamesCompare-chart-container', {

        chart: {
            zoomType: 'x'
        },
        title: {
            text: plotObj.title
        },
        xAxis: {
            type: 'categoryies',
            title: {
                text: 'Sessão'
            },
            tickInterval: 1,
            step: 1
        },
        yAxis: {
            title: {
                text: plotObj.yAxisTitleText
            },
        },

        responsive: {
            rules: [{
                condition: {
                    maxWidth: 500
                },
            }],
        },

        tooltip: {
            crosshairs: true,
            shared: true,
            valueSuffix: 'L/min'
        },

        series: [{
            name: 'Valores esperados considerando o filtro selecionado',
            data: plotObj.areaRange,
            type: 'arearange',
            lineWidth: 0.3,
            color: '#68d2f2',
            fillOpacity: 0.4,
            zIndex: 0,
            marker: {
                enabled: true,
                symbol: 'diamond',
                radius: 2
            }


        }, {
            name: plotObj.seriesLineName,
            data: plotObj.lineData,
            color: '#0080ff',
            marker: {
                enabled: true,
                symbol: 'circle'

            }

        }]
    });
}

export {
    initMinigameCompareView,
    updateMinigameCompareView
}
