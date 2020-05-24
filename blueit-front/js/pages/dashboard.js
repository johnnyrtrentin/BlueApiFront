import {
    getSessionUserCredentialValue
} from './../app.js';

function initDashboardView() {
    
    if (getSessionUserCredentialValue('role') == "User") {
        callAjax(getSessionUserCredentialValue('pacientId'));
        document.getElementById('content-info').style.display = "none";
        document.getElementById('dashboard-main-container').style.display = '';
    } else if (getSessionUserCredentialValue('role') == "Administrator") {
        if ($("#pacient-select").val() != "" && $("#pacient-select").val() != undefined) {
            document.getElementById('content-info').style.display = "none";
            document.getElementById('dashboard-main-container').style.display = '';
            callAjax($("#pacient-select").val());
        }
    }
};

function updateDashboardView() {
    if ($("#pacient-select").val() != "") {
        document.getElementById('dashboard-main-container').style.display = '';
        document.getElementById('content-info').style.display = "none";
        callAjax($("#pacient-select").val());
    }
}

function callAjax(userId) {
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
            document.getElementById('table-dadosGerais-nome').textContent = d.data.name;
            document.getElementById('table-dadosGerais-sexo').textContent = d.data.sex == 'Male' ? 'Masculino' : 'Feminino';
            document.getElementById('table-dadosGerais-condicao').textContent = translateCondition(d.data.condition);
            document.getElementById('table-dadosGerais-dtNascimento').textContent = new Date(d.data.birthday).toLocaleDateString('pt-BR', { year: 'numeric', month: 'numeric', day: 'numeric' });
            document.getElementById('table-dadosGerais-peso').textContent = d.data.weight;
            document.getElementById('table-dadosGerais-altura').textContent = d.data.height;

            $('#main-content').unblock();
        },
        error: function () {
            $('#main-content').unblock();
            alert("Ocorreu um erro ao carregar os dados. Reinicie a página e tente novamente");
        }
    });
}

function translateCondition(condition) {
    if (condition == 'Obstructive') return 'Obstrutivo'
    if (condition == 'Healthy') return 'Saudável'
}

export {
    initDashboardView,
    updateDashboardView
};