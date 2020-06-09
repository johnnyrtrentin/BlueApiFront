import {
    getSessionUserCredentialValue
} from './../app.js';

function initRegistroPacienteView() {

    if (getSessionUserCredentialValue('role') == "User") {
        callAjax(getSessionUserCredentialValue('pacientId'));
        document.getElementById('content-info').style.display = "none";
        document.getElementById('registroPaciente-main-container').style.display = '';
    } else if (getSessionUserCredentialValue('role') == "Administrator") {
        if ($("#pacient-select").val() != "") {
            document.getElementById('content-info').style.display = "none";
            document.getElementById('registroPaciente-main-container').style.display = '';
            callAjax($("#pacient-select").val());
        }
    }
}

function updateRegistroPacienteView() {
    if ($("#pacient-select").val() != "") {
        document.getElementById('registroPaciente-main-container').style.display = '';
        document.getElementById('content-info').style.display = "none";
        callAjax($("#pacient-select").val());
    }
}

function callAjax(pacientId) {
    $('#main-content').block({
        message: `Carregando...`
    });
    $.ajax({
        url: `${window.API_ENDPOINT}/pacients/${pacientId}/account`,
        type: "GET",
        dataType: "json",
        beforeSend: function (r) {
            r.setRequestHeader("GameToken", getSessionUserCredentialValue('gameToken'));
        },
        success: function (d) {

            if (d.data != null && d.data != undefined) {
                ;
                document.getElementById('inputUsername').value = d.data.username;
                document.getElementById('inputUsername').readOnly = true;
                document.getElementById('inputPassword').value = d.data.password;
                document.getElementById('inputPassword').readOnly = true;
                document.getElementById('btnCriarContaPaciente').disabled = true;
            }
            else {
                var alertDiv = document.getElementById("errorForm");
                alertDiv.innerHTML = "";
                var content = document.createTextNode("O paciente ainda não possui uma conta de acesso ao sistema!");
                alertDiv.appendChild(content);
                document.getElementById("errorForm").style.visibility = "visible";
                $('.container').unblock();
            }
            $('#main-content').unblock();
        },
        error: function () {
            $('#main-content').unblock();
            alert("Ocorreu um erro ao carregar os dados. Reinicie a página e tente novamente"); //alerta de erro
        }

    });
}

export {
    initRegistroPacienteView,
    updateRegistroPacienteView
}