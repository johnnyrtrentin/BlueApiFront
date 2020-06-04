import {
    getSessionUserCredentialValue
} from './../app.js';

function initPlataformCompareView() {
    $('#compare-filters').load("./../shared/compareFilters.html");

    $('#btnFiltrar').on('click', function () {
        document.getElementById('plataformCompare-chart-container').style.display = "";

        var filterObj = {};


        filterObj.condition = $("#condition-name").val();
        filterObj.sex = $("#SexSelect").val();
        filterObj.maxsession = $("#NroSessoess").val();
        filterObj.phase = $("#fase-selected").val();
        filterObj.gameDevice = $("#device-name").val();
        filterObj.peaktype = $("#peak-type").val();
        var today = new Date();
        if ($("#inputFinalAge").val() !== null) {
            filterObj.dataIni = today.getFullYear() - $("#inputFinalAge").val() + '-01-01';
        };
        if ($("#inputFinalAge").val() !== null) {
            filterObj.dataFim = today.getFullYear() - $("#inputInitialAge").val() + '-31-12';
        };

        if (filterObj.peaktype == 'ExpiratoryPeak') {
            plotExpPeak(filterObj);
        }
        else {
            plotInsPeak(filterObj)
        };
    });


    if (getSessionUserCredentialValue('role') == "User") {
        document.getElementById('content-info').style.display = "none";
        document.getElementById('plataformaComparativos-main-container').style.display = '';
    } else if (getSessionUserCredentialValue('role') == "Administrator") {
        if ($("#pacient-select").val() != "" && $("#pacient-select").val() != undefined) {
            document.getElementById('content-info').style.display = "none";
            document.getElementById('plataformaComparativos-main-container').style.display = '';
        }
    }
}

function updatePlataformCompareView() {
    document.getElementById('plataformaComparativos-main-container').style.display = '';
    document.getElementById('content-info').style.display = "none";
}

function plotExpPeak(filterObj) {

    $('#main-content').block({
        message: `Carregando...`
    });

    let filters = { sort: 'asc' };
    if (filterObj != undefined) {
        Object.assign(filters, filters, filterObj);
    }

    $.ajax({
        url: `${window.API_ENDPOINT}/plataforms/statistics`,
        type: "GET",
        dataType: "json",
        data: filters,
        beforeSend: function (r) {
            r.setRequestHeader("GameToken", getSessionUserCredentialValue('gameToken'));
        },
        success: function (d) {

            let flowData = { maxExpFlows: {} };
            let flowDataSelectedPacient = d.data.filter(x=>x.pacientId == $("#pacient-select").val());

            let flowDataPacients = d.data.filter(x=>x.pacientId != $("#pacient-select").val());


            let flowDataPac = {sessoes:[], dadosexp:[]};

            flowDataPacients.map(function (element) {
                element.maxFlows.forEach(element => {
                    if (flowData.maxExpFlows[element.sessionNumber] == undefined)
                        flowData.maxExpFlows[element.sessionNumber] = [];

                    flowData.maxExpFlows[element.sessionNumber].push(element.maxExpFlow);
                });
            });

            flowDataSelectedPacient.map(function (element) {
                element.maxFlows.forEach(element => {
                    if (flowDataPac.sessoes[element.sessionNumber] == undefined)
                    flowDataPac.sessoes[element.sessionNumber] = [];

                    if (flowDataPac.dadosexp[element.sessionNumber] == undefined)
                    flowDataPac.dadosexp[element.sessionNumber] = [];

                    flowDataPac.sessoes[element.sessionNumber].push(element.sessionNumber);
                    flowDataPac.dadosexp[element.sessionNumber].push(element.maxExpFlow);
                });
            });

            let quartilSuperiorExp = [];
            let quartilInferiorExp = [];

            for (const [key, value] of Object.entries(flowData.maxExpFlows)){
                value.sort(function (a, b) { return a - b; });
                quartilSuperiorExp.push(value[Math.round(value.length * 0.75) - 1]);
                quartilInferiorExp.push(value[Math.round(value.length * 0.25) - 1]);
            }

            for(let i=1;i<quartilSuperiorExp.length-1;i++){
                if(quartilSuperiorExp[i]==undefined && quartilSuperiorExp[i-1]!=undefined && quartilSuperiorExp[i+1]!=undefined){
                    quartilSuperiorExp[i]=quartilSuperiorExp[i-1]+quartilSuperiorExp[i+1];
            };};
            for(let i=1;i<quartilInferiorExp.length-1;i++){
                if(quartilInferiorExp[i]==undefined && quartilInferiorExp[i-1]!=undefined && quartilInferiorExp[i+1]!=undefined){
                    quartilInferiorExp[i]=quartilInferiorExp[i-1]+quartilInferiorExp[i+1];
            };};

            var rangesexp = [];
            for(let i=0;i<flowDataPac.sessoes.length-1;i++){
                rangesexp[i]= [flowDataPac.sessoes[i+1]+"",quartilInferiorExp[i],quartilSuperiorExp[i]];
            }
            
            var dataplayerexp = [];
            for(let i=0;i<flowDataPac.sessoes.length-1;i++){
                dataplayerexp[i]= [flowDataPac.sessoes[i+1]+"",flowDataPac.dadosexp[i+1][0]];
            }

// ///////plot

var chart = Highcharts.chart('plataformCompare-chart-container', {

    title: {
        text: 'Picos Expiratórios - Plataforma'
    },

    xAxis: {
        type: 'categoryies',
        title: {
            text: 'Sessão'
        }
    },

    yAxis: {
        title: {
            text: 'Pico Exp. (L/min)'
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
        data: rangesexp,
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
        name: 'Picos Exp. Player',
        data: dataplayerexp,
        color: '#0080ff',
        marker: {
            enabled: true,
            symbol: 'circle'

        }

    }]
});


// /////fimplot



        }// end success ajax
    });//end all ajax

  
$('#main-content').unblock();
}


