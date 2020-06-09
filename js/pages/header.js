import {
    getSessionUserCredentialValue
} from './../app.js';

function initHeader() {

    let fullname = getSessionUserCredentialValue('fullname');
    let gameToken = getSessionUserCredentialValue('gameToken');
    let role = getSessionUserCredentialValue('role');

    $( document ).ready(function(){
        let el = document.getElementById('userWelcome');
        let boldEl = document.createElement('strong');
        let textNode = document.createTextNode("Olá " + fullname + "!");
        boldEl.appendChild(textNode);
        el.appendChild(boldEl);

        $('[data-toggle="tooltip"]').tooltip({html: true})
    
        if (role == "Administrator") {
            if (gameToken == '') {
                document.getElementById('pacient-select_label').style.display = '';
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
            document.getElementById('pacient-select_label').style.display = '';
            document.getElementById('pacient-select-info').style.display = "none";

            var sel = document.getElementById('pacient-select');
            sel.style.display = "block";

            var pacientInfos = d.data.map(p => ({ name: p.name, pacientData: p }));

            for (var i = 0; i < pacientInfos.length; i++) {
                var opt = document.createElement('option');
                opt.appendChild(document.createTextNode(pacientInfos[i].name));
                opt.value = JSON.stringify(pacientInfos[i].pacientData);
                sel.appendChild(opt);
            }
            $('#pacient-select').selectpicker();
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