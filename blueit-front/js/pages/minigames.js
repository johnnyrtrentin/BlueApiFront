import {
    getSessionUserCredentialValue
} from './../app.js';

function initMinigameView() {
    if (getSessionUserCredentialValue('role') == "User") {
        callAjax(getSessionUserCredentialValue('pacientId'));
        document.getElementById('content-info').style.display = "none";
        initCommonFilters();
    } else if (getSessionUserCredentialValue('role') == "Administrator") {
        if ($("#pacient-select").val() != "") {
            document.getElementById('content-info').style.display = "none";
            callAjax($("#pacient-select").val());
            initCommonFilters();
        }
    }
}

function initCommonFilters() {
    $('#content-filters').load("./../shared/commonFilters.html", function () {
        $('#dtPickerIni').datetimepicker({
            format: 'DD/MM/YYYY',
            locale: 'pt-br'
        });
        $('#dtPickerFim').datetimepicker({
            format: 'DD/MM/YYYY'
        });

        $('#btnFiltrar').on('click', function () {
            //Enviar 
            var filterObj = {};

            filterObj.devices = $("#device-name").val();

            if ($("#dtPickerIni").data().date != undefined && $("#dtPickerIni").data().date != "") {
                var dtIni = $("#dtPickerIni").data().date.split('/');
                var dtIniTicks = Date.parse(dtIni[1] + "/" + dtIni[0] + "/" + dtIni[2]);

                filterObj.dataIni = dtIni[1] + '-' + dtIni[0] + '-' + dtIni[2]
                if ($("#dtPickerFim").data().date != undefined && $("#dtPickerFim").data().date != "") {
                    debugger
                    var dtFim = $("#dtPickerFim").data().date.split('/');
                    var dtFimTicks = Date.parse(dtFim[1] + "/" + dtFim[0] + "/" + dtFim[2]);

                    if (dtFimTicks < dtIniTicks) {
                        alert('A data final não pode ser menor do que a data inicial!');
                        return false;
                    }
                    filterObj.dataFim = dtFim[1] + '-' + dtFim[0] + '-' + dtFim[2];
                }
            }

            if (getSessionUserCredentialValue('role') == "User") {
                callAjax(getSessionUserCredentialValue('userId'), filterObj);
            } else if (getSessionUserCredentialValue('role') == "Administrator") {
                callAjax($("#pacient-select").val(), filterObj);
            }
        });
    });
}

function callAjax(userId, filterObj) {
    $('#main-content').block({
        message: `Carregando...`
    });
    $.ajax({
        url: window.API_ENDPOINT + "pacients/" + userId + "/minigames",
        type: "GET",
        dataType: "json",
        data: filterObj,
        beforeSend: function (r) {
            r.setRequestHeader("GameToken", getSessionUserCredentialValue('gameToken'));
        },
        success: function (data) {

            var objValues = {
                maiores: [],
                medios: [],
                menores: []
            }

            var values = data.data.map(function (value) {
                var flowValues = value.flowDataRounds.map(x => x.roundFlowScore).sort(function (a, b) {
                    return a - b;
                });
                objValues.maiores.push(flowValues[2]);
                objValues.medios.push(flowValues[1]);
                objValues.menores.push(flowValues[0]);
            });

            var tamEixoX = objValues.maiores.length
            var ArrayTamX = [];
            for (var i = 0; i < tamEixoX; i++) {
                ArrayTamX[i] = (i + 1) + "";
            }
            $('#main-content').unblock();
            plot(objValues);
        },

        error: function () {
            $('#main-content').unblock();
            alert("Ocorreu um erro ao carregar os dados. Reinicie a página e tente novamente"); //alerta de erro
        },

    });
}

function plot(values) {
    var chart = Highcharts.chart('minigame-main-container', {
        chart: {
            zoomType: 'xy'
        },
        title: {
            text: 'Pico Expiratório minigame'
        },
        xAxis: {
            min: 1,
            tickInterval: 1
        },
        yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value} L/min',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                title: {
                    text: 'pico Expiratório',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                }
            },
            { // Secondary yAxis
                title: {
                    text: '',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                labels: {
                    format: '{value}',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                opposite: true
            }
        ],
        tooltip: {
            shared: true
        },
        series: [{
                name: 'Maior pico da sessão',
                type: 'spline',
                lineWidth: 0.5,
                data: values.maiores,
                tooltip: {
                    pointFormat: '<span style="font-weight: bold; color: {series.color}">{series.name}: {point.y:.1f}L/min  </span>'
                }
            },
            {
                name: 'Médio pico da sessão',
                type: 'spline',
                lineWidth: 0.5,
                data: values.medios,
                tooltip: {
                    pointFormat: '<span style="font-weight: bold; color: {series.color}">{series.name}: {point.y:.1f}L/min  </span>'
                }
            },
            {
                name: 'Menor pico da sessão',
                type: 'spline',
                lineWidth: 0.5,
                data: values.menores,
                tooltip: {
                    pointFormat: '<span style="font-weight: bold; color: {series.color}">{series.name}: {point.y:.1f}L/min  </span>'
                }
            }
        ],
        exporting: {
            buttons: {
                contextButton: {
                    menuItems: [
                        'viewFullscreen',
                        'printChart',
                        'downloadPNG',
                        'downloadCSV',
                        'downloadXLS',
                    ]
                }
            }
        }
    });

    chart.reflow();
}

export {
    initMinigameView
};