function plotInsPeak(filterObj) {
 
    $('#main-content').block({
        message: `Carregando...`
    });

    let filters = { sort: 'asc' };
    if (filterObj != undefined) {
        Object.assign(filters, filters, filterObj);
    }

    $.ajax({
        url: `${window.API_ENDPOINT}/plataforms/statistics`,
        type: "GET",
        dataType: "json",
        data: filters,
        beforeSend: function (r) {
            r.setRequestHeader("GameToken", getSessionUserCredentialValue('gameToken'));
        },
        success: function (d) {

            let flowData = {maxInsFlows: {}};
            let flowDataSelectedPacient = d.data.filter(x=>x.pacientId == $("#pacient-select").val());

            let flowDataPacients = d.data.filter(x=>x.pacientId != $("#pacient-select").val());


            let flowDataPac = {sessoes:[], dadosinsp:[] };

            flowDataPacients.map(function (element) {
                element.maxFlows.forEach(element => {
                    if (flowData.maxInsFlows[element.sessionNumber] == undefined)
                        flowData.maxInsFlows[element.sessionNumber] = [];

                    flowData.maxInsFlows[element.sessionNumber].push(element.maxInsFlow);
                });
            });

            flowDataSelectedPacient.map(function (element) {
                element.maxFlows.forEach(element => {
                    if (flowDataPac.sessoes[element.sessionNumber] == undefined)
                    flowDataPac.sessoes[element.sessionNumber] = [];

                    if (flowDataPac.dadosinsp[element.sessionNumber] == undefined)
                    flowDataPac.dadosinsp[element.sessionNumber] = [];

                    flowDataPac.sessoes[element.sessionNumber].push(element.sessionNumber);
                    flowDataPac.dadosinsp[element.sessionNumber].push(element.maxInsFlow);
                });
            });

            let quartilSuperiorIns = [];
            let quartilInferiorIns = [];

            for (const [key, value] of Object.entries(flowData.maxInsFlows)){
                value.sort(function (a, b) { return a - b; });
                quartilSuperiorIns.push(value[Math.round(value.length * 0.75) - 1]);
                quartilInferiorIns.push(value[Math.round(value.length * 0.25) - 1]);
            }


            for(let i=1;i<quartilSuperiorIns.length-1;i++){
                if(quartilSuperiorIns[i]==undefined && quartilSuperiorIns[i-1]!=undefined && quartilSuperiorIns[i+1]!=undefined){
                    quartilSuperiorIns[i]=(quartilSuperiorIns[i-1]+quartilSuperiorIns[i+1])/2;
            };};
            for(let i=1;i<quartilInferiorIns.length-1;i++){
                if(quartilInferiorIns[i]==undefined && quartilInferiorIns[i-1]!=undefined && quartilInferiorIns[i+1]!=undefined){
                    quartilInferiorIns[i]=(quartilInferiorIns[i-1]+quartilInferiorIns[i+1])/2;
            };};

            var rangesins = [];
            for(let i=0;i<flowDataPac.sessoes.length-1;i++){
                rangesins[i]= [flowDataPac.sessoes[i+1]+"",quartilInferiorIns[i],quartilSuperiorIns[i]];
            }
            
            var dataplayerins = [];
            for(let i=0;i<flowDataPac.sessoes.length-1;i++){
                dataplayerins[i]= [flowDataPac.sessoes[i+1]+"",flowDataPac.dadosinsp[i+1][0]];
            };

// ///////plot

var chart = Highcharts.chart('plataformCompare-chart-container', {

    title: {
        text: 'Picos Inspiratórios - Plataforma'
    },

    xAxis: {
        type: 'categoryies',
        title: {
            text: 'Sessão'
        }
    },

    yAxis: {
        title: {
            text: 'Pico Ins. (L/min)'
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
        data: rangesins,
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
        name: 'Picos Exp. Player',
        data: dataplayerins,
        color: '#0080ff',
        marker: {
            enabled: true,
            symbol: 'circle'

        }

    }]
});


// /////fimplot



        }// end success ajax
    });//end all ajax

  
$('#main-content').unblock();
}
 

export {
    initPlataformCompareView,
    updatePlataformCompareView
}