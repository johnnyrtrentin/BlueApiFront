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
        data: filterObj,
        beforeSend: function (r) {
            r.setRequestHeader("GameToken", getSessionUserCredentialValue('gameToken'));
        },
        success: function (d) {
            $('#main-content').unblock();

            //Valores Pitaco
            document.getElementById('table-calibracaoPitaco-picoExp').textContent = d.data.capacitiesPitaco.expPeakFlow;
            document.getElementById('table-calibracaoPitaco-duracaoExp').textContent = d.data.capacitiesPitaco.expFlowDuration;
            document.getElementById('table-calibracaoPitaco-picoIns').textContent = d.data.capacitiesPitaco.insPeakFlow; 
            document.getElementById('table-calibracaoPitaco-duracaoIns').textContent = d.data.capacitiesPitaco.insFlowDuration;
            document.getElementById('table-calibracaoPitaco-frequencia').textContent = d.data.capacitiesPitaco.respiratoryRate;

            //Valores Mano
            document.getElementById('table-calibracaoMano-picoExp').textContent = d.data.capacitiesMano.expPeakFlow;
            document.getElementById('table-calibracaoMano-duracaoExp').textContent = d.data.capacitiesMano.expFlowDuration;
            document.getElementById('table-calibracaoMano-picoIns').textContent = d.data.capacitiesMano.insPeakFlow; 
            document.getElementById('table-calibracaoMano-duracaoIns').textContent = d.data.capacitiesMano.insFlowDuration;
            document.getElementById('table-calibracaoMano-frequencia').textContent = d.data.capacitiesMano.respiratoryRate;

            //Valores Cinta
            document.getElementById('table-calibracaoCinta-picoExp').textContent = d.data.capacitiesCinta.expPeakFlow;
            document.getElementById('table-calibracaoCinta-duracaoExp').textContent = d.data.capacitiesCinta.expFlowDuration;
            document.getElementById('table-calibracaoCinta-picoIns').textContent = d.data.capacitiesCinta.insPeakFlow; 
            document.getElementById('table-calibracaoCinta-duracaoIns').textContent = d.data.capacitiesCinta.insFlowDuration;
            document.getElementById('table-calibracaoCinta-frequencia').textContent = d.data.capacitiesCinta.respiratoryRate;
        },
        error: function () {
            $('#main-content').unblock();
            alert("Ocorreu um erro ao carregar os dados. Reinicie a página e tente novamente");
        }
    });
}

export {
    initCalibrationView
};