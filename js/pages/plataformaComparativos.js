import {
    getSessionUserCredentialValue,
    getCurrentPacient,
    getAge
} from './../app.js';

import {
    Max_Score_Plataforma
} from './../consts.js';

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
        document.getElementById('plataformCompare-chart-container').style.display = "";

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
    document.getElementById('plataformCompare-chart-container').style.display = 'none';
    document.getElementById('chartExpiratory-heading').style.display = 'none';
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


            let flowData = { insFlows: {}, expFlows: {}, score: {}, scoreRatio: {} };
            let currentPacientId = getCurrentPacient("_id");

            let flowDataSelectedPacient = d.data.filter(x => x.pacientId == currentPacientId);
            flowDataSelectedPacient[0].maxFlowsPerSession.sort((a, b) => (a.sessionNumber > b.sessionNumber) ? 1 : ((b.sessionNumber > a.sessionNumber) ? -1 : 0))


            let flowDataPacients = d.data.filter(x => x.pacientId != currentPacientId);

            flowDataPacients.forEach(element => {
                element.maxFlowsPerSession.sort((a, b) => (a.sessionNumber > b.sessionNumber) ? 1 : ((b.sessionNumber > a.sessionNumber) ? -1 : 0));
            });

            let flowDataPac = { sessoes: flowDataSelectedPacient[0].maxFlowsPerSession.length, insFlows: [], expFlows: [], Score: [], ScoreRatio: [] };

            flowDataPacients.map(function (element) {
                for (let index = 0; index < element.maxFlowsPerSession.length; index++) {
                    if (flowData.expFlows[index] == undefined) {
                        flowData.expFlows[index] = [];
                    }
                    if (flowData.insFlows[index] == undefined) {
                        flowData.insFlows[index] = [];
                    }

                    flowData.expFlows[index].push(element.maxFlowsPerSession[index].maxExpFlow);
                    flowData.insFlows[index].push(element.maxFlowsPerSession[index].maxInsFlow);
                };

                flowData.score = element.plataformInfo.map(x => ({ fase: x.phase, level: x.level, value: x.maxScore }));
                flowData.scoreRatio = element.plataformInfo.map(x => ({ fase: x.phase, level: x.level, value: x.scoreRatio }));
            });

            if(flowData.score[0]==undefined){flowData.score=[];};
            //DADO FAKE COMPARATIVO SCORE
            //for(let i=0;i<30;i++){

             //   flowData.score.push({ fase: Math.floor((Math.random() * 3) + 1), level: Math.floor((Math.random() * 9) + 1), value: Math.floor((Math.random() * 1500) + 1)});
           // } //usando random para gerar dados aleatórios de fase, sessão e pontuação para comparação com o paciente analisado
            //fim dados fake

            if(flowData.scoreRatio[0]==undefined){flowData.scoreRatio=[];};
            //DADO FAKE COMPARATIVO RAZÂO
            //for(let i=0;i<30;i++){

           //     flowData.scoreRatio.push({ fase: Math.floor((Math.random() * 3) + 1), level: Math.floor((Math.random() * 9) + 1), value: Math.floor((Math.random() * 100))});
           // } //usando random para gerar dados aleatórios de fase, sessão e pontuação para comparação com o paciente analisado
            //fim dados fake
   
           
            for (let index = 0; index < flowDataSelectedPacient[0].maxFlowsPerSession.length; index++) {
                flowDataPac.expFlows.push(flowDataSelectedPacient[0].maxFlowsPerSession[index].maxExpFlow);
                flowDataPac.insFlows.push(flowDataSelectedPacient[0].maxFlowsPerSession[index].maxInsFlow);


                for(let i=1; i<=3;i++){
                    if(flowDataSelectedPacient[0].plataformInfo[index].phase==i){
                        for(let j=1;j<=9;j++){
                            if(flowDataSelectedPacient[0].plataformInfo[index].level==j){
                                let a = (9 * (i - 1)) + (j - 1);
                                if(flowDataPac.Score[a]==undefined || flowDataPac.Score[a] ==""){flowDataPac.Score[a]=0;};
                                if(flowDataPac.Score[a]<flowDataSelectedPacient[0].plataformInfo[index].maxScore){
                                    flowDataPac.Score[a]=flowDataSelectedPacient[0].plataformInfo[index].maxScore;
                                }
                                if(flowDataPac.ScoreRatio[a]==undefined || flowDataPac.ScoreRatio[a] ==""){flowDataPac.ScoreRatio[a]=0;};
                                if(flowDataPac.ScoreRatio[a]<100*flowDataSelectedPacient[0].plataformInfo[index].scoreRatio){
                                    flowDataPac.ScoreRatio[a]=100*flowDataSelectedPacient[0].plataformInfo[index].scoreRatio;
                                }
                            }
                        }
                    }
                }

            }
         

            //alocando vetores com todos os dados separando por fase e por level, e então retirando a mediana destes valores
            let somascore = [];
            let scoreMediana =[];
            flowData.score.map(function (element) {
                for(let i=1; i<=3;i++){
                    if(element.fase==i){
                        for(let j=1;j<=9;j++){
                            if(element.level==j){
                                let a = (9 * (i - 1)) + (j - 1);
                                    if (somascore[a] == undefined || somascore[a] == "") {
                                        somascore[a] = [];
                                        somascore[a].push(element.value);
                                    }else{
                                        somascore[a].push(element.value);
                                    }
                                    if (scoreMediana[a] == undefined || scoreMediana[a] == "") {
                                        scoreMediana[a] = 0;
                                    }
                                scoreMediana[a]=quartile(somascore[a], .50);
                            }
                        }
                    }
                }
            });


            //como podem haver levels se dado algum (embora se espera que não aconteça), isso irá alocar valores nulos nessas posições dos
            //vetores, para que o highchart não plote os dados em posições erradas, e assim também limitando a apresentação do comparativo
            //ao tamanho dos dados do paciente.
            let scoreMedianautil=[];
            for(let a=0;a<flowDataPac.Score.length;a++){
                if (scoreMediana[a] == undefined || scoreMediana[a] == "") {
                 scoreMedianautil[a] = "";
                 }else{
                 scoreMedianautil[a]=scoreMediana[a];
                }
            }


            //alocando vetores com todos os dados separando por fase e por level, e então retirando a mediana destes valores
            let somascoreRatio = [];
            let scoreRatioMediana =[];
            flowData.scoreRatio.map(function (element) {
                for(let i=1; i<=3;i++){
                    if(element.fase==i){
                        for(let j=1;j<=9;j++){
                            if(element.level==j){
                                let a = (9 * (i - 1)) + (j - 1);
                                    if (somascoreRatio[a] == undefined || somascoreRatio[a] == "") {
                                        somascoreRatio[a] = [];
                                        somascoreRatio[a].push(element.value);
                                    }else{
                                        somascoreRatio[a].push(element.value);
                                    }
                                    if (scoreRatioMediana[a] == undefined || scoreRatioMediana[a] == "") {
                                        scoreRatioMediana[a] = 0;
                                    }
                                scoreRatioMediana[a]=quartile(somascoreRatio[a], .50);
                            }
                        }
                    }
                }
            });

            //for(let i=0;i<5;i++){
            //flowDataPac.ScoreRatio.push((Math.random() * 100));}      //DADO FAKE PACIENTE RAZÂO


            //como podem haver levels se dado algum (embora se espera que não aconteça), isso irá alocar valores nulos nessas posições dos
            //vetores, para que o highchart não plote os dados em posições erradas, e assim também limitando a apresentação do comparativo
            //ao tamanho dos dados do paciente.
            let scoreRatioMedianautil=[];
            for(let a=0;a<flowDataPac.ScoreRatio.length;a++){
                if (scoreRatioMediana[a] == undefined || scoreRatioMediana[a] == "") {
                 scoreRatioMedianautil[a] = "";
                 }else{
                 scoreRatioMedianautil[a]=scoreRatioMediana[a];
                }
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



            let plotObj = {};
            let maxscoredatautil = [];



            switch ($("#plataform-view").val()) {

                case 'expiratory_peak':
                    plotObj = {
                        title: `Dados Comparativos - Picos Expiratórios`,
                        seriesLineName: 'Picos Expiratórios do paciente selecionado',
                        areaRange: areaRangeExpValues,
                        values: playerLineExpValues,
                    };
                    break;

                case 'inspiratory_peak':
                    plotObj = {
                        title: `Dados Comparativos - Picos Inspiratórios`,
                        seriesLineName: 'Picos Inspiratórios do paciente selecionado',
                        areaRange: areaRangeExpValues,
                        values: playerLineInsValues,
                    };
                    break;

                case 'score':

                    plotObj = {
                        title: `Dados Comparativos - Pontuação`,
                        seriesLineName: getCurrentPacient("name"),
                        scorecomp: scoreMedianautil,
                        values:flowDataPac.Score,
                        yTitleText: "Pontuação",
                        namecompmax: "Comparativo Pontuação Máxima",
                        pacientCompSerieName: "Pontuação Comum de Pacientes Selecionados",
                        yLabel: "Pontos",
                        maxyaxis: null,
                        passoy: null,
                        PosFlagY: 50,
                    };
                    for (let i = 0; i < plotObj.values.length; i++) {
                        maxscoredatautil[i] = Max_Score_Plataforma[i];
                    }

                    plotObj.maxscoredata = maxscoredatautil;
                    break;

                case 'ratio':


                    plotObj = {
                        title: `Dados Comparativos - Razão`,
                        seriesLineName: getCurrentPacient("name"),
                        scorecomp: scoreRatioMedianautil,
                        values: flowDataPac.ScoreRatio,
                        yTitleText: "Porcentagem (%)",
                        namecompmax: "Porcentagem máxima",
                        pacientCompSerieName: "Razão Comum de Pacientes Selecionados",
                        yLabel: "%",
                        maxyaxis: 100,
                        passoy: 25,
                        PosFlagY: 0,
                    };
                    for (let i = 0; i < plotObj.values.length; i++) {
                        maxscoredatautil[i] = 100;
                    } //razão máxima é sempre o 100%

                    plotObj.maxscoredata = maxscoredatautil;  //há necessidade de comparar com o máximo em Razão????
                    break;


            }


            if ($("#plataform-view").val() == 'expiratory_peak' || $("#plataform-view").val() == 'inspiratory_peak') {

                switch ($("#device-name").val()) {

                    case 'Pitaco':
                        plotObj.yAxisTitleText = "L/min";
                        plotObj.yLabel = "L/min";
                        break;
                    case 'Mano':
                        plotObj.yAxisTitleText = "L/m³ ???";
                        plotObj.yLabel = "L/m³ ???";
                        break;
                    case 'Cinta':
                        plotObj.yAxisTitleText = "cm ???"; ////VERIFICAR UNIDADES CORRETAS
                        plotObj.yLabel = "cm ???";
                        break;
                }

                plot(plotObj);
            }

            if ($("#plataform-view").val() == 'score' || $("#plataform-view").val() == 'ratio') {

                plotbar(plotObj);
            }
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

function plot(plotObj) {

    /*  var ranges = [
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
  */
    var chart = Highcharts.chart('plataformCompare-chart-container', {

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
                text: plotObj.yAxisTitleText,
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
            headerFormat: '<span style="font-size:10px">{point.key}ª Sessão</span><table>',
            pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                '<td style="padding:0"><b>{point.y} ' + plotObj.yLabel + '</b></td></tr>',
            footerFormat: '</table>',
            shared: true,
            useHTML: true,
        },


        series: [{
            name: 'Valores esperados considerando o filtro selecionado',
            data: plotObj.areaRange,
            type: 'arearange',
            lineWidth: 0.3,
            color: '#68d2f2',
            fillOpacity: 0.4,
            zIndex: -1,
            marker: {
                enabled: true,
                symbol: 'diamond',
                radius: 2
            }


        }, {
            name: plotObj.seriesLineName,
            data: plotObj.values,
            color: '#0080ff',
            marker: {
                enabled: true,
                symbol: 'circle'

            }
        }]
    });
}


