import {
    getSessionUserCredentialValue
} from './../app.js';

function initPlataformView() {

    $('#content-filters').load("./../shared/commonFilters.html", function () {
        $('#dtPickerIni').datetimepicker({
            format: 'DD/MM/YYYY',
            locale: 'pt-br',
            ignoreReadonly: true,
            allowInputToggle: true
        });
        $('#dtPickerFim').datetimepicker({
            format: 'DD/MM/YYYY',
            locale: 'pt-br',
            ignoreReadonly: true,
            allowInputToggle: true
        });
        $('#btnFiltrar').on('click', function () {

            var filterObj = {};

            filterObj.gameDevice = $("#device-name").val();

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
            let pacientId = getSessionUserCredentialValue('role') == "Administrator" ? $("#pacient-select").val() : getSessionUserCredentialValue('pacientId');
            callAjaxPlataformHistory(pacientId, filterObj);

        });

        if (getSessionUserCredentialValue('role') == "User") {
            document.getElementById('content-info').style.display = "none";
            document.getElementById('plataform-main-container').style.display = '';
            callAjaxPlataformInfo(getSessionUserCredentialValue('pacientId'));
        } else if (getSessionUserCredentialValue('role') == "Administrator") {
            if ($("#pacient-select").val() != "" && $("#pacient-select").val() != undefined) {
                document.getElementById('content-info').style.display = "none";
                document.getElementById('plataform-main-container').style.display = '';
                callAjaxPlataformInfo($("#pacient-select").val());
            }
        }
    });
}

function updatePlataformView() {
    if ($("#pacient-select").val() != "") {
        document.getElementById('plataform-main-container').style.display = '';
        document.getElementById('content-info').style.display = "none";
        callAjaxPlataformInfo($("#pacient-select").val());
        clearFiltersAndData();
    }
}

function clearFiltersAndData() {
    $('#dtPickerIni').datetimepicker('clear');
    $('#dtPickerFim').datetimepicker('clear');
    document.getElementById('plataform-chart-container').style.display = 'none';
    //Limpar Highcharts
}

function callAjaxPlataformInfo(userId) {
    $('#main-content').block({
        message: `Carregando...`
    });

    $.ajax({
        url: `${window.API_ENDPOINT}/pacients/${userId}`,
        type: "GET",
        dataType: "json",
        beforeSend: function (r) {
            r.setRequestHeader("GameToken", getSessionUserCredentialValue('gameToken'));
        },
        success: function (d) {
            debugger
            // Pontuação Acumulada
            let el = document.getElementById('card-pontuacao');
            let textNode = document.createTextNode(d.data.accumulatedScore);
            el.appendChild(textNode);

            // Níveis desbloqueados
            el = document.getElementById('card-niveis');
            textNode = document.createTextNode(d.data.unlockedLevels);
            el.appendChild(textNode);

            // Sessões Jogadas
            el = document.getElementById('card-jogadas');
            textNode = document.createTextNode(d.data.playSessionsDone);
            el.appendChild(textNode);

            var pacientSessionDates = d.data.playSessions.map(function(element){
                let date = new Date(element.created_at);
                return date.toLocaleDateString('pt-br', {day: 'numeric', month:'numeric', year:'numeric'});
            });
            
            $('#dtPickerIni').datetimepicker('enabledDates',pacientSessionDates);
            $('#dtPickerFim').datetimepicker('enabledDates',pacientSessionDates);

            $('#main-content').unblock();
        },
        error: function () {
            $('#main-content').unblock();
            alert("Ocorreu um erro ao carregar os dados. Reinicie a página e tente novamente");
        }
    });
}

function callAjaxPlataformHistory(userId, filterObj) {
    $('#main-content').block({
        message: `Carregando...`
    });

    let filters = { sort: 'asc' };
    if (filterObj != undefined)
        Object.assign(filters, filters, filterObj);

    $.ajax({
        url: `${window.API_ENDPOINT}/pacients/${userId}/plataforms/statistics`,
        type: "GET",
        dataType: "json",
        data: filters,
        beforeSend: function (r) {
            r.setRequestHeader("GameToken", getSessionUserCredentialValue('gameToken'));
        },
        success: function (d) {

            if (d.data.length == 0) {
                document.getElementById('plot-info').style.display = "";
                document.getElementById('plataform-chart-container').style.display = "none";

                $('#main-content').unblock();
                return;
            }
            document.getElementById('plot-info').style.display = "none";
            document.getElementById('plataform-chart-container').style.display = "";

            let objValues = d.data.map(function (value) {
                let obj = {}
                obj.date = value.created_at;
                obj.maxExpFlow = value.maxExpFlow;
                obj.maxInsFlow = value.maxInsFlow;
                return obj;
            });
            debugger;
            let groupObjValues = groupByDate(objValues);
            let maxExpFlows = Object.values(groupObjValues).map(x => x.maxExpFlow);
            let maxInsFlows = Object.values(groupObjValues).map(x => x.maxInsFlow);
            let values = { expFlows: maxExpFlows, insFlows: maxInsFlows };
            let dates = Object.keys(groupObjValues);
            let yTitleText = "L/min";
            let title = "Plataforma";

            $('#main-content').unblock();
            plot({ values: values, dates: dates, title: title, yTitleText: yTitleText });
        },
        error: function () {
            $('#main-content').unblock();
            alert("Ocorreu um erro ao carregar os dados. Reinicie a página e tente novamente");
        }
    });
}

function plot(plotObj) {
    var chart = Highcharts.chart('plataform-chart-container', {
        chart: {
            type: 'column'
        },
        title: {
            text: plotObj.title
        },
        xAxis: {
            categories: plotObj.dates,
            tickInterval: 1,
            labels: { enabled: true }
        },
        yAxis: [{ // Primary yAxis
            labels: {
                format: '{value}',
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            },
            title: {
                text: plotObj.yTitleText,
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            }
        }],
        plotOptions: {
            column: {
                stacking: 'normal'
            }
        },
        series: [
            {
                name: 'Pico Expiratório',
                data: plotObj.values.expFlows
            },
            {
                name: 'Pico Inspiratório',
                data: plotObj.values.insFlows
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
            dateValues[element.date].maxExpFlow = element.maxExpFlow > dateValues[element.date].maxExpFlow ? element.maxExpFlow : dateValues[element.date].maxExpFlow
            dateValues[element.date].maxInsFlow = element.maxInsFlow < dateValues[element.date].maxInsFlow ? element.maxInsFlow : dateValues[element.date].maxInsFlow;
        } else {
            dateValues[element.date] = { maxExpFlow: element.maxExpFlow, maxInsFlow: element.maxInsFlow };
        }
    });

    return dateValues;
}


export {
    initPlataformView,
    updatePlataformView
};