function initPlataformCompareView() {
    $('#content-filters').load("./../shared/commonFilters.html");
    $('#compare-filters').load("./../shared/compareFilters.html");
    document.getElementById('plataformaComparativos-main-container').style.display = '';
};

export {
    initPlataformCompareView
}
