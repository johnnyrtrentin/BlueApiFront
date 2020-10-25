import {
    getSessionUserCredentialValue,
    getCurrentPacient,
} from './../app.js';

import {
    Max_Score_Plataforma
} from './../consts.js';


function initPlataformView() {

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
                callAjaxPlataformInfo(getCurrentPacient("_id"));
            }
        }
    });
}

function updatePlataformView() {
    if ($("#pacient-select").val() != "") {
        document.getElementById('plataform-main-container').style.display = '';
        document.getElementById('content-info').style.display = "none";
        callAjaxPlataformInfo(getCurrentPacient("_id"));
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
                obj.maxScore = value.maxScore;
                obj.scoreRatio = value.scoreRatio;
                obj.fase = value.phase;
                obj.level = value.level;
                return obj;
            });

            let groupObjValues = groupByDate(objValues);
            var values = [];
            let dates = Object.keys(groupObjValues);
            let yTitleText = "L/min";
            let title = "Plataforma";
            let maxscoredata = [];
            let n = 0; let i = 0; let j = 0;
            let PosFlag1 = 0; let PosFlag2 = 0; let PosFlag3 = 0;
            let namecompmax = "";
            let yLabel = "";
            let maxyaxis = null;
            let passoy = null;
            let PosFlagY = 50;

            switch ($("#plataform-view").val()) {

                case 'expiratory_peak':
                    values = Object.values(groupObjValues).map(x => x.maxExpFlow);
                    title = "Pico Expiratório Plataforma";

                    break;

                case 'inspiratory_peak':
                    values = Object.values(groupObjValues).map(x => x.maxInsFlow);
                    title = "Pico Inspiratório Plataforma";
                    break;

                case 'score':

                    ///*            START              */            
                    for (n = 0; n < objValues.length; n++) {
                        for (j = 1; j <= 3; j++) {
                            if (objValues[n].fase == j) {
                                for (i = 1; i <= 9; i++) {
                                    if (objValues[n].level == i) {
                                        let a = (9 * (j - 1)) + (i - 1);
                                        if (values[a] == undefined || values[a] == "") {
                                            values[a] = 0;
                                        }
                                        if (objValues[n].maxScore > values[a] && objValues[n].maxScore != undefined) {
                                            values[a] = objValues[n].maxScore;
                                        }
                                    }
                                }
                            }

                        }
                    }

                    ///*               END           */    Atribuir e fazer as comparações com 'map'

                    /////////
                    //       //dado fake para teste.
                    //  values =  [1499, 715, 1064, 1292, 1440, 1760, 1356, 1485, 5164,
                    //       3941, 2956, 4544, 2356, 1564, 2356, 3564, 4521, 4856,
                    //       3156, 3989, 1568, 4362];
                    ///////////

                    ///*             START             */  
                    for (i = 0; i < values.length; i++) {
                        if (values[i] == undefined) {
                            values[i] = '';
                        }
                    }

                    ///*              END            */    Pode se tornar desnecessário ou ser incluso na atribuição de "values"


                    ////OBS: posicionamento do flag de Fase
                    if (values.length <= 9) {
                        PosFlag1 = (values.length / 2) - 0.5;
                        PosFlag2 = 10;
                        PosFlag3 = 10;
                    }
                    if (values.length > 9 && values.length <= 18) {
                        PosFlag1 = 4;
                        PosFlag2 = (values.length / 2) + 4;
                        PosFlag3 = 22;
                    }
                    if (values.length > 18) {
                        PosFlag1 = 4;
                        PosFlag2 = 13;
                        PosFlag3 = (values.length / 2) + 8.5;
                    }


                    title = "Pontuação Plataforma";
                    yTitleText = "Pontuação";
                    yLabel = "pontos";


                    ///*             START             */ 
                    namecompmax = "Pontuação máxima"
                    for (let i = 0; i < values.length; i++) {
                        maxscoredata[i] = Max_Score_Plataforma[i];
                    }

                    ///*            END              */    Atribuir com 'map'???
                    break;


                case 'ratio':


                    ///*            START              */
                    for (n = 0; n < objValues.length; n++) {
                        for (j = 1; j <= 3; j++) {
                            if (objValues[n].fase == j) {
                                for (i = 1; i <= 9; i++) {
                                    if (objValues[n].level == i) {
                                        let a = (9 * (j - 1)) + (i - 1);
                                        if (values[a] == undefined || values[a] == "") {
                                            values[a] = 0;
                                        }
                                        if ((100 * objValues[n].scoreRatio) > values[a] && objValues[n].scoreRatio != undefined) {
                                            values[a] = 100 * objValues[n].scoreRatio;
                                        }
                                    }
                                }
                            }

                        }
                    }

                    ///*           END               */    Atribuir e fazer as comparações com 'map'

                    ///////////       //dado fake para teste.
                    //   values =  [100, 100, 90, 98, 90, 70, 60, 78, 77,
                    //      87.6, 65, 76, 90, 87, 81, 92, 73, 75,
                    //       71, 62, 53, 46];
                    //       
                    ////////////

                    ///*             START             */
                    for (i = 0; i < values.length; i++) {
                        if (values[i] == undefined) {
                            values[i] = '';
                        }
                    }
                    ///*           END               */    Provavelmente pode ser feito na atrbuição de "values"


                    ////OBS: posicionamento do flag de Fase
                    if (values.length <= 9) {
                        PosFlag1 = (values.length / 2) - 0.5;
                        PosFlag2 = 10;
                        PosFlag3 = 10;
                    }
                    if (values.length > 9 && values.length <= 18) {
                        PosFlag1 = 4;
                        PosFlag2 = (values.length / 2) + 4;
                        PosFlag3 = 22;
                    }
                    if (values.length > 18) {
                        PosFlag1 = 4;
                        PosFlag2 = 13;
                        PosFlag3 = (values.length / 2) + 8.5;
                    }

                    title = "Razão Plataforma";
                    yTitleText = "Porcentagem ( % )";
                    yLabel = "porcento";
                    maxyaxis = 100;
                    passoy = 25;
                    PosFlagY = 0;


                    ///*          START                */
                    namecompmax = "Razão máxima";
                    for (let i = 0; i < values.length; i++) {
                        maxscoredata[i] = 100;
                    }
                    ///*             END             */    fazer com "map"
                    break;
            }



            let pacientname = getCurrentPacient("name");



            $('#main-content').unblock();
            if ($("#plataform-view").val() == 'expiratory_peak' || $("#plataform-view").val() == 'inspiratory_peak') {

                switch ($("#device-name").val()) {

                    case 'Pitaco':
                        yTitleText = "L/min";
                        break;
                    case 'Mano':
                        yTitleText = "L/m³ ???";
                        break;
                    case 'Cinta':
                        yTitleText = "cm ???"; ////VERIFICAR UNIDADES CORRETAS
                        break;
                }


                plot({ values: values, dates: dates, title: title, yTitleText: yTitleText, pacientname: pacientname });
                ////////               /////     CRIAR UM OBJETO COM TUDO, DEIXANDO O CÓDIGO MAIS LIMPO
            }

            if ($("#plataform-view").val() == 'score' || $("#plataform-view").val() == 'ratio') {
                //  let fakevalues=[1499, 715, 1110, 1010, 1440, 1760, 1356, 1485, 5164,
                //  3741, 2956, 4544, 2356, 1564];
                // let fakesess=  [1,2,3,4,5,6,7,8,9,1,2,3,4,5];
                // PosFlag1=4;
                //PosFlag2=(7)+4;
                //PosFlag3=30;
                plotbar({ values: values, dates: dates, title: title, yTitleText: yTitleText, maxscoredata: maxscoredata, PosFlag1: PosFlag1, PosFlag2: PosFlag2, PosFlag3: PosFlag3, yTitleText: yTitleText, pacientname: pacientname, namecompmax: namecompmax, yLabel: yLabel, maxyaxis: maxyaxis, passoy: passoy, PosFlagY: PosFlagY });
                ////////               /////     CRIAR UM OBJETO COM TUDO, DEIXANDO O CÓDIGO MAIS LIMPO
            }


        },
        error: function () {
            $('#main-content').unblock();
            alert("Ocorreu um erro ao carregar os dados. Reinicie a página e tente novamente");
        },
    });
}

