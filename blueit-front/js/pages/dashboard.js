import {
    getSessionUserCredentialValue
} from './../app.js';

function initDashboardView() {
    if (getSessionUserCredentialValue('role') == "User") {
        callAjax(getSessionUserCredentialValue('pacientId'));
        document.getElementById('content-info').style.display = "none";
    } else if (getSessionUserCredentialValue('role') == "Administrator") {
        if ($("#pacient-select").val() != "") {
            document.getElementById('content-info').style.display = "none";
            callAjax($("#pacient-select").val());
        }
    }
}

function callAjax(userId) {
    $('#main-content').block({
        message: `Carregando...`
    });
    $.ajax({
        url: window.API_ENDPOINT + "pacients/" + userId,
        type: "GET",
        dataType: "json",
        beforeSend: function (r) {
            r.setRequestHeader("GameToken", getSessionUserCredentialValue('gameToken'));
        },
        success: function (d) {
            document.getElementById('table-dadosGerais-nome').textContent = d.data.name;
            document.getElementById('table-dadosGerais-sexo').textContent = d.data.sex == 'Male' ? 'Masculino' : 'Feminino';
            document.getElementById('table-dadosGerais-condicao').textContent = translateCondition(d.data.condition);
            document.getElementById('table-dadosGerais-dtNascimento').textContent = new Date(d.data.birthday).toLocaleDateString('pt-BR', { year: 'numeric', month: 'numeric', day: 'numeric' });
            document.getElementById('table-dadosGerais-peso').textContent = d.data.weight;
            document.getElementById('table-dadosGerais-altura').textContent = d.data.height;

            //Valores Pitaco
            document.getElementById('table-calibracaoPitaco-picoExp').textContent = `${d.data.capacitiesPitaco.expPeakFlow} L/min`;
            document.getElementById('table-calibracaoPitaco-duracaoExp').textContent = `${d.data.capacitiesPitaco.expFlowDuration} seg`;
            document.getElementById('table-calibracaoPitaco-picoIns').textContent = `${d.data.capacitiesPitaco.insPeakFlow} L/min`; 
            document.getElementById('table-calibracaoPitaco-duracaoIns').textContent = `${d.data.capacitiesPitaco.insFlowDuration} seg`;
            document.getElementById('table-calibracaoPitaco-frequencia').textContent = `${d.data.capacitiesPitaco.respiratoryRate}`;

            //Valores Mano
            document.getElementById('table-calibracaoMano-picoExp').textContent = `${d.data.capacitiesMano.expPeakFlow} L/min`;
            document.getElementById('table-calibracaoMano-duracaoExp').textContent = `${d.data.capacitiesMano.expFlowDuration} seg`;
            document.getElementById('table-calibracaoMano-picoIns').textContent = `${d.data.capacitiesMano.insPeakFlow} L/min`; 
            document.getElementById('table-calibracaoMano-duracaoIns').textContent = `${d.data.capacitiesMano.insFlowDuration} seg`;
            document.getElementById('table-calibracaoMano-frequencia').textContent = `${d.data.capacitiesMano.respiratoryRate}`;

            //Valores Cinta
            document.getElementById('table-calibracaoCinta-picoExp').textContent = `${d.data.capacitiesCinta.expPeakFlow} L/min`;
            document.getElementById('table-calibracaoCinta-duracaoExp').textContent = `${d.data.capacitiesCinta.expFlowDuration} seg`;
            document.getElementById('table-calibracaoCinta-picoIns').textContent = `${d.data.capacitiesCinta.insPeakFlow} L/min`; 
            document.getElementById('table-calibracaoCinta-duracaoIns').textContent = `${d.data.capacitiesCinta.insFlowDuration} seg`;
            document.getElementById('table-calibracaoCinta-frequencia').textContent = `${d.data.capacitiesCinta.respiratoryRate}`;

            $('#main-content').unblock();
        },
        error: function () {
            $('#main-content').unblock();
            alert("Ocorreu um erro ao carregar os dados. Reinicie a página e tente novamente");
        }
    });
}

function translateCondition(condition){
    if(condition == 'Obstructive') return 'Obstrutivo'
    if(condition == 'Healthy') return 'Saudável'
}

export {
    initDashboardView
};