page.base('/');

page('/', dashboard);
page('dashboard', dashboard);

import { initMinigameView } from './pages/minigames.js';

page('token', token);

page('minigames', minigames);
page('minigames/minigamesHistorico', minigamesHistorico);

page('plataforma', plataforma);
page('plataforma/plataformaFase', plataformaFase);
page('plataforma/plataformaHistorico', plataformaHistorico);

page('calibracao', calibracao);
page('calibracao/calibracaoHistorico', calibracaoHistorico);

page('paciente', paciente);

page('login', login);

page('logout', logout);

page('cadastro', cadastro);

page('*', notfound);

page({decodeURLComponents:false})

function dashboard() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("./views/dashboard.html");
}

function token() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("./views/token.html");
}

function notfound() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("./views/notFound.html");
}

function minigames() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("./views/minigames.html", initMinigameView);
    ;
}

function minigamesHistorico() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("./views/minigamesHistorico.html");
}

function plataforma() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("./views/plataforma.html");
}

function plataformaFase() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("./views/plataformaFase.html");
}

function plataformaHistorico() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("./views/plataformaHistorico.html");
}

function calibracao() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("./views/calibracao.html");
}

function calibracaoHistorico() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("./views/calibracaoHistorico.html");
}

function paciente() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("./views/registroPaciente.html");
}


function login() {
    window.location.href = "/login.html";
}

function logout() {
    sessionStorage.clear();
    page.redirect('/login');
}

function cadastro() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("./views/calibracaoHistorico.html");
}

function isAuthenticated() {
    var storedUserCredentials = sessionStorage.getItem('userCredentials');
    if (storedUserCredentials == null || userCredentials == 'undefined') {
        console.log("Storage Null");
        return false;
    }
    var userCredentials = JSON.parse(storedUserCredentials);
    var isValidCredentials = validateUserCredentials(userCredentials);
    if (!isValidCredentials)
        return false;
    else
        return true;
}

function validateUserCredentials(userCredentials) {
    var keysNeeded = ['fullname', 'gameToken', 'userId', 'authExpirationTime', 'authTime'];
    var keys = Object.keys(userCredentials);
    var hasAllKeys = keysNeeded.every(x => keys.indexOf(x) >= 0)
    return hasAllKeys;
}