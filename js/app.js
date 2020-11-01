import { initHeader } from './pages/header.js';
import { updateMinigameView } from './pages/minigames.js';
import { updateMinigameCompareView } from './pages/minigamesComparativos.js';
import { updateDashboardView } from './pages/dashboard.js';
import { updateRegistroPacienteView } from './pages/registroPaciente.js';
import { updateCalibrationView } from './pages/calibracao.js';
import { updateCalibrationCompareView } from './pages/calibracaoComparativos.js';
import { updatePlataformView } from './pages/plataforma.js';
import { updatePlataformCompareView } from './pages/plataformaComparativos.js';

//window.API_ENDPOINT = "https://blueapi.azurewebsites.net/api";
window.API_ENDPOINT = "https://iblueit.azurewebsites.net/";

$('#datetimepicker1').datetimepicker();

$(document).ready(function () {

    $.fn.tooltip.Constructor.Default.whiteList.table = [];
    $.fn.tooltip.Constructor.Default.whiteList.tr = [];
    $.fn.tooltip.Constructor.Default.whiteList.td = [];
    $.fn.tooltip.Constructor.Default.whiteList.th = [];
    $.fn.tooltip.Constructor.Default.whiteList.div = [];
    $.fn.tooltip.Constructor.Default.whiteList.tbody = [];
    $.fn.tooltip.Constructor.Default.whiteList.thead = [];

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
            el = document.getElementById('header-info-pacient');
            el.parentNode.removeChild(el);
        }
        else {
            const selectPacientEl = document.getElementById('pacient-select');
            selectPacientEl.addEventListener('change', e => {
                //Update current pacient
                sessionStorage.setItem('currentPacient', e.target.value);
                let pacientId = getCurrentPacient('_id');
                changeHeaderInfo();

                //Get current route declared in route.js
                var currentPage = page.current;
                switch (currentPage) {
                    case '/':
                    case 'dashboard':
                        updateDashboardView(pacientId);
                        break;
                    case 'minigames':
                        updateMinigameView(pacientId);
                        initHighcharts();
                        break;
                    case 'minigames/minigamesComparativos':
                        updateMinigameCompareView(pacientId);
                        break;
                    case 'calibracao':
                        updateCalibrationView(pacientId);
                        break;
                    case 'calibracao/calibracaoComparativos':
                        updateCalibrationCompareView(pacientId);
                        break;
                    case 'plataforma':
                        updatePlataformView(pacientId);
                        break;
                    case 'plataforma/plataformaComparativos':
                        updatePlataformCompareView(pacientId);
                        break;
                    case 'registroContaPaciente':
                        updateRegistroPacienteView(pacientId);
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

function getCurrentPacient(key) {
    const pacientInfo = JSON.parse(sessionStorage.getItem('currentPacient'));
    if (key) return pacientInfo[key];
    else return pacientInfo;
}

function getAge(dateString){
    let today = new Date();
    let birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    let m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function changeHeaderInfo(){
    let pacient = getCurrentPacient();
    let title = `<table style="height: 100px;">
    <tbody>
      <tr>
        <td class="align-baseline"><strong>Nome:</strong></td>
        <td id="table-dadosGerais-nome" class="align-baseline">${pacient.name}</td>
      </tr>
      <tr>
        <td class="align-baseline"><strong>Sexo:</strong></td>
        <td id="table-dadosGerais-sexo" class="align-baseline">${pacient.sex === 'Male' ? "Masculino" : "Feminino"}</td>
      </tr>
      <tr>
        <td class="align-baseline"><strong>Condição:</strong></td>
        <td id="table-dadosGerais-condicao" class="align-baseline">${translateCondition(pacient.condition)}</td>
      </tr>
      <tr>
        <td class="align-baseline"><strong>Data de Nascimento:</strong></td>
        <td id="table-dadosGerais-dtNascimento" class="align-baseline">${new Date(pacient.birthday).toLocaleDateString('pt-BR', { year: 'numeric', month: 'numeric', day: 'numeric' })} (${getAge(pacient.birthday)})</td>
      </tr>
      <tr>
        <td class="align-baseline"><strong>Peso:</strong></td>
        <td id="table-dadosGerais-peso" class="align-baseline">${pacient.weight} kg</td>
      </tr>
      <tr>
        <td class="align-baseline"><strong>Altura:</strong></td>
        <td id="table-dadosGerais-altura" class="align-baseline">${pacient.height} cm</td>
      </tr>
      <tr>
        <td class="align-baseline"><strong>Observações:</strong></td>
        <td id="table-dadosGerais-observacoes" class="align-baseline">${pacient.observations == 'None' ? '-' : d.data.observations}</td>
      </tr>
    </tbody>
  </table>`;
    $("#header-info-pacient").attr("title", title).tooltip('dispose').tooltip({title: title});

}

function translateCondition(condition) {
    if (condition == 'Obstructive') return 'Obstrutivo'
    if (condition == 'Healthy') return 'Saudável'
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
    getSessionUserCredentialValue,
    getCurrentPacient,
    getAge
};
