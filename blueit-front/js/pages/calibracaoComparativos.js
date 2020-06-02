import {
    getSessionUserCredentialValue
} from './../app.js';

function initCalibrationCompareView() {
    $('#compare-filters').load("./../shared/compareFilters.html");

    $('#btnFiltrar').on('click', function () {
        document.getElementById('calibracaoCompare-chart-container').style.display = "";
        plot()
    });

    if (getSessionUserCredentialValue('role') == "User") {
        document.getElementById('content-info').style.display = "none";
        document.getElementById('calibracaoCompare-main-container').style.display = '';
    } else if (getSessionUserCredentialValue('role') == "Administrator") {
        if ($("#pacient-select").val() != "" && $("#pacient-select").val() != undefined) {
            document.getElementById('content-info').style.display = "none";
            document.getElementById('calibracaoCompare-main-container').style.display = '';
        }
}
};

function updateCalibrationCompareView() {
    document.getElementById('calibracaoCompare-main-container').style.display = '';
    document.getElementById('content-info').style.display = "none";
}

function plot(plotObj){
    
    var ranges = [
        [1, 14.3, 27.7],
        [2, 14.5, 27.8],
        [3, 15.5, 29.6],
        [4, 16.7, 30.7],
        [5, 16.5, 25.0],
        [6, 17.8, 25.7],
        [7, 13.5, 24.8],
        [8, 10.5, 21.4],
        [9, 9.2, 23.8],
        [10,11.6, 21.8],
        [11,10.7, 23.7],
        [12, 11.0, 23.3],
        [13,11.6, 23.7],
        [14,11.8, 20.7],
        [15,11.6, 22.4],
        [16,13.6, 19.6],
        [17,11.4, 22.6],
        [18,13.2, 25.0],
        [19,14.2, 21.6],
        [20,13.1, 17.1]
    ],
    averages = [
        [1, 21.5],
        [2, 22.1],
        [3, 23],
        [4, 23.8],
        [5, 21.4],
        [6, 21.3],
        [7, 18.3],
        [8, 15.4],
        [9, 16.4],
        [10,17.7],
        [11,17.5],
        [12,17.6],
        [13,17.7],
        [14,16.8],
        [15,17.7],
        [16,16.3],
        [17,17.8],
        [18,18.1],
        [19,17.2],
        [20,14.4]
    ];
    var chart = Highcharts.chart('calibracaoCompare-chart-container', {
        title: {
            text: 'Picos Expiratórios - Calibração PITACO'
        },
    
        xAxis: {
            title: {
                text:'Sessão'
            }
        },
    
        yAxis: {
            title: {
                text:'Pico Exp. (L/min)'
            },
        },
    
        tooltip: {
            crosshairs: true,
            shared: true,
            valueSuffix: 'L/min'
        },
    
        series: [{
           name: 'Picos Exp. Player',
            data: [210, 242, 259, 257, 265, 279, 303, 325],
            color: '#0080ff',
             marker: {
                     enabled: true,
                symbol: 'circle'
               
            }
            
        }]
    });
    chart.reflow();
}

export {
    initCalibrationCompareView,
    updateCalibrationCompareView
}
