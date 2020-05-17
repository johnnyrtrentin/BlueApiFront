import Observable from './Observable.js';
import {
    initMinigameView
} from './pages/minigames.js';

window.API_ENDPOINT = "http://localhost:7071/api/";

$('#datetimepicker1').datetimepicker();

$(document).ready(function () {
    $('#modalUser').load("./shared/modalUser.html", function () {});
    $('#header').load("./shared/header.html", function () {
        var userRole = JSON.parse(sessionStorage.getItem('userCredentials')).role;
        if (userRole == "User") {
            var el = document.getElementById('pacient-select-container');
            el.parentNode.removeChild(el);
            el = document.getElementById('pacient-token-option');
            el.parentNode.removeChild(el);
        }

        const selectPacientEl = document.getElementById('pacient-select');
        selectPacientEl.addEventListener('change', e => {
            //Get current route declared in route.js
            var currentPage = page.current
            switch (currentPage) {
                case 'minigames':
                    initMinigameView(e.target.value);
            }
        });

    });
    $('#footer').load("./shared/footer.html");
    $('#sidebar').load("./shared/sidebar.html");

    Highcharts.setOptions({
        lang: {
            months: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
            shortMonths: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            weekdays: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
            loading: ['Atualizando o gráfico...aguarde'],
            contextButtonTitle: 'Exportar gráfico',
            decimalPoint: ',',
            thousandsSep: '.',
            viewFullscreen: 'Tela Cheia',
            downloadJPEG: 'Baixar imagem JPEG',
            downloadPDF: 'Baixar arquivo PDF',
            downloadPNG: 'Baixar imagem PNG',
            downloadSVG: 'Baixar vetor SVG',
            downloadCSV: 'Baixar arquivo CSV',
            downloadXLS: 'Baixar arquivo XLS',
            printChart: 'Imprimir gráfico',
            rangeSelectorFrom: 'De',
            rangeSelectorTo: 'Para',
            rangeSelectorZoom: 'Zoom',
            resetZoom: 'Limpar Zoom',
            resetZoomTitle: 'Voltar Zoom para nível 1:1',
        }
    });
});

function getSessionUserCredentialValue(key) {
    const userCredentials = JSON.parse(sessionStorage.getItem('userCredentials'));
    return userCredentials[key];
}

export {
    getSessionUserCredentialValue
};