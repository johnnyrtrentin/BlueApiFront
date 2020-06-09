import {
    getSessionUserCredentialValue,
    getCurrentPacient
} from './../app.js';

function initMinigameView() {

    $('#content-filters').load("./../shared/commonFilters.html", function () {
        $('#dtPickerIni').datetimepicker({
            format: 'DD/MM/YYYY',
            locale: 'pt-br',
            ignoreReadonly: true,
            allowInputToggle: true,
            useCurrent: false
        });
        $('#dtPickerFim').datetimepicker({
            format: 'DD/MM/YYYY',
            locale: 'pt-br',
            ignoreReadonly: true,
            allowInputToggle: true,
            useCurrent: false
        });
        $('#btnFiltrar').on('click', function () {

            var filterObj = {};

            filterObj.devices = $("#device-name").val();
            filterObj.minigameName = $("#minigame-name").val()

            if ($("#dtPickerIni").data().date != undefined && $("#dtPickerIni").data().date != "") {
                var dtIni = $("#dtPickerIni").data().date.split('/');
                var dtIniTicks = Date.parse(dtIni[1] + "/" + dtIni[0] + "/" + dtIni[2]);

                filterObj.dataIni = dtIni[1] + '-' + dtIni[0] + '-' + dtIni[2]
                if ($("#dtPickerFim").data().date != undefined && $("#dtPickerFim").data().date != "") {

                    var dtFim = $("#dtPickerFim").data().date.split('/');
                    var dtFimTicks = Date.parse(dtFim[1] + "/" + dtFim[0] + "/" + dtFim[2]);

                    if (dtFimTicks < dtIniTicks) {
                        alert('A data final não pode ser menor do que a data inicial!');
                        return false;
                    }
                    filterObj.dataFim = dtFim[1] + '-' + dtFim[0] + '-' + dtFim[2];
                }
            }
            let pacientId = getSessionUserCredentialValue('role') == "Administrator" ? getCurrentPacient("_id") : getSessionUserCredentialValue('pacientId');
            callAjax(pacientId, filterObj);

        });

        if (getSessionUserCredentialValue('role') == "User") {
            document.getElementById('content-info').style.display = "none";
            document.getElementById('minigame-main-container').style.display = '';
            getPacientInfo(getCurrentPacient("_id"));
        } else if (getSessionUserCredentialValue('role') == "Administrator") {
            if ($("#pacient-select").val() != "" && $("#pacient-select").val() != undefined) {
                document.getElementById('content-info').style.display = "none";
                document.getElementById('minigame-main-container').style.display = '';
                getPacientInfo(getCurrentPacient("_id"));
            }
        }
    });
};

function updateMinigameView(pacientId) {
    document.getElementById('minigame-main-container').style.display = '';
    document.getElementById('content-info').style.display = "none";
    refreshCommonFilters();
    getPacientInfo(pacientId);
}

function refreshCommonFilters() {
    $('#dtPickerIni').datetimepicker('clear');
    $('#dtPickerFim').datetimepicker('clear');
}

function getPacientInfo(paciendId) {
    $('#main-content').block({
        message: `Carregando...`
    });

    $.ajax({
        url: `${window.API_ENDPOINT}/pacients/${paciendId}`,
        type: "GET",
        dataType: "json",
        beforeSend: function (r) {
            r.setRequestHeader("GameToken", getSessionUserCredentialValue('gameToken'));
        },
        success: function (d) {

            var pacientSessionDates = d.data.playSessions.map(function (element) {
                let date = new Date(element.created_at);
                return date.toLocaleDateString('pt-br', { day: 'numeric', month: 'numeric', year: 'numeric' });
            });

            $('#dtPickerIni').datetimepicker('enabledDates', pacientSessionDates);
            $('#dtPickerFim').datetimepicker('enabledDates', pacientSessionDates);

            $('#main-content').unblock();

        },
        error: function () {
            $('#main-content').unblock();
            alert("Ocorreu um erro ao carregar os dados. Reinicie a página e tente novamente");
        }
    });
}

function callAjax(userId, filterObj) {
    $('#main-content').block({
        message: `Carregando...`
    });

    let filters = { sort: 'asc' };
    if (filterObj != undefined)
        Object.assign(filters, filters, filterObj);

    $.ajax({
        url: `${window.API_ENDPOINT}/pacients/${userId}/minigames`,
        type: "GET",
        dataType: "json",
        data: filters,
        beforeSend: function (r) {
            r.setRequestHeader("GameToken", getSessionUserCredentialValue('gameToken'));
        },
        success: function (d) {

            if (d.data.length == 0) {
                document.getElementById('plot-info').style.display = "";
                document.getElementById('minigame-chart-container').style.display = "none";

                $('#main-content').unblock();
                return;
            }
            document.getElementById('plot-info').style.display = "none";
            document.getElementById('minigame-chart-container').style.display = "";

            let objValues = d.data.map(function (value) {
                let obj = {}
                obj.date = new Date(value.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'numeric', day: 'numeric' });
                obj.flowValue = value.flowDataRounds.map(x => x.roundFlowScore).sort((a, b) => b - a)[0];
                return obj;
            });

            let groupObjValues = groupByDate(objValues);
            let values = Object.values(groupObjValues);
            let dates = Object.keys(groupObjValues);

            $('#main-content').unblock();
            plot({ values: values, dates: dates });
        },

        error: function () {
            $('#main-content').unblock();
            alert("Ocorreu um erro ao carregar os dados. Reinicie a página e tente novamente"); //alerta de erro
        },

    });
}

function plot(plotObj) {
    var chart = Highcharts.chart('minigame-chart-container', {
        chart: {
            zoomType: 'xy'
        },
        title: {
            text: 'Pico Expiratório minigame'
        },
        xAxis: {
            categories: plotObj.dates,
            tickInterval: 1,
            labels: { enabled: true }
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
            data: plotObj.values,
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

function groupByDate(objList) {
    let dateValues = {};
    objList.forEach(element => {
        if (dateValues[element.date]) {
            dateValues[element.date] = element.flowValue > dateValues[element.date] ? element.flowValue : dateValues[element.date];
        } else {
            dateValues[element.date] = element.flowValue;
        }
    });

    return dateValues;
}

export {
    initMinigameView,
    updateMinigameView
};