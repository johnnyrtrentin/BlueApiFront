function initCalibrationCompareView() {
    $('#content-filters').load("./../shared/commonFilters.html");
    $('#compare-filters').load("./../shared/compareFilters.html");
    document.getElementById('calibracaoComparativos-main-container').style.display = '';
};

export {
    initCalibrationCompareView
}
