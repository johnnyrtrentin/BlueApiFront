import {
    getSessionUserCredentialValue
} from './../app.js';

function initPlataformCompareView() {

    $('#btnFiltrar').on('click', function () {
        document.getElementById('plataformCompare-chart-container').style.display = "";
        if ($('#peak-type').val() == 'ExpiratoryPeak')
            plotExpPeak();
        else
            plotInsPeak();
    });

    $('#compare-filters').load("./../shared/compareFilters.html");
    
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

function plotExpPeak() {
    debugger;
    var ranges = [
        [1, 110, 180],
        [2, 112, 182],
        [3, 120, 186],
        [4, 121, 191],
        [5, 124, 199],
        [6, 125, 201],
        [7, 130, 205],
        [8, 138, 208],
        [9, 142, 210],
        [10, 151, 215],
        [11, 160, 220],
        [12, 170, 222],
        [13, 175, 224],
        [14, 182, 228],
        [15, 187, 231],
        [16, 191, 235],
        [17, 192, 238],
        [18, 200, 240],
        [19, 215, 244],
        [20, 224, 249]
    ],
        averages = [
            [1, 144],
            [2, 152],
            [3, 149],
            [4, 168],
            [5, 158],
            [6, 168],
            [7, 176],
            [8, 180],
            [9, 200],
            [10, 192],
            [11, 193],
            [12, 182],
            [13, 197],
            [14, 200],
            [15, 201],
            [16, 217],
            [17, 220],
            [18, 224],
            [19, 232],
            [20, 229]
        ];

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
            name: 'Picos Exp. Player',
            data: averages,
            color: '#0080ff',
            marker: {
                enabled: true,
                symbol: 'circle'

            }

        }]
    });

    chart.reflow();
}

function plotInsPeak() {
    var ranges = [
        [1, -110, -180],
        [2, -112, -180],
        [3, -120, -180],
        [4, -121, -182],
        [5, -124, -184],
        [6, -125, -187],
        [7, -130, -192],
        [8, -138, -190],
        [9, -142, -198],
        [10,-151, -197],
        [11,-155, -199],
        [12,-157, -208],
        [13,-158, -212],
        [14,-160, -210],
        [15,-165, -218],
        [16,-170, -220],
        [17,-175, -227],
        [18,-180, -228],
        [19,-188, -229],
        [20,-190, -230]
    ],
    averages = [
        [1, -120],
        [2, -127],
        [3, -140],
        [4, -130],
        [5, -132],
        [6, -138],
        [7, -149],
        [8, -144],
        [9, -160],
        [10,-157],
        [11,-164],
        [12,-168],
        [13,-170],
        [14,-180],
        [15,-175],
        [16,-174],
        [17,-180],
        [18,-186],
        [19,-186],
        [20,-187]
    ];

    Highcharts.chart('plataformCompare-chart-container', {

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
            name: 'Picos Ins. Player',
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
