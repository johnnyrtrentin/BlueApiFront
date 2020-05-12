import Observable from './Observable.js';

window.API_ENDPOINT = "http://localhost:7071/api/";

const pacientsSelectObservers = new Observable();

$(document).ready(function () {
    $('#modalUser').load("./shared/modalUser.html", function(){});
    $('#header').load("./shared/header.html", function () {
        var userRole = JSON.parse(sessionStorage.getItem('userCredentials')).role;
        if (userRole == "User") {
            var el = document.getElementById('pacient-select-container');
            el.parentNode.removeChild(el);
            el = document.getElementById('pacient-token-option');
            el.parentNode.removeChild(el);
        }
        else {
            document.getElementById('pacient-select').addEventListener('change', function () {
                pacientsSelectObservers.notify(this.options[this.selectedIndex].value);
            });
        }

    });
    $('#footer').load("./shared/footer.html");
    $('#sidebar').load("./shared/sidebar.html");
});