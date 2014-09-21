var OAS_RICH;

function sizeAd(source, target) {
    try {
        sdiv = jQuery("#" + source);
        tdiv = jQuery("#" + target);
        w = 0; w = sdiv.width();
        h = 0; h = sdiv.height();
        tdiv.css("width", w + "px");
        tdiv.css("height", h + "px");
    } catch (e) { }
}

function placeAd(source, target) {
    try {
        sdiv = jQuery("#" + source);
        tdiv = jQuery("#" + target);
        x = getX(tdiv);
        y = getY(tdiv);
        sdiv.css("left", x + "px");
        sdiv.css("top", y + "px");
        if (source.search(/bottom/i) >= 0) jQuery("#wXBottom").show();
        sdiv.css("visibility", "visible");

    } catch (e) { }
}

var bottomAdPrevPos = new Object;
bottomAdPrevPos.x = 0;
bottomAdPrevPos.y = 0;
var bottomAdPosTimer = false;

function placeBottomAd(source, target) {
    jQuery("#wXBottom").hide();
    sdiv = jQuery("#" + source);
    tdiv = jQuery("#" + target);
    x = getX(tdiv);
    y = getY(tdiv);
    if (bottomAdPosTimer) clearTimeout(bottomAdPosTimer);
    if ((bottomAdPrevPos.x == x) && (bottomAdPrevPos.y == y)) {
        bottomAdPrevPos.x = 0;
        bottomAdPrevPos.y = 0;
        placeAd('wXBottom', 'wXBottom-ad');
    } else {
        bottomAdPrevPos.x = x;
        bottomAdPrevPos.y = y;
        bottomAdPosTimer = setTimeout(function () {
            jQuery("#wXBottom").show();
            placeBottomAd('wXBottom', 'wXBottom-ad');
        }, 1000);
        return (true);
    }
    sdiv.css("visibility", "visible");
}

function getX(oElement) {
    var iReturnValue = 0;
    try {
        if (oElement.length > 0) {
            var offset = oElement.offset();
            iReturnValue += offset.left;
            oElement = oElement.offsetParent();
        }
    } catch (e) { }
    return iReturnValue;
}

function getY(oElement) {
    var iReturnValue = 0;
    try {
        if (oElement.length > 0) {
            var offset = oElement.offset();
            iReturnValue += offset.top;
            oElement = oElement.offsetParent();
        }
    } catch (e) { }
    return iReturnValue;
}

wxOAS_query = function () { return ('dummy=1' + wxOAS_targetparams() + wxOAS_creativeparams()) }
wxOAS_target = '_blank';
wxOAS_version = 10;
wxOAS_rn = '001234567890';
wxOAS_rns = '1234567890';
wxOAS_rn = new String(Math.random()); wxOAS_rns = wxOAS_rn.substring(2, 11);
wxOAS_version = 11;
wxOAS_oasRich_restart = false;

try {
    if ((navigator.userAgent.indexOf('Mozilla/3') != -1) || (navigator.userAgent.indexOf('Mozilla/4.0 WebTV') != -1)) wxOAS_version = 10;
} catch (e) { }

function setOAS_RICH() {

    jQuery.ajaxSetup({ async: false });
    
    oasRich = function () { return (wxOAS_url + 'adstream_mjx.ads/' + wxOAS_sitepage + '/1' + wxOAS_rns + '@' + wxOAS_listpos + '?' + wxOAS_query()) };
    var ajaxConnection = jQuery.get(oasRich(), function (data, textStatus) {
        var thisData = data.replace("document.write ", "jQuery('#wXx13-ad').append");
        thisData = thisData.replace("function OAS_RICH", "OAS_RICH = function");
        eval(thisData);
        thisData = null;
        ajaxConnection = null;
        wxOAS_AD('x13');
    }, "text");

    jQuery.ajaxSetup({ async: true });

}

function wxOAS_NORMAL(pos) {
    try {
        jQuery("#wX" + pos).html('<A HREF="' + wxOAS_url + 'click_nx.ads/' + wxOAS_sitepage + '/1' + wxOAS_rns + '@' + wxOAS_listpos + '!' + pos + '?' + wxOAS_query() + '" TARGET=' + wxOAS_target + '><IMG SRC="' + wxOAS_url + 'adstream_nx.ads/' + wxOAS_sitepage + '/1' + wxOAS_rns + '@' + wxOAS_listpos + '!' + pos + '?' + wxOAS_query() + '" BORDER=0></A>');
    }
    catch (e) { }
}

function wxOAS_AD(pos) {
    try {
        if (wxOAS_version >= 11) {
            if (window.OAS_url) {
                wxOAS_NORMAL(pos);
            } else {
                OAS_RICH(pos);
            }
        }
        else {
            wxOAS_NORMAL(pos);
        }
    }
    catch (e) {
        if (wxOAS_oasRich_restart) {
            wxOAS_version = 10;
            wxOAS_NORMAL(pos);
        }
        else {
            setTimeout(function () { wxOAS_AD(pos); }, 750);
            wxOAS_oasRich_restart = true;
        }
    }
}
var wXcdsPOS = false;

function querySt(ji) {
    hu = window.location.search.substring(1);
    gy = hu.split("&");
    for (i = 0; i < gy.length; i++) {
        ft = gy[i].split("=");
        if (ft[0] == ji) return ft[1];
    }
}


function getHttpObj() {
    var httpObj = null;
    try {
        httpObj = new ActiveXObject("Microsoft.XMLHTTP");
    }
    catch (error) {
        try {
            httpObj = new XMLHttpRequest();
        }
        catch (error) {
            httpObj = null;
        }
    }
    return httpObj;
}


