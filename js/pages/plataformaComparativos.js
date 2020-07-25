import {
    getSessionUserCredentialValue,
    getCurrentPacient,
    getAge
} from './../app.js';

function initPlataformCompareView() {
    $('#compare-filters').load("./../shared/compareFilters.html", function () {
        if (getSessionUserCredentialValue('role') == "User") {
            let dateString = getCurrentPacient('birthday');
            let age = getAge(dateString);
            $("#initial-age").val(age - 3);
            $("#final-age").val(age + 3);
            let sex = getCurrentPacient('sex');
            $("pacient-sex").val(sex);
        } else if (getSessionUserCredentialValue('role') == "Administrator") {
            if ($("#pacient-select").val() != "" && $("#pacient-select").val() != undefined) {
                let dateString = getCurrentPacient('birthday');
                let age = getAge(dateString);
                $("#initial-age").val(age - 3);
                $("#final-age").val(age + 3);
                let sex = getCurrentPacient('sex');
                $("pacient-sex").val(sex);
            }
        }
    });

    $('#btnFiltrar').on('click', function () {
        document.getElementById('plataformCompare-chartExpiratory-container').style.display = "";
        document.getElementById('plataformCompare-chartInspiratory-container').style.display = "";

        let filterObj = {};

        filterObj.condition = $("#pacient-condition").val();
        filterObj.sex = $("#pacient-sex").val();
        filterObj.devices = $("#device-name").val();
        let today = new Date();
        if ($("#initial-age").val() !== "") filterObj.toBirthday = today.getFullYear() - $("#initial-age").val() + '-01-01';
        if ($("#final-age").val() !== "") filterObj.fromBirthday = today.getFullYear() - $("#final-age").val() + '-12-31';

        callAjaxRequest(filterObj);
    });


    if (getSessionUserCredentialValue('role') == "User") {
        document.getElementById('content-info').style.display = "none";
        document.getElementById('plataformaComparativos-main-container').style.display = '';
    } else if (getSessionUserCredentialValue('role') == "Administrator") {
        debugger
        if ($("#pacient-select").val() != "" && $("#pacient-select").val() != undefined) {
            document.getElementById('content-info').style.display = "none";
            document.getElementById('plataformaComparativos-main-container').style.display = '';
        }
    }
}

function updatePlataformCompareView() {
    document.getElementById('plataformaComparativos-main-container').style.display = '';
    document.getElementById('content-info').style.display = "none";
    let dateString = getCurrentPacient('birthday');
    let age = getAge(dateString);
    let sex = getCurrentPacient('sex');
    $("#initial-age").val(age - 3);
    $("#final-age").val(age + 3);
    $("pacient-sex").val(sex);
    document.getElementById('plataformCompare-chartInspiratory-container').style.display = 'none';
    document.getElementById('plataformCompare-chartExpiratory-container').style.display = 'none';
    document.getElementById('chartExpiratory-heading').style.display = 'none';
    document.getElementById('chartInspiratory-heading').style.display = 'none';
}

