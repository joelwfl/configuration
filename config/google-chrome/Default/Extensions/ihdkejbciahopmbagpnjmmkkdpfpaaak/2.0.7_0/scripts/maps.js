var mapInitialized = false;

jQuery(document).ready(function() {

    // Close Map Panel
    jQuery("#map-panel #map-panel-header .close-button").click(function() {

        if (document.getElementById("video")) {
            document.getElementById("video").play();
        }

        // Hide Panel
        jQuery("#map-panel").fadeOut(100, function() {            
            jQuery("#map-panel").removeClass("full-screen-panel");
            jQuery("#map-panel .full-screen-button").removeClass("minimize-panel-button");
        });
        openPanel = "";

        sendMessageToSandbox({type:"closeMap"});
        
        placeAdsTimer(true);
        omniture("HOME", "HOME PAGE");
    });


    jQuery("#map-panel .full-screen-button").toggle( function() {
            omniture("RADAR ENLARGE", "RADAR ENLARGE");
            jQuery("#map-panel").addClass("full-screen-panel");
            jQuery("#map-panel .full-screen-button").addClass("minimize-panel-button");
            jQuery("#map-panel .full-screen-button").attr("title", "minimize");
        },
        function( ){

            placeAdsTimer(true);
            omniture("RADAR", "RADAR");

            jQuery("#map-panel").removeClass("full-screen-panel");
            jQuery("#map-panel .full-screen-button").removeClass("minimize-panel-button");
            jQuery("#map-panel .full-screen-button").attr("title", "maximize");
        }
    );


    jQuery("#layer-select").selectmenu({
        style: "dropdown", width: 200,
        change: function () {
            sendMessageToSandbox({type:"stopAnimation"});
            sendMessageToSandbox({type:"resetAnimation"});

            var thisLayer = jQuery(this).selectmenu("value");
            if (currentLocation["isUs"]) {
                setSettingsMapLayer(thisLayer, false);
            }
            else {
                setSettingsMapLayer(thisLayer, true);
            }
            getAnimationTiles(thisLayer);
            thisLayer = null;

            placeAdsTimer(true);
            omniture("RADAR", "RADAR");

            return (true);
        }
    });

});

function sendMessageToSandbox(message) {

    var myIframe = document.getElementById('map-iframe');
    var myIframeWin = myIframe.contentWindow;
    myIframeWin.postMessage(message, '*');
}

function initMap() {

    // Initialize the map
    var initMessage = {};
    initMessage.type = "init";
    initMessage.zoom = settingsMapZoom;
    initMessage.centerLat = currentLocation["lat"];
    initMessage.centerLon = currentLocation["lon"];
    initMessage.scrollwheel = changedSettings.settings["mapScrollWheel"];
    sendMessageToSandbox(initMessage);
}

function updateLocations() {

    // Send locations
    var updateLocationMessage = {};
    updateLocationMessage.type = "updateLocations";
    updateLocationMessage.locations = savedLocations.locations;
    sendMessageToSandbox(updateLocationMessage);
}

function centerMapOnLocation(location) {

    var centerMapMessage = {
        type: 'centerMap',
        location: location
    };
    sendMessageToSandbox(centerMapMessage);
}

function showLayer(layerId) {

    var showLayerMessage = {
        type: 'showLayer',
        layerId: layerId
    };
    sendMessageToSandbox(showLayerMessage);
}

function getAnimationTiles(layerId) {

    var getAnimationTilesMessage = {
        type: 'getAnimationTiles',
        layerId: layerId
    };
    sendMessageToSandbox(getAnimationTilesMessage);
}

function setSettingsMapLayer(layerId, intl) {
    var setSettingsMapLayerMessage;
    if (intl) {
        setSettingsMapLayerMessage = {
            type: 'setSettingsIntlMapLayer',
            layerId: layerId
        };
    } else {
        setSettingsMapLayerMessage = {
            type: 'setSettingsMapLayer',
            layerId: layerId
        };
    }
    sendMessageToSandbox(setSettingsMapLayerMessage);
}

mapWorker.onmessage = function (evt) {
    var location = savedLocations.locations[parseInt(evt.data.data)];
    //console.log(evt.data.type);
    switch (evt.data.type) {
        case "load map ui":
            jQuery("#map-icon").bind("click", function () {
                mapWorker.postMessage({ type: "load" });
                mapWorker.postMessage({ type: "display" });
            }).fadeIn("fade", "fast");
            break;
        case "load":
            if (!mapInitialized) {
                initMap();
                mapInitialized = true;
            } 
            if (currentLocation["isUs"]) {
                if (jQuery("#layer-select").selectmenu("value") != jQuery("#layer-select option[value=" + settingsMapLayer + "]").index()) {
                    jQuery("#layer-select").selectmenu("value", jQuery("#layer-select option[value=" + settingsMapLayer + "]").index());
                }
            } else {
                if (jQuery("#layer-select").selectmenu("value") != jQuery("#layer-select option[value=" + settingsIntlMapLayer + "]").index()) {
                    jQuery("#layer-select").selectmenu("value", jQuery("#layer-select option[value=" + settingsIntlMapLayer + "]").index());
                }
            }
            updateLocations();

            if (location) {
                centerMapOnLocation(location);
            }

            break;
        case "display":

            if (openPanel != "maps") {
                // Pause the video
                if (document.getElementById("video")) {
                    document.getElementById("video").pause();
                }

                // Make sure all other panels are closed
                closeAllPanels();

                // Show the Map Panel
                omniture("RADAR", "RADAR");
                jQuery("#map-panel").fadeIn(100, function() {

                    centerMapOnLocation(currentLocation);

                    if (currentLocation["isUs"]) {
                        getAnimationTiles(settingsMapLayer);
                        setSettingsMapLayer(settingsMapLayer, false);
                    } else {
                        getAnimationTiles(settingsIntlMapLayer);
                        setSettingsMapLayer(settingsIntlMapLayer, true);
                    }
                });
                openPanel = "maps";
            }

            // Refresh the ad
            placeAdsTimer(true);
            break;
    }
    return (true);
}
