import {
    getSessionUserCredentialValue
} from './../app.js';

function initHeader() {
    debugger

    let fullname = getSessionUserCredentialValue('fullname');
    let gameToken = getSessionUserCredentialValue('gameToken');
    let role = getSessionUserCredentialValue('role');

    $( document ).ready(function(){
        let el = document.getElementById('userWelcome');
        let boldEl = document.createElement('strong');
        let textNode = document.createTextNode("Olá " + fullname + "!");
        boldEl.appendChild(textNode);
        el.appendChild(boldEl);
    
        if (role == "Administrator") {
            if (gameToken == '') {
                document.getElementById('pacient-select_label').style.display = 'none';
                document.getElementById('pacient-select-info').innerText = "Você ainda não gerou uma chave de acesso!.";
                return;
            }
            setPacientsInHeader();
        }
    });
    
}

function setPacientsInHeader() {

    let gameToken = getSessionUserCredentialValue('gameToken');
    $.ajax({
        url: `${window.API_ENDPOINT}/pacients?sort=asc`,
        type: "GET",
        dataType: "json",
        beforeSend: function (r) {
            r.setRequestHeader("GameToken", gameToken);
        },
        success: function (d) {
            document.getElementById('pacient-select-info').style.display = "none";

            var sel = document.getElementById('pacient-select');
            sel.style.display = "block";

            var pacientInfos = d.data.map(x => ({ nome: x.name, pacientId: x._id }));

            for (var i = 0; i < pacientInfos.length; i++) {
                var opt = document.createElement('option');
                opt.appendChild(document.createTextNode(pacientInfos[i].nome));
                opt.value = pacientInfos[i].pacientId;
                sel.appendChild(opt);
            }
            $('#pacient-select').selectpicker();

            document.getElementById('pacient-select_label').style.display = 'none';
        },
        error: function (e) {
            document.getElementById('pacient-select-info').innerText = "Ocorreu um erro! Por favor, atualize a página.";
        }
    });
}

export {
    initHeader,
    setPacientsInHeader
}