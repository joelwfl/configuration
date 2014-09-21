// from index.html:932
var defaultLocation = createLocation("HQ");
var oGetObsData = function (param) {
    if ((currentLocation) && (currentLocation["ObsData"]) && (currentLocation["ObsData"][param])) {
        return (currentLocation["ObsData"][param]);
    } else {
        return "";
    }
};
var oGetLocData = function (param) {
    if (currentLocation) {
        if (currentLocation[param]) {
            return (currentLocation[param]);
        }
        else {
            return "";
        }
    } else {
        return (defaultLocation[param]);
    }
};
var oGetFCData = function (index, param) {
    if ((currentLocation) && (currentLocation["ForecastData"]) && (currentLocation["ForecastData"]["forecastList"])) {
        var forecast = currentLocation["ForecastData"]["forecastList"];
        if (index < (forecast.length)) {
            if (forecast[index][param]) {
                if (param == 'dayIcon') {
                    return parseInt(forecast[index][param].replace("cond", ""));
                }
                else {
                    return forecast[index][param];
                }
            }
        }
    }
    return "";
};

var oGetAlertData = function (param) {
    if ((currentLocation) && (currentLocation["AlertData"]) && (currentLocation["AlertData"]["alertList"])) {
        var alertDList = currentLocation["AlertData"]["alertList"];
        if (alertDList.length > 0) {
            return alertDList[0][param];
        }
    }
    return "";
};

var oGetPollenData = function (param) {
    if ((currentLocation) && (currentLocation["PollenData"])) {
        switch (param) {
            case "type":
                if (currentLocation["PollenData"]["predominantType"])
                    return currentLocation["PollenData"]["predominantType"];
                break;
            case "level":
                var dayLevel = currentLocation["PollenData"]["dayList"];
                if (dayLevel && dayLevel.length > 0 && dayLevel[0].level)
                    return dayLevel[0].level;
                break;
        }
    }
    return "";
};

wxOAS_query = function () { return ('dummy=1' + wxOAS_targetparams() + wxOAS_creativeparams()) }
wxOAS_target = '_blank';
wxOAS_version = 10;
wxOAS_rn = '001234567890';
wxOAS_rns = '1234567890';
wxOAS_rn = new String(Math.random()); wxOAS_rns = wxOAS_rn.substring(2, 11);
wxOAS_version = 11;
wxOAS_oasRich_restart = false;


// From index.html:1005
var dmn = "chrome";
var wxOAS_sitepage = 'www.wbextension.com/chrome';
var wxOAS_url = 'http://pub.weatherbug.com/RealMedia/ads/';
var wxOAS_targetparams = function () {
    return ('&DMN=' + dmn + '&LNG=enUS&PC=z6286&Z3=' + oGetLocData('zipCode') + '&L1=' + oGetLocData('dma') + '&L2=' + oGetLocData('city') + '&L3=' + oGetLocData('state') + '&L5=' + oGetLocData('country') + '&WO1=' + oGetObsData('temperature') + '&WO3=' + oGetAlertData('typeId') + '&FC1=' + oGetFCData(0, 'dayIcon') + '&FC2=' + oGetFCData(1, 'dayIcon') + '&FC3=' + oGetFCData(2, 'dayIcon') + '&FC7=' + oGetFCData(1, 'high') + '&FC9=' + oGetFCData(2, 'high') + '&HO1=' + oGetPollenData('level') + '&HO4=' + oGetPollenData('type') + '&WO6=' + oGetObsData('press'));
}
var wxOAS_listpos = 'x13';
var wxOAS_creativeparams = function () {
    return ('&_RM_HTML_KEYWORDPC_=z6286&_RM_HTML_KEYWORDZ3_=' + oGetLocData('zipCode') + '&_RM_HTML_KEYWORDL1_=' + oGetLocData('dma') + '&_RM_HTML_KEYWORDL2_=' + oGetLocData('city') + '&_RM_HTML_KEYWORDL3_=' + oGetLocData('state') + '&_RM_HTML_KEYWORDWO1_=' + oGetObsData('temperature') + '&_RM_HTML_KEYWORDWO3_=' + oGetAlertData('typeId') + '&_RM_HTML_KEYWORDHO1_=' + oGetPollenData('level') + '&_RM_HTML_KEYWORDHO4_=' + oGetPollenData('type') + '&_RM_HTML_KEYWORDWO6=' + oGetObsData('press'));
}


function showAd(pos) {
    try {
        var currentSrc = document.querySelector('#wXx13-webview').src;

        var newSrc = wxOAS_url + 'adstream_sx.cgi/' + wxOAS_sitepage + '/1' + wxOAS_rns + '@' + wxOAS_listpos + '!' + pos + '?' + wxOAS_query();
        // test url        var newSrc = "http://pub.weatherbug.com/RealMedia/ads/adstream_sx.cgi/www.wthrwbug.com/FF/FashionForHer@x13?&LNG=enUS&PC=z6286&Z3=10001&L2=New+York&L3=NY&L5=USA&L1=501&L4=3&WO1=34.1&WO4=100&FC1=56&FC2=8&FC3=7&FC7=30&FC9=37&WO3=2&HO1=0.30";

        if (newSrc == currentSrc) {
            document.querySelector('#wXx13-webview').reload();
        } else {
            document.querySelector('#wXx13-webview').src = newSrc;
        }

        //omniture("OVERVIEW", "OVERVIEW");
    }
    catch (e) {
        //console.log('ERROR: show ad funct: ' + e.Message);
    }
}
