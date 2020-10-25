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
            
            dates = dates.map(x => x.split("/"));                //converte para o formato UTC, timestamp
            dates = dates.map(x => Date.UTC(x[2],x[1] - 1, x[0]));

            debugger;
            for(let i=0; i<dates.length; i++){
                values[i]=[dates[i],values[i]];
            }
            let title = 'Pico Expiratório minigame';
            let Xtitle = 'pico Expiratório';
            if($('#minigame-name').val()=="WaterGame"){
                title = 'Pico Inspiratório minigame'; 
                Xtitle = 'pico Inspiratório';
            };
          

    if( $('#HistoryCalibration').val()=="includeHistoryCalibration"){
        $.ajax({
            url: `${window.API_ENDPOINT}/pacients/${userId}/calibrations`,
            type: "GET",
            dataType: "json",
            data: filters,
            beforeSend: function (rcalib) {
                rcalib.setRequestHeader("GameToken", getSessionUserCredentialValue('gameToken'));
            },
            success: function (dcalib) {
               
                let calibrationchoice=[];
                if($('#minigame-name').val()=="CakeGame"){
                    calibrationchoice=dcalib.data.filter(x => x.calibrationExercise =="ExpiratoryPeak");
                }else{
                    calibrationchoice=dcalib.data.filter(x => x.calibrationExercise =="InspiratoryPeak");
                };
                calibrationchoice.sort((a, b) => (a.created_at > b.created_at) ? 1 : ((b.created_at > a.created_at) ? -1 : 0))
             
                let DataCalibration = { dataCalib: [], valuesCalib: []}
             

                calibrationchoice.map(function (element) {
               
                    DataCalibration.dataCalib.push(new Date(element.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'numeric', day: 'numeric' }));
                    DataCalibration.valuesCalib.push(element.calibrationValue);
                });

                DataCalibration.dataCalib = DataCalibration.dataCalib.map(x => x.split("/"));                //converte para o formato UTC, timestamp
                DataCalibration.dataCalib = DataCalibration.dataCalib.map(x => Date.UTC(x[2],x[1] - 1, x[0]));


                let newdates = [];
                Array.prototype.push.apply(newdates, DataCalibration.dataCalib);
                Array.prototype.push.apply(newdates, dates);
                newdates.sort((a, b) => (a > b) ? 1 : ((b > a) ? -1 : 0))
                debugger;

               let Poligono100Calib = [];
               let Poligono75Calib = [];
               let Poligono50Calib = [];

               Poligono100Calib[0]= [(DataCalibration.dataCalib[0]), 0];
               Poligono75Calib[0]= [(DataCalibration.dataCalib[0]), 0];
               Poligono50Calib[0]= [(DataCalibration.dataCalib[0]), 0];
               for(let i=0;i<DataCalibration.dataCalib.length;i++){
                   Poligono100Calib[i+1]= [DataCalibration.dataCalib[i], DataCalibration.valuesCalib[i]];
                   Poligono75Calib[i+1]= [DataCalibration.dataCalib[i], 0.75*DataCalibration.valuesCalib[i]];
                   Poligono50Calib[i+1]= [DataCalibration.dataCalib[i], 0.5*DataCalibration.valuesCalib[i]];
               };
               Poligono100Calib[DataCalibration.dataCalib.length+1]=[(DataCalibration.dataCalib[DataCalibration.dataCalib.length-1]), 0];
               Poligono75Calib[DataCalibration.dataCalib.length+1]=[(DataCalibration.dataCalib[DataCalibration.dataCalib.length-1]), 0];
               Poligono50Calib[DataCalibration.dataCalib.length+1]=[(DataCalibration.dataCalib[DataCalibration.dataCalib.length-1]), 0];
        

               
            let objValues = d.data.map(function (value) {
                let obj = {}
                obj.date = new Date(value.created_at).toLocaleDateString('pt-BR', { year: 'numeric', month: 'numeric', day: 'numeric' });
                obj.flowValue = value.flowDataRounds.map(x => x.roundFlowScore).sort((a, b) => b - a)[0];
                return obj;
            });
            
            let groupObjValues = groupByDate(objValues);
            let values = Object.values(groupObjValues);
            let dates = Object.keys(groupObjValues);


               let plotObj = {
                dates: newdates,
                values: values,
                Poligono100Calib: Poligono100Calib,
                Poligono75Calib: Poligono75Calib,
                Poligono50Calib: Poligono50Calib,
                title:title,
                Xtitle:Xtitle,
            }

          debugger;

                $('#main-content').unblock();
                plot2(plotObj);
                
                
            },error: function () {
                $('#main-content').unblock();
                alert("Ocorreu um erro ao carregar os dados. Reinicie a página e tente novamente"); //alerta de erro
            },
        });
    }else{ //caso não seja desejado ver com o histórico de calibração, apresenta apenas o gráfico normal


        let plotObj = {
            dates:dates,
            values: values,
            title:title,
            Xtitle:Xtitle,
        }

        $('#main-content').unblock();
        plot(plotObj);
    }

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
            text: plotObj.title,
        },
        xAxis: {
            type: 'datetime',
            //tickInterval: 1,
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
                text: plotObj.Xtitle,
                style: {
                    color: Highcharts.getOptions().colors[1]
                }
            }
        }],
        tooltip: {
            headerFormat: '<span style="font-size:10px">Data: {point.key}</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y} L/min </b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true,
        },

        series: [{
            name: 'Maior pico da sessão',
            type: 'line',
            //lineWidth: 0.5,
            data: plotObj.values,
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


    ///*************       ALTERAR FUTURAMENTE */  //  Aderir série/background calibração de forma externa, apenas adicionando ao plot acima

    function plot2(plotObj) {
        var chart = Highcharts.chart('minigame-chart-container', {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: plotObj.title,
            },
            xAxis: {
                type: 'datetime',
                tickInterval: 1,
                labels: { enabled: true }
            },
            yAxis: [{
                type: 'datetime',
                labels: {
                    format: '{value} L/min',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                title: {
                    text: plotObj.Xtitle,
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                }
            }],
            tooltip: {
                headerFormat: '<span style="font-size:10px">Data: {point.key}</span><table>',
                pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                    '<td style="padding:0"><b>{point.y} L/min </b></td></tr>',
                footerFormat: '</table>',
                shared: true,
                useHTML: true,
            },
            plotOptions: {
                polygon: {
                  showInLegend: false,
                  enableMouseTracking: true
                }
              },
              series: [{
                name: 'Maior pico da sessão',
                type: 'line',
                lineWidth: 0.5,
                data: plotObj.values,
                zIndex: 1
            }, {
              
                type: 'polygon',
                name: '100% da calibração',
                color: '#ffff94',
                data: plotObj.Poligono100Calib,
                zIndex: -3
              }, {
              
                type: 'polygon',
                name: '75% da calibração',
                color: '#fce083',
                data: plotObj.Poligono75Calib,
                zIndex: -2
              }, {
              
                type: 'polygon',
                name: '50% da calibração',
                color: '#fcad83',
                data: plotObj.Poligono50Calib,
                zIndex: -1
              },],
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


    ///*************       FIM "ADAPTAÇÂO TÉCNICA" */  //  


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