import Observable from './Observable.js';
import { initHeader } from './pages/header.js';
import { updateMinigameView } from './pages/minigames.js';
import { updateMinigameCompareView } from './pages/minigamesComparativos.js';
import { updateDashboardView } from './pages/dashboard.js';
import { updateRegistroPacienteView } from './pages/registroPaciente.js';
import { updateCalibrationView } from './pages/calibracao.js';
import { updateCalibrationCompareView } from './pages/calibracaoComparativos.js';
import { updatePlataformView } from './pages/plataforma.js';
import { updatePlataformCompareView } from './pages/plataformaComparativos.js';


window.API_ENDPOINT = "http://localhost:7071/api";

$('#datetimepicker1').datetimepicker();

$(document).ready(function () {
    $('#modalUser').load("./shared/modalUser.html", function () { 
        initHeader();
    });
    $('#header').load("./shared/header.html", function () {
        var userRole = JSON.parse(sessionStorage.getItem('userCredentials')).role;
        if (userRole == "User") {
            var el = document.getElementById('pacient-select-container');
            el.parentNode.removeChild(el);
            el = document.getElementById('pacient-token-option');
            el.parentNode.removeChild(el);
        }
        else {
            const selectPacientEl = document.getElementById('pacient-select');
            selectPacientEl.addEventListener('change', e => {
                //Get current route declared in route.js
                var currentPage = page.current
                    ;
                switch (currentPage) {
                    case '/':
                    case 'dashboard':
                        updateDashboardView(e.target.value);
                        break;
                    case 'minigames':
                        updateMinigameView(e.target.value);
                        initHighcharts();
                        break;
                    case 'minigames/minigamesComparativos':
                        updateMinigameCompareView(e.target.value);
                        break;
                    case 'calibracao':
                        updateCalibrationView(e.target.value);
                        break;
                    case 'calibracao/calibracaoComparativos':
                        updateCalibrationCompareView();
                        break;
                    case 'plataforma':
                        updatePlataformView(e.target.value);
                        break;
                    case 'plataforma/plataformaComparativos':
                        updatePlataformCompareView(e.target.value);
                        break;
                    case 'registroContaPaciente':
                        updateRegistroPacienteView(e.target.value);
                        break;
                }
            });
        }



    });
    $('#footer').load("./shared/footer.html");
    $('#sidebar').load("./shared/sidebar.html", function () {
        if (getSessionUserCredentialValue('role') == 'User') {
            var el = document.getElementById('sidebar-pacients-option');
            el.parentNode.removeChild(el);
        }
    });



});

function getSessionUserCredentialValue(key) {
    const userCredentials = JSON.parse(sessionStorage.getItem('userCredentials'));
    return userCredentials[key];
}

function initHighcharts() {
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
}

export {
    getSessionUserCredentialValue
};