function plot(plotObj) {
    var chart = Highcharts.chart('plataform-chart-container', {

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
        tooltip: {
            headerFormat: '<span style="font-size:10px">Data: {point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y} ' + plotObj.yTitleText + '</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true,
        },
        plotOptions: {
            column: {
                stacking: 'normal'
            }
        },
        series: [
            {
                name: plotObj.pacientname,
                data: plotObj.values
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


function plotbar(plotObj) {


    var chart = Highcharts.chart('plataform-chart-container', {

        chart: {
            type: 'column'
        },

        title: {
            text: plotObj.title
        },
        xAxis: {
            categories: [
                '1', '2', '3', '4', '5', '6', '7', '8', '9',
                '1', '2', '3', '4', '5', '6', '7', '8', '9',
                '1', '2', '3', '4', '5', '6', '7', '8', '9',
            ],
            plotBands: [{ // visualizar a área referente a cada nivel
                from: -1,
                to: 8.5,
                color: '#ffff94',
            },
            {
                from: 8.5,
                to: 17.5,
                color: '#fce083',
            },
            {
                from: 17.5,
                to: 26.5,
                color: '#fcad83',
            }],
            title: {
                text: 'Nível'
            },
            crosshair: true,

            tickInterval: 1,
            labels: { enabled: true }
        },

        yAxis: [{ // Primary yAxis

            min: 0,
            max: plotObj.maxyaxis,
            tickInterval: plotObj.passoy,
            title: {
                text: plotObj.yTitleText,
            }

        }],

        tooltip: {
            headerFormat: '<span style="font-size:10px">Nível {point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y} ' + plotObj.yLabel + '</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true,
        },

        plotOptions: {
            column: {
                pointPadding: 0.2,
                borderWidth: 0,
            }
        },

        annotations: [{
            labels: [{
                point: {
                    x: plotObj.PosFlag1,
                    y: plotObj.PosFlagY,
                    xAxis: 0
                },
                text: 'Fase 1',
            }, {
                point: {
                    x: plotObj.PosFlag2,
                    y: plotObj.PosFlagY,
                    xAxis: 0
                },
                text: 'Fase 2',
            }, {
                point: {
                    x: plotObj.PosFlag3,
                    y: plotObj.PosFlagY,
                    xAxis: 0
                },
                text: 'Fase 3',
            },],
        }],


        series: [{
            name: plotObj.pacientname,
            data: plotObj.values,
        },
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
    if (plotObj.namecompmax == "Pontuação máxima") {
        chart.addSeries({
            name: plotObj.namecompmax,
            data: plotObj.maxscoredata,
            color: '#ff0303'
        });
    }

}



function groupByDate(objList) {
    let dateValues = {};
    objList.forEach(element => {
        if (dateValues[element.date]) {
            dateValues[element.date].maxExpFlow = element.maxExpFlow > dateValues[element.date].maxExpFlow ? element.maxExpFlow : dateValues[element.date].maxExpFlow
            dateValues[element.date].maxInsFlow = element.maxInsFlow < dateValues[element.date].maxInsFlow ? element.maxInsFlow : dateValues[element.date].maxInsFlow

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