function plotbar(plotObj) {

    ////OBS: posicionamento do flag de Fase
    if (plotObj.values.length <= 9) {
        plotObj.PosFlag1 = (plotObj.values.length / 2) - 0.5;
        plotObj.PosFlag2 = 10;
        plotObj.PosFlag3 = 10;
    }
    if (plotObj.values.length > 9 && plotObj.values.length <= 18) {
        plotObj.PosFlag1 = 4;
        plotObj.PosFlag2 = (plotObj.values.length / 2) + 4;
        plotObj.PosFlag3 = 22;
    }
    if (plotObj.values.length > 18) {
        plotObj.PosFlag1 = 4;
        plotObj.PosFlag2 = 13;
        plotObj.PosFlag3 = (plotObj.values.length / 2) + 8.5;
    }



    var chart = Highcharts.chart('plataformCompare-chart-container', {

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
                color: '#ffff94'
            },
            {
                from: 8.5,
                to: 17.5,
                color: '#fce083'
            },
            {
                from: 17.5,
                to: 26.5,
                color: '#fcad83'
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
            name: plotObj.seriesLineName,
            data: plotObj.values,
        },
        {
            name: plotObj.pacientCompSerieName,
            data: plotObj.scorecomp,
        },
        {
            name: plotObj.namecompmax,
            data: plotObj.maxscoredata,
            color: '#ff0303'
        }],

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
    initPlataformCompareView,
    updatePlataformCompareView
}