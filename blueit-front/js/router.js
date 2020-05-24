import { initCalibrationView } from './pages/calibracao.js';
import { initRegistroPacienteView } from './pages/registroPaciente.js';
import { initMinigameView } from './pages/minigames.js';
import { initDashboardView } from './pages/dashboard.js';
import { initPlataformView } from './pages/plataforma.js';
import { initMinigameCompareView } from './pages/minigamesComparativos.js';
import { initCalibrationCompareView} from './pages/calibracaoComparativos.js';
import { initPlataformCompareView} from './pages/plataformaComparativos.js';

page.base('/');

page('/', dashboard);
page('dashboard', dashboard);

page('token', token);

page('minigames', minigames);
page('minigames/minigamesComparativos', minigamesComparativos);

page('plataforma', plataforma);
page('plataforma/plataformaComparativos', plataformaComparativos);

page('calibracao', calibracao);
page('calibracao/calibracaoComparativos', calibracaoComparativos);

page('registroContaPaciente', registroContaPaciente);

page('login', login);

page('logout', logout);

page('cadastro', cadastro);

page('*', notfound);

page({ decodeURLComponents: false })

function dashboard() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("/views/dashboard.html", initDashboardView);
}

function token() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("/views/token.html");
}

function notfound() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("/views/notFound.html");
}

function minigames() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("/views/minigames.html", initMinigameView);
}

function minigamesComparativos() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load('/views/minigamesComparativos.html', initMinigameCompareView);
}

function plataforma() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("/views/plataforma.html", initPlataformView);
}

function plataformaComparativos() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("/views/plataformaComparativos.html", initPlataformCompareView);
}

function calibracao() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("/views/calibracao.html", initCalibrationView);
}

function calibracaoComparativos() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("/views/calibracaoComparativos.html", initCalibrationCompareView);
}

function registroContaPaciente() {
    if (!isAuthenticated()) {
        page.redirect('/login');
    }
    $('#main-content').load("/views/registroPaciente.html", initRegistroPacienteView);
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
    $('#main-content').load("./views/calibracaoComparativos.html");
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