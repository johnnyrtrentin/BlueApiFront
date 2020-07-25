import {
    getSessionUserCredentialValue,
    getCurrentPacient
} from './../app.js';

function initCalibrationView() {

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

            filterObj.gameDevice = $("#device-name").val();
            filterObj.calibrationExercise = $("#calibration-exercise").val()

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
            callAjaxCalibrationHistory(pacientId, filterObj);

        });

        if (getSessionUserCredentialValue('role') == "User") {
            document.getElementById('content-info').style.display = "none";
            document.getElementById('calibration-main-container').style.display = '';
            callAjaxCalibrationInfo(getSessionUserCredentialValue('pacientId'));
        } else if (getSessionUserCredentialValue('role') == "Administrator") {
            if ($("#pacient-select").val() != "" && $("#pacient-select").val() != undefined) {
                document.getElementById('content-info').style.display = "none";
                document.getElementById('calibration-main-container').style.display = '';
                callAjaxCalibrationInfo(getCurrentPacient("_id"));
            }
        }
    });
}

function updateCalibrationView(pacientId) {
    if ($("#pacient-select").val() != "") {
        document.getElementById('calibration-main-container').style.display = '';
        document.getElementById('content-info').style.display = "none";
        callAjaxCalibrationInfo(pacientId);
        clearFiltersAndData();
    }
}

function clearFiltersAndData() {
    $('#dtPickerIni').datetimepicker('clear');
    $('#dtPickerFim').datetimepicker('clear');
    //Limpar Highcharts
}

function callAjaxCalibrationInfo(userId) {
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
            //Valores Pitaco
            document.getElementById('table-calibracaoPitaco-picoExp').textContent = `${d.data.capacitiesPitaco.expPeakFlow} L/min`;
            document.getElementById('table-calibracaoPitaco-duracaoExp').textContent = `${d.data.capacitiesPitaco.expFlowDuration} seg`;
            document.getElementById('table-calibracaoPitaco-picoIns').textContent = `${d.data.capacitiesPitaco.insPeakFlow} L/min`;
            document.getElementById('table-calibracaoPitaco-duracaoIns').textContent = `${d.data.capacitiesPitaco.insFlowDuration} seg`;
            document.getElementById('table-calibracaoPitaco-frequencia').textContent = `${d.data.capacitiesPitaco.respiratoryRate} RPM`;

            //Valores Mano
            document.getElementById('table-calibracaoMano-picoExp').textContent = `${d.data.capacitiesMano.expPeakFlow} L/min`;
            document.getElementById('table-calibracaoMano-duracaoExp').textContent = `${d.data.capacitiesMano.expFlowDuration} seg.`;
            document.getElementById('table-calibracaoMano-picoIns').textContent = `${d.data.capacitiesMano.insPeakFlow} L/min`;
            document.getElementById('table-calibracaoMano-duracaoIns').textContent = `${d.data.capacitiesMano.insFlowDuration} seg`;
            document.getElementById('table-calibracaoMano-frequencia').textContent = `${d.data.capacitiesMano.respiratoryRate} rpm`;

            //Valores Cinta
            document.getElementById('table-calibracaoCinta-picoExp').textContent = `${d.data.capacitiesCinta.expPeakFlow} L/min`;
            document.getElementById('table-calibracaoCinta-duracaoExp').textContent = `${d.data.capacitiesCinta.expFlowDuration} seg`;
            document.getElementById('table-calibracaoCinta-picoIns').textContent = `${d.data.capacitiesCinta.insPeakFlow} L/min`;
            document.getElementById('table-calibracaoCinta-duracaoIns').textContent = `${d.data.capacitiesCinta.insFlowDuration} seg`;
            document.getElementById('table-calibracaoCinta-frequencia').textContent = `${d.data.capacitiesCinta.respiratoryRate} rpm`;

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

function callAjaxCalibrationHistory(userId, filterObj) {
    $('#main-content').block({
        message: `Carregando...`
    });

    let filters = { sort: 'asc' };
    if (filterObj != undefined)
        Object.assign(filters, filters, filterObj);

    $.ajax({
        url: `${window.API_ENDPOINT}/pacients/${userId}/calibrations`,
        type: "GET",
        dataType: "json",
        data: filters,
        beforeSend: function (r) {
            r.setRequestHeader("GameToken", getSessionUserCredentialValue('gameToken'));
        },
        success: function (d) {

            if(d.data.length == 0){
                document.getElementById('plot-info').style.display = "";
                document.getElementById('calibration-chart-container').style.display = "none";
                
                $('#main-content').unblock();
                return;
            }
            document.getElementById('plot-info').style.display = "none";
            document.getElementById('calibration-chart-container').style.display = "";
            
            let objValues = d.data.map(function (value) {
                let obj = {}
                obj.date = new Date(value.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'numeric', day: 'numeric' });
                obj.flowValue = value.calibrationValue;
                return obj;
            });

            let groupObjValues = groupByDate(objValues);
            let values = Object.values(groupObjValues);
            let dates = Object.keys(groupObjValues);
            let yTitleText = "";
            let title = "";
            switch (d.data[0].calibrationExercise) {
                case 'ExpiratoryPeak':
                    title = "Picos Expiratórios";
                    yTitleText = 'Litros por Minuto';
                    break;
                case 'InspiratoryPeak':
                    title = "Picos Inspiratórios";
                    yTitleText = 'Litros por Minuto';
                    break;
                case 'ExpiratoryDuration':
                    title = "Durações Expiratórias";
                    yTitleText = 'Segundos'
                    break;
                case 'InspiratoryDuration':
                    title = "Durações Inspiratórias";
                    yTitleText = 'Segundos'
                    break;
                case 'RespiratoryFrequency':
                    title = "Frequências Respiratórias";
                    yTitleText = 'Respirações por minuto';
                    break;
            }

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

    var data = 
    [
        Math.floor(Math.random() * (250 + 100 - 1)) - 100,
        Math.floor(Math.random() * (220 + 100 - 1)) - 100,
        Math.floor(Math.random() * (230 + 100 - 1)) - 100,
        Math.floor(Math.random() * (210 + 100 - 1)) - 100,
        Math.floor(Math.random() * (220 + 100 - 1)) - 100,
        Math.floor(Math.random() * (270 + 100 - 1)) - 100,
        Math.floor(Math.random() * (280 + 100 - 1)) - 100,
        Math.floor(Math.random() * (290 + 100 - 1)) - 100,
        Math.floor(Math.random() * (260 + 100 - 1)) - 100,
        Math.floor(Math.random() * (250 + 100 - 1)) - 100
    ]

    var dates = 
    [
        '01/06/2020',
        '02/06/2020',
        '03/06/2020',
        '04/06/2020',
        '05/06/2020',
        '06/06/2020',
        '07/06/2020',
        '08/06/2020',
        '09/06/2020',
        '10/06/2020',
    ]

    var chart = Highcharts.chart('calibration-chart-container', {
        chart: {
            zoomType: 'xy'
        },
        title: {
            text: plotObj.title
        },
        xAxis: {
            categories: dates,
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
        tooltip: {
            shared: true
        },
        series: [{
            name: 'Fluxo',
            type: 'spline',
            lineWidth: 0.5,
            data: data,
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
    initCalibrationView,
    updateCalibrationView
};