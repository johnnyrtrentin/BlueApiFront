import {
    getSessionUserCredentialValue
} from './../app.js';

function initMinigameCompareView() {
    $('#content-filters').load("./../shared/commonFilters.html");
    $('#compare-filters').load("./../shared/compareFilters.html");
    document.getElementById('minigamesComparativos-main-container').style.display = '';
};

export {
    initMinigameCompareView
}