function callAjaxRequest(filterObj) {
    $.ajax({
        url: `${window.API_ENDPOINT}/plataforms/statistics`,
        type: "GET",
        dataType: "json",
        data: filterObj,
        beforeSend: function (r) {
            r.setRequestHeader("GameToken", getSessionUserCredentialValue('gameToken'));
        },
        success: function (d) {

            let flowData = { insFlows: {}, expFlows: {} };

            let flowDataSelectedPacient = d.data.filter(x => x.pacientId == getCurrentPacient("_id"));
            flowDataSelectedPacient[0].maxFlows.sort((a, b) => (a.sessionNumber > b.sessionNumber) ? 1 : ((b.sessionNumber > a.sessionNumber) ? -1 : 0))

            let currentPacientId = getCurrentPacient("_id");
            let flowDataPacients = d.data.filter(x => x.pacientId != currentPacientId);

            flowDataPacients.forEach(element => {
                element.maxFlows.sort((a, b) => (a.sessionNumber > b.sessionNumber) ? 1 : ((b.sessionNumber > a.sessionNumber) ? -1 : 0));
            });

            let flowDataPac = { sessoes: flowDataSelectedPacient[0].maxFlows.length, insFlows: [], expFlows: [] };

            flowDataPacients.map(function (element) {
                for (let index = 0; index < element.maxFlows.length; index++) {
                    if (flowData.expFlows[index] == undefined)
                        flowData.expFlows[index] = [];
                    if (flowData.insFlows[index] == undefined)
                        flowData.insFlows[index] = [];

                    flowData.expFlows[index].push(element.maxFlows[index].maxExpFlow);
                    flowData.insFlows[index].push(element.maxFlows[index].maxInsFlow);
                }
            });

            for (let index = 0; index < flowDataSelectedPacient[0].maxFlows.length; index++) {
                flowDataPac.expFlows.push(flowDataSelectedPacient[0].maxFlows[index].maxExpFlow);
                flowDataPac.insFlows.push(flowDataSelectedPacient[0].maxFlows[index].maxInsFlow);
            }

            let quartilSuperiorExp = [];
            let quartilInferiorExp = [];
            let quartilSuperiorIns = [];
            let quartilInferiorIns = [];

            for (const [key, value] of Object.entries(flowData.expFlows)) {
                value.sort(function (a, b) { return a - b; });
                quartilSuperiorExp.push(quartile(value, .75));
                quartilInferiorExp.push(quartile(value, .25));
            }

            for (const [key, value] of Object.entries(flowData.insFlows)) {
                value.sort(function (a, b) { return a - b; });
                quartilSuperiorIns.push(quartile(value, .75));
                quartilInferiorIns.push(quartile(value, .25));
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

            for (let i = 1; i < quartilSuperiorIns.length - 1; i++) {
                if (quartilSuperiorIns[i] == undefined && quartilSuperiorIns[i - 1] != undefined && quartilSuperiorIns[i + 1] != undefined) {
                    quartilSuperiorIns[i] = quartilSuperiorIns[i - 1] + quartilSuperiorIns[i + 1];
                };
            };
            for (let i = 1; i < quartilInferiorIns.length - 1; i++) {
                if (quartilInferiorIns[i] == undefined && quartilInferiorIns[i - 1] != undefined && quartilInferiorIns[i + 1] != undefined) {
                    quartilInferiorIns[i] = quartilInferiorIns[i - 1] + quartilInferiorIns[i + 1];
                };
            };

            let areaRangeExpValues = [];
            let areaRangeInsValues = [];

            for (let i = 0; i < flowDataPac.sessoes; i++) {
                areaRangeExpValues[i] = [i + 1, quartilInferiorExp[i], quartilSuperiorExp[i]];
                areaRangeInsValues[i] = [i + 1, quartilInferiorIns[i], quartilSuperiorIns[i]];
            }

            let playerLineExpValues = [];
            let playerLineInsValues = [];

            for (let i = 0; i < flowDataPac.sessoes; i++) {
                playerLineExpValues[i] = [i + 1, flowDataPac.expFlows[i]];
                playerLineInsValues[i] = [i + 1, flowDataPac.insFlows[i]];
            }

            let plotObjExp = {
                title: `Dados Comparativos - Picos Expiratórios`,
                yAxisTitleText: "Pico Expiratório (L/min)",
                seriesLineName: 'Picos Expiratórios do paciente selecionado',
                areaRange: areaRangeExpValues,
                lineData: playerLineExpValues
            }

            let plotObjIns = {
                title: `Dados Comparativos - Picos Inspiratórios`,
                yAxisTitleText: "Pico Inspiratório (L/min)",
                seriesLineName: 'Picos Expiratórios do paciente selecionado',
                areaRange: areaRangeInsValues,
                lineData: playerLineInsValues
            }

            document.getElementById('chartInspiratory-heading').style.display = '';
            document.getElementById('chartExpiratory-heading').style.display = '';

            plotExpiratory(plotObjExp);
            plotInspiratory(plotObjIns);

        }
    });
}

function quartile(array, quartile) {
    const pos = (array.length - 1) * quartile;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (array[base + 1] !== undefined) {
        return array[base] + rest * (array[base + 1] - array[base]);
    } else {
        return array[base];
    }
};

function plotExpiratory(plotObj) {

    var ranges = [
        [1, Math.floor(Math.random() * (280 - 270 + 1)) + 270, Math.floor(Math.random() * (140 - 130 + 1)) + 130],
        [2, Math.floor(Math.random() * (270 - 260 + 1)) + 260, Math.floor(Math.random() * (170 - 160 + 1)) + 160],
        [3, Math.floor(Math.random() * (280 - 270 + 1)) + 270, Math.floor(Math.random() * (160 - 150 + 1)) + 150],
        [4, Math.floor(Math.random() * (280 - 270 + 1)) + 270, Math.floor(Math.random() * (150 - 140 + 1)) + 140],
        [5, Math.floor(Math.random() * (280 - 270 + 1)) + 270, Math.floor(Math.random() * (140 - 130 + 1)) + 130],
        [6, Math.floor(Math.random() * (260 - 250 + 1)) + 250, Math.floor(Math.random() * (150 - 140 + 1)) + 140],
        [7, Math.floor(Math.random() * (280 - 270 + 1)) + 270, Math.floor(Math.random() * (120 - 110 + 1)) + 110],
        [8, Math.floor(Math.random() * (270 - 260 + 1)) + 260, Math.floor(Math.random() * (120 - 110 + 1)) + 110],
        [9, Math.floor(Math.random() * (260 - 250 + 1)) + 250, Math.floor(Math.random() * (140 - 130 + 1)) + 130],
        [10, Math.floor(Math.random() * (300 - 290 + 1)) + 290, Math.floor(Math.random() * (140 - 130 + 1)) + 130],
    ],
        averages = [
            [1, Math.floor(Math.random() * (280 - 270 + 1)) + 270],
            [2, Math.floor(Math.random() * (240 - 230 + 1)) + 230],
            [3, Math.floor(Math.random() * (280 - 270 + 1)) + 270],
            [4, Math.floor(Math.random() * (210 - 200 + 1)) + 200],
            [5, Math.floor(Math.random() * (210 - 200 + 1)) + 200],
            [6, Math.floor(Math.random() * (240 - 230 + 1)) + 230],
            [7, Math.floor(Math.random() * (230 - 220 + 1)) + 220],
            [8, Math.floor(Math.random() * (220 - 210 + 1)) + 210],
            [9, Math.floor(Math.random() * (170 - 160 + 1)) + 160],
            [10, Math.floor(Math.random() * (150 - 140 + 1)) + 140],
        ];

    var chart = Highcharts.chart('plataformCompare-chartExpiratory-container', {

        title: {
            text: plotObj.title
        },

        xAxis: {
            type: 'categoryies',
            title: {
                text: 'Sessão'
            },
            tickInterval: 1
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
            data: ranges,
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
            data: averages,
            color: '#0080ff',
            marker: {
                enabled: true,
                symbol: 'circle'

            }
        }]
    });
}

