import {
    setPacientsInHeader
} from './header.js';

function initToken() {

    $('[data-toggle="popover"]').popover({
        placement: 'right',
        delay: {
            "hide": 100
        }
    });
    $('[data-toggle="popover"]').click(function () {
        setTimeout(function () {
            $('.popover').fadeOut('slow');
        }, 3000);

    });
    var userToken = JSON.parse(sessionStorage.getItem('userCredentials')).gameToken;
    var inputEl = document.getElementById('inputToken');
    if (userToken == "")
        inputEl.value = "Você não gerou uma Chave de Acesso.";
    else {
        inputEl.value = userToken;
        document.getElementById('btnGenerateToken').disabled = true;
    }

    $("#btnCopyTokenToClipboard").on("click", function (e) {
        var inputToken = document.getElementById('inputToken');
        inputToken.select();
        inputToken.setSelectionRange(0, 99999); /*For mobile devices*/
        /* Copy the text inside the text field */
        document.execCommand("copy");
    })

    $("#btnGenerateToken").on("click", function (e) {
        $('#main-content').block({
            message: `Gerando... Por favor, aguarde.`
        });

        $.ajax({
            url: window.API_ENDPOINT + "/token",
            data: JSON.stringify({
                userId: JSON.parse(sessionStorage.getItem('userCredentials')).userId,
            }),
            type: "POST",
            dataType: "json",
            success: function (d) {
                document.getElementById('inputToken').value = d.data.gameToken;
                var userCredentials = JSON.parse(sessionStorage.getItem('userCredentials'));
                userCredentials.gameToken = d.data.gameToken;
                sessionStorage.setItem('userCredentials', JSON.stringify(userCredentials));
                document.getElementById('btnGenerateToken').disabled = true;
                $('.alert').show();
                setPacientsInHeader();
                $('#main-content').unblock();
            },
            error: function (e) {
                $('#main-content').unblock();
            }

        });

    });

}

export {
    initToken
}