function plotInspiratory(plotObj) {

    var ranges = [
        [1, Math.floor(Math.random() * (-280 + 270 - 1)) - 270, Math.floor(Math.random() * (-140 + 130 - 1)) - 130],
        [2, Math.floor(Math.random() * (-270 + 260 - 1)) - 260, Math.floor(Math.random() * (-170 + 160 - 1)) - 160],
        [3, Math.floor(Math.random() * (-280 + 270 - 1)) - 270, Math.floor(Math.random() * (-160 + 150 - 1)) - 150],
        [4, Math.floor(Math.random() * (-280 + 270 - 1)) - 270, Math.floor(Math.random() * (-150 + 140 - 1)) - 140],
        [5, Math.floor(Math.random() * (-280 + 270 - 1)) - 270, Math.floor(Math.random() * (-140 + 130 - 1)) - 130],
        [6, Math.floor(Math.random() * (-260 + 250 - 1)) - 250, Math.floor(Math.random() * (-150 + 140 - 1)) - 140],
        [7, Math.floor(Math.random() * (-280 + 270 - 1)) - 270, Math.floor(Math.random() * (-120 + 110 - 1)) - 110],
        [8, Math.floor(Math.random() * (-270 + 260 - 1)) - 260, Math.floor(Math.random() * (-120 + 110 - 1)) - 110],
        [9, Math.floor(Math.random() * (-260 + 250 - 1)) - 250, Math.floor(Math.random() * (-140 + 130 - 1)) - 130],
        [10, Math.floor(Math.random() * (-300 + 290 - 1)) - 290, Math.floor(Math.random() * (-140 + 130 - 1)) - 130],
    ],
        averages = [
            [1, Math.floor(Math.random() * (-280 + 270 - 1)) - 270],
            [2, Math.floor(Math.random() * (-240 + 230 - 1)) - 230],
            [3, Math.floor(Math.random() * (-280 + 270 - 1)) - 270],
            [4, Math.floor(Math.random() * (-210 + 200 - 1)) - 200],
            [5, Math.floor(Math.random() * (-210 + 200 - 1)) - 200],
            [6, Math.floor(Math.random() * (-240 + 230 - 1)) - 230],
            [7, Math.floor(Math.random() * (-230 + 220 - 1)) - 220],
            [8, Math.floor(Math.random() * (-220 + 210 - 1)) - 210],
            [9, Math.floor(Math.random() * (-170 + 160 - 1)) - 160],
            [10, Math.floor(Math.random() * (-150 + 140 - 1)) - 140],
        ];

    var chart = Highcharts.chart('plataformCompare-chartInspiratory-container', {

        title: {
            text: plotObj.title
        },

        xAxis: {
            type: 'categoryies',
            title: {
                text: 'Sessão'
            },
            tickInterval: 1
        },

        yAxis: {
            reversed: true,
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
            data: ranges,
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
            data: averages,
            color: '#0080ff',
            marker: {
                enabled: true,
                symbol: 'circle'

            }
        }]
    });
}



export {
    initPlataformCompareView,
    updatePlataformCompareView
}