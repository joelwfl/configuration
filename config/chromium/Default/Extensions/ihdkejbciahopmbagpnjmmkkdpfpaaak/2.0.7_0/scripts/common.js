var openPanel = "";
var online = navigator.onLine;

var isForecastSummaryTabShowing = false;

//	DOCUMENT READY / INIT FUNCTIONS	//
jQuery(document).ready(function() {

    // Online/Offline stuff
    updateOnlineStatus("load");
    window.addEventListener("offline", function(e) {
        updateOnlineStatus("offline");
    }, false);
    window.addEventListener("online", function(e) {
        updateOnlineStatus("online");
    }, false);

    // Initialize the app
	worker.postMessage({ type: "initialize" });

    // Dynamic Image loading library - https://github.com/GoogleChrome/apps-resource-loader
    RAL.debug = false;
    RAL.Queue.start();

    // Close Obs Panel
    jQuery("#obs-panel .panel-dialog-header .close-button").click(function() {

        if (document.getElementById("video")) {
            document.getElementById("video").play();
        }
        worker.postMessage({ type: "update window pane", data: currentLocation["index"] });

        // Hide Panel
        jQuery("#obs-panel").fadeOut(100);
        openPanel = "";
        
        placeAdsTimer(true);
        omniture("HOME", "HOME PAGE");
    });

    // Close Cameras Panel
    jQuery("#cameras-panel .panel-dialog-header .close-button").click(function() {

        if (document.getElementById("video")) {
            document.getElementById("video").play();
        }
        worker.postMessage({ type: "update window pane", data: currentLocation["index"] });

        // Hide Panel
        jQuery("#cameras-panel").fadeOut(100);
        jQuery(document).unbind("keydown");
        openPanel = "";
        
        placeAdsTimer(true);
        omniture("HOME", "HOME PAGE");
    });

    // Close Forecast Panel
    jQuery("#forecast-panel .panel-dialog-header .close-button").click(function() {

        if (document.getElementById("video")) {
            document.getElementById("video").play();
        }
        worker.postMessage({ type: "update window pane", data: currentLocation["index"] });

        // Hide Panel
        jQuery("#forecast-panel").fadeOut(100);
        openPanel = "";
        
        placeAdsTimer(true);
        omniture("HOME", "HOME PAGE");
    });

    // Close Alerts Panel
    jQuery("#alerts-panel .panel-dialog-header .close-button").click(function() {

        if (document.getElementById("video")) {
            document.getElementById("video").play();
        }
        worker.postMessage({ type: "update window pane", data: currentLocation["index"] });

        // Hide Panel
        jQuery("#alerts-panel").fadeOut(100);
        jQuery("#alerts").accordion("destroy");
        openPanel = "";
        
        placeAdsTimer(true);
        omniture("HOME", "HOME PAGE");
    });

    // Close App
    jQuery("#window-options-conatiner #close-app-icon").click(function() {
        window.close();
    });
    // Minimize App
    jQuery("#window-options-conatiner #minimize-app-icon").click(function() {
        chrome.app.window.current().minimize();
    });

    // Ad Click event
    document.getElementById("wXx13-webview").addEventListener('newwindow', function (event) {

        event.preventDefault();
        window.open(event.targetUrl);
    });


	return (true);
});

function updateOnlineStatus(msg) {
    online = navigator.onLine;
    var condition = online ? "ONLINE" : "OFFLINE";
    //console.log("Event: " + msg + "; status=" + condition + "\n");

    if (!online) {
        jQuery("#help-icon").hide();
        jQuery("#settings-icon").hide();
        displayOfflineMessage();
    } else {
        closeOfflineMessage();
        //displayOfflineMessage();

        if (msg != "load") {
            // refresh the data
            windowUnload();
            jQuery("#refresh-icon .ui-icon").css("-webkit-transition", "-webkit-transform 0.75s ease-out")
            jQuery("#refresh-icon .ui-icon").css("-webkit-transform", "rotate(360deg)")
            setTimeout(function () {
                jQuery("#refresh-icon .ui-icon").css("-webkit-transition", "")
                jQuery("#refresh-icon .ui-icon").css("-webkit-transform", "");
            }, 750);
            jQuery("#social-iframe").attr("src", jQuery("#social-iframe").attr("src"));
            locationWorker.postMessage({ type: "locations", arg: "load" });
        }

        jQuery("#help-icon").show();
        jQuery("#settings-icon").show();
    }
}

function displayOfflineMessage() {
    jQuery("#offline-panel").show();
}

function closeOfflineMessage() {
    jQuery("#offline-panel").hide();
}

function closeAllPanels() {
    jQuery("#obs-panel").fadeOut(100);
    jQuery("#map-panel").fadeOut(100);
    jQuery("#cameras-panel").fadeOut(100);
    jQuery("#forecast-panel").fadeOut(100);
    jQuery("#alerts-panel").fadeOut(100);
    openPanel = "";
}

function windowUnload()	{
	worker.postMessage({ type: "stop timers" });
	// reset weather data so it's all requested again at the next reload.
	for (var i = 0; i < savedLocations.locations.length; i++) {
		savedLocations.locations[i]["AlertData"] = new Object();
		savedLocations.locations[i]["ObsData"] = new Object();
		savedLocations.locations[i]["UvData"] = new Object();
		savedLocations.locations[i]["ForecastData"] = new Object();
		savedLocations.locations[i]["CameraListData"] = new Object();
		savedLocations.locations[i]["PollenData"] = new Object();
	}

    chrome.storage.local.set({ 'savedLocations': savedLocations }, function () {
        //console.log("Saved locations completed (windowUnload)");
    });

	return(true);
}

//	GLOBAL LOCATION & GEOLOCATION VARIABLES	//
var currentLocation;
var savedLocations = new Object;
	savedLocations.locations = [];

//	GLOBAL OPTIONS & SETTINGS VARIABLES	//
var settingsMapType = "";
var settingsMapScrollWheel = true;
var settingsMapZoom = 6;
var settingsIntlMapLayer = 47;
var settingsMapLayer = 52;
var settingsMapOpacity = 0.75;
var settingsUnits = 0;
var settingsIntlUnits = 0;
var settingsShowCameraInWindow = 0
var settingsShowAlertNotifications = true;
var settingsPlayAlertSound = true;
var settingsShowWeatherBugTweets = true;

var savedSettings = new Object;
	savedSettings.settings = new Object();
	savedSettings.settings["units"] = settingsUnits;
	savedSettings.settings["intlUnits"] = settingsIntlUnits;
	savedSettings.settings["mapScrollWheel"] = settingsMapScrollWheel;
	savedSettings.settings["showCameraInWindow"] = settingsShowCameraInWindow;
	savedSettings.settings["showAlertNotifications"] = settingsShowAlertNotifications;
	savedSettings.settings["playAlertSound"] = settingsPlayAlertSound
	savedSettings.settings["showWeatherBugTweets"] = settingsShowWeatherBugTweets;

var changedSettings;
	changedSettings = JSON.parse(JSON.stringify(savedSettings));
	
//	TIMERS, INTERVALS & SUCH	//
var ajaxTimeout = 750;

var milisecs = 1;
var secs = 1000 * milisecs;
var mins = 60 * secs;
var hrs = 60 * mins;
var days = 24 * hrs;
var wks = 7 * days;

var alertCheckerInterval = 5 * mins;
var obsCheckerInterval = 5 * mins;
var uvCheckerInterval = 1 * hrs;
var forecastCheckerInterval = 1 * hrs;
var cameraCheckerInterval = 10 * mins;
var locationCheckerInterval = 7 * days;
var animationTilesCheckerInterval = 5 * mins;
var tweetCheckerInterval = 15 * mins;
var pollenCheckerInterval = 1 * hrs;

//	UI VARS	//
var manifest;
var locationMenuOffset = 0;
var dialogPosition = ['center', 100];
var alertDialog;
var forceAlertDialog = false;
var geolocationPermissionDenied = false;


//	WEB WORKER FUNCTIONS	//
var worker = new Worker("scripts/worker.js");
var locationWorker = new Worker("scripts/worker.js");
var mapWorker = new Worker("scripts/worker.js");
var tweetWorker = new Worker("scripts/worker.js");

worker.onmessage = function (evt) {
    //console.log(evt.data.type);
    switch (evt.data.type) {
        case "initialize":
            worker.postMessage({ type: "get manifest" });
            worker.postMessage({ type: "settings", arg: "load" });
            jQuery("#obs-icon").button({ text: false, icons: { primary: "ui-icon-obs"} });
            jQuery("#forecast-icon").button({ text: false, icons: { primary: "ui-icon-forecast"} });
            jQuery("#map-icon").button({ text: false, icons: { primary: "ui-icon-map"} }).show("fade", "fast");
            jQuery("#settings-icon").bind("click", function () { worker.postMessage({ type: "settings", arg: "display" }); });
            jQuery("#help-icon").bind("click", function () { worker.postMessage({ type: "help", arg: "display" }); });
            jQuery("#add-location").bind("click", function () { locationWorker.postMessage({ type: "locations", arg: "search" }); }).find("button").button({ text: true, icons: { primary: "ui-icon-plusthick"} }).show("fade", "fast");
            jQuery("#next-location, #prev-location").equalizeWidths();

            jQuery("#showCameraInWindow").bind("click", function () {
                changedSettings.settings["showCameraInWindow"] = settingsShowCameraInWindow = jQuery(this).attr("checked");
                worker.postMessage({ type: "update window pane", data: currentLocation["index"] });
            });
            locationWorker.postMessage({ type: "locations", arg: "get" });
            worker.postMessage({ type: "set date" });
            mapWorker.postMessage({ type: "load map ui" });
            jQuery("#refresh-icon").button({ text: false, icons: { primary: "ui-icon-refresh"} }).bind("click", function () {
                windowUnload();
                jQuery("#refresh-icon .ui-icon").css("-webkit-transition", "-webkit-transform 0.75s ease-out")
                jQuery("#refresh-icon .ui-icon").css("-webkit-transform", "rotate(360deg)")
                setTimeout(function () {
                    jQuery("#refresh-icon .ui-icon").css("-webkit-transition", "")
                    jQuery("#refresh-icon .ui-icon").css("-webkit-transform", "");
                }, 750);
                locationWorker.postMessage({ type: "locations", arg: "load" });
            }).show();
            jQuery("#search-location-wrap input[type=text]").unbind("keypress").bind("keypress", function (e) {
                if (e.keyCode == 13) jQuery("#searchButton").trigger("click");
            });
            break;
        case "get manifest":
            // This success callback never gets called, however, ajax does get file
            var ajaxConnection = jQuery.get("manifest.json", function (data, textStatus) {
                if (textStatus != "success") {
                    setTimeout(function () {
                        worker.postMessage({ type: "get manifest" });
                    }, ajaxTimeout);
                    return (false);
                }
                manifest = JSON.parse(data);
                jQuery(".version").html(manifest["version"]);
                url = ajaxConnection = null;
            }, "text");

            break;
        case "start timers":
            for (var i = 0; i <= savedLocations.locations.length - 1; i++) {
                var thisLocation = savedLocations.locations[i];
                worker.postMessage({ type: "alert", arg: "start timer", data: thisLocation["index"] });
                worker.postMessage({ type: "obs", arg: "start obs timer", data: thisLocation["index"] });
                worker.postMessage({ type: "forecast", arg: "start forecast timer", data: thisLocation["index"] });
                worker.postMessage({ type: "cameras", arg: "start timer", data: thisLocation["index"] });
            }
            break;
        case "stop timers":
            for (var i = 0; i <= savedLocations.locations.length - 1; i++) {
                var thisLocation = savedLocations.locations[i];
                worker.postMessage({ type: "alert", arg: "stop timer", data: thisLocation["index"] });
                worker.postMessage({ type: "obs", arg: "stop obs timer", data: thisLocation["index"] });
                worker.postMessage({ type: "forecast", arg: "stop forecast timer", data: thisLocation["index"] });
                worker.postMessage({ type: "pollen", arg: "stop pollen timer", data: thisLocation["index"] });
                worker.postMessage({ type: "cameras", arg: "stop timer", data: thisLocation["index"] });
            }
            break;
        case "set date":
            jQuery("#date").html(new Date().formatDate("MMM dd, yyyy"));
            jQuery("#time").html(new Date().formatDate("hh:mm T"));
            setTimeout(function () {
                worker.postMessage({ type: "set date" });
            }, 1 * mins);
            break;
        case "ads":
            switch (evt.data.arg) {
                case "place ads":
                    //console.log('place ads');
                    showAd('x13');
                    break;
                case "display ads":
                    //console.log('display ads');
                    worker.postMessage({ type: "ads", arg: "place ads" });
                    break;
            }
            break;
        case "set location menu":

            var index = evt.data.arg;

            if (index >= 3) {
                var thisScroll = -((index - 3) * jQuery(".location.location0").outerWidth(true));
                jQuery("#locations").animate({ "margin-left": thisScroll + "px" }, "fast");
                locationMenuOffset = savedLocations.locations.length - 4;
            }

            // Enable/Disable Prev/Next Location buttons
            if (savedLocations.locations.length > 4) {
                if (index == savedLocations.locations.length - 1) { // Last location in location list
                    jQuery("#next-location").button("disable");
                    jQuery("#prev-location").button("enable");
                } else if (index < 4  && jQuery("#locations").css('margin-left') == "0px") {    // One of the first four locations in the list
                    jQuery("#next-location").button("enable");
                    jQuery("#prev-location").button("disable");
                } else {
                    jQuery("#next-location").button("enable");
                    jQuery("#prev-location").button("enable");
                }
            } else {
                jQuery("#next-location").button("disable");
                jQuery("#prev-location").button("disable");
            }
            break;
        case "first location":
            jQuery("#locations").animate({ "margin-left": 0 }, "fast");
            jQuery("#next-location").button("enable");
            locationMenuOffset = 0;
            break;
        case "last location":
            var thisScroll = -((savedLocations.locations.length - 4) * jQuery(".location.location0").outerWidth(true));
            jQuery("#locations").animate({ "margin-left": thisScroll + "px" }, "fast");
            jQuery("#prev-location").button("enable");
            locationMenuOffset = savedLocations.locations.length - 4;
            break;
        case "next location":
            if (jQuery("#next-location").hasClass("ui-button-disabled")) return (true);
            var thisOffset = parseInt(locationMenuOffset + 4);
            var thisScroll = -(parseInt(++locationMenuOffset * jQuery(".location.location0").outerWidth(true))) + "px";
            jQuery(".location-button").button("disable");
            jQuery("#locations").animate({ "margin-left": thisScroll }, "fast", function () {
                jQuery("#prev-location").button("enable");
                if (++thisOffset == savedLocations.locations.length) {
                    jQuery("#next-location").button("disable");
                } else {
                    jQuery("#next-location").button("enable");
                }
            });
            break;
        case "previous location":
            if (jQuery("#prev-location").hasClass("ui-button-disabled")) return (true);
            var thisScroll = -(parseInt(--locationMenuOffset * jQuery(".location.location0").outerWidth(true))) + "px";
            jQuery(".location-button").button("disable");
            jQuery("#locations").animate({ "margin-left": thisScroll }, "fast", function () {
                jQuery("#next-location").button("enable");
                if (locationMenuOffset == 0) {
                    jQuery("#prev-location").button("disable");
                } else {
                    jQuery("#prev-location").button("enable");
                }
            });
            break;
        case "settings":
            switch (evt.data.arg) {
                case "load":
                    chrome.storage.local.get("savedSettings", function(val) {

                        if (val.savedSettings) {

                            savedSettings = val.savedSettings;
                            changedSettings = savedSettings;

                            for (var setting in savedSettings.settings) {
                                var thisSettingElement = jQuery("input[name=" + setting + "]");
                                if (thisSettingElement.attr("type") == "radio") {
                                    thisSettingElement = jQuery("input[name=" + setting + "][value=" + savedSettings.settings[setting] + "]");
                                    jQuery(thisSettingElement).attr("checked", true);
                                } else if (thisSettingElement.attr("type") == "checkbox") {
                                    thisSettingElement.attr("checked", savedSettings.settings[setting]);
                                }
                            }
                        }
                    });
                    break;
                case "display":
                    jQuery("#settings-wrap input[type=radio]").each(function () {
                        jQuery(this).unbind("change").bind("change", function () {
                            changedSettings.settings[jQuery(this).attr("name")] = jQuery(this).attr("value");
                            for (var i = 0; i < savedLocations.locations.length; i++) {
                                worker.postMessage({ type: "stop timers" });
                                savedLocations.locations[i]["AlertData"] = new Object();
                                savedLocations.locations[i]["ObsData"] = new Object();
                                savedLocations.locations[i]["UvData"] = new Object();
                                savedLocations.locations[i]["ForecastData"] = new Object();
                                savedLocations.locations[i]["CameraListData"] = new Object();
                            }
                            locationWorker.postMessage({ type: "locations", arg: "load" });
                        });
                    });
                    jQuery("#settings-wrap").dialog({
                        position: dialogPosition,
                        modal: true, draggable: false, resizable: false, stack: true,
                        width: 400,
                        show: "fade", hide: "fade",
                        title: "Settings",
                        buttons: {
                            Save: function () {
                                worker.postMessage({ type: "settings", arg: "save" });
                                jQuery(this).dialog("close");
                                return (true);
                            },
                            Cancel: function () {
                                changedSettings = JSON.parse(JSON.stringify(savedSettings));
                                worker.postMessage({ type: "settings", arg: "load" });
                                for (var i = 0; i < savedLocations.locations.length; i++) {
                                    worker.postMessage({ type: "stop timers" });
                                    savedLocations.locations[i]["AlertData"] = new Object();
                                    savedLocations.locations[i]["ObsData"] = new Object();
                                    savedLocations.locations[i]["UvData"] = new Object();
                                    savedLocations.locations[i]["ForecastData"] = new Object();
                                    savedLocations.locations[i]["CameraListData"] = new Object();
                                }
                                locationWorker.postMessage({ type: "locations", arg: "load" });
                                jQuery(this).dialog("close");
                                return (true);
                            }
                        },
                        open: function () {
                            if (jQuery("#video").length > 0) {
                                jQuery("#video").hide();
                                if (document.getElementById("video")) {
                                    document.getElementById("video").pause();
                                }
                            }
                        },
                        close: function () {
                            jQuery(this).dialog("destroy");
                            worker.postMessage({ type: "update window pane", data: currentLocation["index"] });

                            placeAdsTimer(true);

                            return (true);
                        }
                    });

                    break;
                case "save":
                    savedSettings = changedSettings;
                    chrome.storage.local.set({ 'savedSettings': savedSettings }, function () {
                        console.log("Saved settings");
                    });
                    break;
            }
            break;
        case "help":
            switch (evt.data.arg) {
                case "display":
                    jQuery("#help-wrap").dialog({
                        position: dialogPosition,
                        modal: true, draggable: false, resizable: false, stack: true,
                        width: 500, height: 500,
                        show: "fade", hide: "fade",
                        title: "Help",
                        close: function () {
                            jQuery(this).dialog("destroy");

                            placeAdsTimer(true);

                            return (true);
                        }
                    });
                    break;
            }
            break;
        case "update icon":
            var canvas = document.createElement('canvas'),
			  ctx,
			  img = document.createElement('img'),
			  link = document.createElement('link'),
			  head = document.getElementsByTagName('head')[0];
            if (canvas.getContext) {
                canvas.height = canvas.width = 16; // set the size
                ctx = canvas.getContext('2d');
                ctx.font = '9px "Small Fonts", sans-serif';
                var iconImg = "images/icon16.png";
                var iconText = "";
                var resizeIconX = 16;
                var resizeIconY = 16;
                chrome.tabs.getCurrent(function (tab) {
                    if ((tab.pinned) && (!tab.selected)) {
                        if (parseInt(savedLocations.locations[currentLocation["index"]]["AlertData"]["alertCount"]) > 0) {
                            iconImg = "images/alert-icon-sm.png";
                            ctx.fillStyle = '#ffffff';
                            ctx.font = 'bold 9px "Small Fonts", sans-serif';
                            iconText = parseInt(savedLocations.locations[currentLocation["index"]]["AlertData"]["alertCount"]).toString();
                            resizeIconY = 14;
                        } else {
                            //iconImg = "http://img.weather.weatherbug.com/forecast/icons/localized/20x17/en/trans/" + savedLocations.locations[currentLocation["index"]]["ObsData"]["icon"] + ".png";
                            //iconImg = "http://esi.weatherbug.com/images/spacer.gif";
                            iconImg = "images/icon16-trans.png"
                            ctx.fillStyle = '#000000';
                            iconText = Math.round(savedLocations.locations[currentLocation["index"]]["ObsData"]["temperature"]) + "°";
                        }
                    } else {
                        if (parseInt(savedLocations.locations[currentLocation["index"]]["AlertData"]["alertCount"]) > 0) {
                            iconImg = "images/icon16-alert.png";
                        }
                    }
                    img.addEventListener("load", function () {
                        ctx.drawImage(this, 0, 0, resizeIconX, resizeIconY);
                        if (iconText.length > 0) {
                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";
                            ctx.fillText(iconText, Math.round(resizeIconX / 2), Math.round(resizeIconY / 2), 16);
                        }
                        link.setAttribute('type', 'image/png');
                        link.setAttribute('rel', 'shortcut icon');
                        link.setAttribute('href', canvas.toDataURL('image/png'));
                        head.appendChild(link);
                        canvas = ctx = img = link = head = iconImg = iconText = null;
                    }, false);
                    img.src = iconImg;
                });
            }
            break;
        case "update window pane":
            var location = savedLocations.locations[parseInt(evt.data.data)];
            if (location["CameraListData"]["cameraList"] && location["CameraListData"]["cameraList"][0]) {
                var thisCamera = location["CameraListData"]["cameraList"][0];
            } else {
                return (false);
            }
            if ((changedSettings.settings["showCameraInWindow"] === true) && (thisCamera["distance"] <= cameraRadius)) {
                worker.postMessage({ type: "cameras", arg: "load camera in window", data: location["index"] });
                jQuery("#camera-icon").unbind("click").bind("click", function () {
                    worker.postMessage({ type: "cameras", arg: "display large cameras", data: location["index"] })
                });
            } else {
                worker.postMessage({ type: "obs", arg: "load obs video", data: location["index"] });
                jQuery("#camera-icon").unbind("click").bind("click", function () {
                    worker.postMessage({ type: "cameras", arg: "update camera", data: location["index"], camera: 0 });
                    worker.postMessage({ type: "cameras", arg: "display cameras", data: location["index"] })
                });
            }
            break;
        case "obs":
            var location = savedLocations.locations[parseInt(evt.data.data)];
            if (!okayToUpdate) {
                setTimeout(function () {
                    worker.postMessage({ type: evt.data.type, arg: evt.data.arg, data: location["index"] });
                }, 250)
                return (true);
            }
            switch (evt.data.arg) {
                case "get obs":
                    //console.log(new Date().formatDate("hh:mm:ss") + " " + evt.data.type + " " + evt.data.arg + " " + location["displayName"])
                    if (location === undefined) return (true);
                    var url = urlString(location);
                    url = url.replace("GetData.ashx", "GetDataV2.ashx");
                    url += "&dt=o&ic=1";
                    worker.postMessage({ type: "obs", arg: "start obs timer", data: location["index"] });
                    var ajaxConnection = jQuery.get(url, function (data, textStatus) {
                        if (textStatus != "success") {
                            setTimeout(function () {
                                worker.postMessage({ type: "obs", arg: "get obs", data: location["index"] });
                            }, ajaxTimeout);
                            return (false);
                        }
                        location["ObsData"] = JSON.parse(data)["weather"]["ObsData"];
                        location["ObsData"]["updated"] = new Date().getTime();
                        locationWorker.postMessage({ type: "location", arg: "update", data: location, callback: 'worker.postMessage({ type: "obs", arg: "load obs ui", data: location["index"] });' });
                        url = ajaxConnection = null;
                    }, "text");
                    break;
                case "get uv":
                    var url = urlString(location);
                    url += "&dt=uv";
                    worker.postMessage({ type: "obs", arg: "start uv timer", data: location["index"] });
                    if (location === undefined) return (true);
                    var ajaxConnection = jQuery.get(url, function (data, textStatus) {
                        if (textStatus != "success") {
                            setTimeout(function () {
                                worker.postMessage({ type: "obs", arg: "get uv", data: location["index"] });
                            }, ajaxTimeout);
                            return (false);
                        }
                        location["UvData"] = JSON.parse(data)["weather"]["UvData"];
                        location["UvData"]["updated"] = new Date().getTime();
                        locationWorker.postMessage({ type: "location", arg: "update", data: location, callback: 'worker.postMessage({ type: "obs", arg: "load uv ui", data: location["index"] });' });
                        url = ajaxConnection = null;
                    }, "text");
                    break;
                case "load obs ui":
                    if (location === undefined) return (true);
                    var observations = location["ObsData"];
                    if (observations["hasData"] === undefined) {
                        worker.postMessage({ type: "obs", arg: "get obs", data: location["index"] });
                        return (true);
                    }
                    if (compareLocations(currentLocation, location)) {
                        jQuery("#obs-dashboard-hdr .as-reported-at > .value").html(location["ObsData"]["stationName"]);
                        jQuery("#obs-dashboard .displayName > .value").html(location["displayName"]);
                        jQuery("#obs-dashboard #location-name").html(location["displayName"]);
                        jQuery("#obs-dashboard #location-name").attr("title", location["displayName"]);
                        jQuery("#obs-dashboard, #obs-icon").show("fade", "fast").unbind("click").bind("click", function () {
                            worker.postMessage({ type: "obs", arg: "display obs", data: currentLocation["index"] });
                        }).css("cursor", "pointer");

                        var alertCount = parseInt(location["AlertData"]["alertCount"]);
                        if (alertCount > 0) {
                            if (alertCount == 1) var alertTitle = "Active Alert";
                            else var alertTitle = "Active Alerts";
                            var documentTitle = location["displayName"] + ": " + alertCount + " " + alertTitle;
                        } else {
                            var documentTitle = location["displayName"] + ": " + Math.round(observations["temperature"]) + "°" + " - " + observations["desc"]
                        }
                        jQuery(document).attr("title", documentTitle);
                        //worker.postMessage({ type: "update icon" });
                        worker.postMessage({ type: "update window pane", data: currentLocation["index"] });
                        // if (jQuery("#obs-wrap").is(":visible")) {
                        //     obsDialog.dialog("option", "title", obsTitle(location));
                        // }
                    }
                    for (var obs in observations) {
                        var value = observations[obs];
                        if ((value === null) || (value === undefined)) {
                            if (obs == "feelsLike") value = observations["feelsLike"] = observations["temperature"];
                            else if (obs == "icon") value = "";
                            else if (obs == "desc") value = "Current conditions are not available.";
                            else value = "n/a";
                        } else {
                            if (obs == "icon") {
                                value = "<img src='images/weather_icons/" + observations["icon"] + ".png' alt='" + observations["desc"] + "'>";
                            } else if (obs == "feelsLikeLabel") {
                                value = "<span class='label'>Feels like:&nbsp;</td>";
                            } else if (obs == "temperature") {
                                value = Math.round(observations[obs]);
                            } else if (obs == "temperatureHigh") {
                                value = "<span class='hi-lo label new-label'>Hi:&nbsp;</span>" + observations[obs];
                            } else if (obs == "temperatureLow") {
                                value = "<span class='hi-lo new-label'>Lo:&nbsp;</span>" + observations[obs];
                            } else if (obs == "windDirection") {
                                value = "<span class='label new-label'>Wind:&nbsp;</span>" + observations[obs];
                            } else if (obs == "humidity") {
                                value = "<span class='label new-label'>Humidity:&nbsp;</span>" + observations[obs];
                            } else if (obs == "windDeg") {
                                for (var i = 0; i <= 360; i++) jQuery(".wind").removeClass("dir" + i)
                                jQuery(".wind").addClass("dir" + value);
                            } else if (obs.search(/DateTime/i) > 0) {
                                value = new Date(value).formatUTCDate("hh:mmT");
                            } else if (obs == "dewpoint") {
                                value = "<span class='label new-label'>Dew Point:&nbsp;</span>" + observations[obs];
                            } else if (obs == "temperatureUnits") {
                                value = "°";
                            }
                        }
                        jQuery(".location" + location["index"] + " .obs." + obs + " > .value").html(value);
                        jQuery(".location" + location["index"] + " .displayName > .value").html(location["displayName"]);
                        jQuery("#map-zoom-current").attr("title", "Zoom to " + location["displayName"])
                        jQuery("#map-zoom-current").find(".ui-button-text").html("Zoom to " + location["displayName"]);
                        if (compareLocations(currentLocation, location)) {
                            jQuery("#obs-wrap .obs." + obs + " > .value").html(value);
                            jQuery("#obs-dashboard .obs." + obs + " > .value").html(value);
                        }
                        obs = value = null;
                    }
                    observations = null;
                    break;
                case "display obs":

                    if (openPanel != "obs") {

                        // Pause the video
                        if (document.getElementById("video")) {
                            document.getElementById("video").pause();
                        }

                        // Make sure all other panels are closed
                        closeAllPanels();

                        // Show the Obs Panel
                        omniture("OBS", "DETAILED OBS");
                        jQuery("#obs-panel").fadeIn(100);
                        openPanel = "obs";
                    }

                    // Refresh the ad
                    placeAdsTimer(true);

                    break;
                case "load obs video":
                    var observations = location["ObsData"];
                    var video = "videos/day_clear.webm";
                    var poster = "images/videos/day_clear.jpg";
                    if ((observations["icon"] === null) || (observations["icon"] === undefined)) {
                        cond = 0;
                    } else {
                        var cond = parseInt(observations["icon"].replace(/cond(0*)/, ""));
                    }
                    if (isNaN(cond)) cond = 0;
                    for (var condVideo in condVideos) {
                        for (var i = 0; i < condVideos[condVideo]["conditions"].length; i++) {
                            if (condVideos[condVideo]["conditions"][i] == cond) {
                                poster = "images/videos/" + condVideos[condVideo]["poster"];
                                local = condVideos[condVideo]["localVideo"];
                                if (local) {
                                    video = "videos/" + condVideos[condVideo]["video"];
                                } else {
                                    video = "http://chrome-app.s3.amazonaws.com/window-videos/" + condVideos[condVideo]["video"];
                                }
                                i = condVideos[condVideo]["conditions"].length;
                            }
                        }
                    };
                    jQuery("#window-pane").css("background-image", "url(" + poster + ")");
                    jQuery("#window-camera").hide("fade", "fast");
                    if (jQuery("#video").length > 0) {
                        if (jQuery("#video").attr("src") == video) {
                            if (jQuery(".ui-widget-overlay").length == 0) {
                                jQuery("#video").show("fade", "fast");
                                if (document.getElementById("video")) {
                                    document.getElementById("video").play();
                                }
                            }
                            return (true);
                        }
                    }
                    var tmp = jQuery("#video").hide().remove();
                    tmp = null;
                    if (jQuery(".ui-widget-overlay").length > 0) {
                        jQuery("#window-pane").append('<video poster="' + poster + '" style="display:none;" src="' + video + '" id="video" width="582" height="380"loop></video>');
                    } else {
                        jQuery("#window-pane").append('<video poster="' + poster + '" src="' + video + '" id="video" width="582" height="380" autoplay loop></video>');
                        jQuery("#video").show("fade", "fast");
                    }
                    observations = video = cond = null;
                    break;
                case "load uv ui":
                    var ultraviolet = location["UvData"];
                    if ((ultraviolet["dayList"] === null) || (ultraviolet["dayList"] === undefined)) {
                        jQuery(".ultraviolet").hide();
                        return (true);
                    } else {
                        if (location["isUs"]) jQuery(".ultraviolet").show();
                        else jQuery(".ultraviolet").hide();
                    }
                    for (var i = 0; i < ultraviolet["dayList"].length - 1; i++) {
                        for (var uv in ultraviolet["dayList"][i]) {
                            var value = ultraviolet["dayList"][i][uv];
                            if ((value === null) || (value == "null")) value = "n/a";
                            if (uv.search(/desc/) >= 0) {
                                value = "UV: " + ultraviolet["dayList"][i][uv];
                            }
                            jQuery(".ultraviolet ." + uv + ".day" + i + " > .value").html(value);
                            uv = value = null;
                        }
                    }
                    ultraviolet = null;
                    break;
                case "start obs timer":
                    if (location === undefined) return (true);
                    var thisSavedLocation = savedLocations.locations[location["index"]];
                    if (thisSavedLocation["ObsData"]["timer"]) clearTimeout(thisSavedLocation["ObsData"]["timer"]);
                    thisSavedLocation["ObsData"]["timer"] = setTimeout(function () {
                        worker.postMessage({ type: "obs", arg: "get obs", data: location["index"] });
                    }, obsCheckerInterval);
                    thisSavedLocation = null;
                    break;
                case "stop obs timer":
                    if (location === undefined) return (true);
                    var thisSavedLocation = savedLocations.locations[location["index"]];
                    if (thisSavedLocation["ObsData"]["timer"]) clearTimeout(thisSavedLocation["ObsData"]["timer"]);
                    thisSavedLocation = null;
                case "start uv timer":
                    if (location === undefined) return (true);
                    var thisSavedLocation = savedLocations.locations[location["index"]];
                    if (thisSavedLocation["UvData"]["timer"]) clearTimeout(thisSavedLocation["UvData"]["timer"]);
                    thisSavedLocation["UvData"]["timer"] = setTimeout(function () {
                        //worker.postMessage({ type: "obs", arg: "get uv", data: location["index"] });
                    }, uvCheckerInterval);
                    thisSavedLocation = null;
                    break;
                case "stop uv timer":
                    if (location === undefined) return (true);
                    var thisSavedLocation = savedLocations.locations[location["index"]];
                    if (thisSavedLocation["UvData"]["timer"]) clearTimeout(thisSavedLocation["UvData"]["timer"]);
                    thisSavedLocation = null;
            }
            break;
        case "pollen":
            var location = savedLocations.locations[parseInt(evt.data.data)];
            //console.log("FORECAST: " + evt.data.type + " " + evt.data.arg + ": " + evt.data.data);
            if (!okayToUpdate) {
                setTimeout(function () {
                    worker.postMessage({ type: evt.data.type, arg: evt.data.arg, data: location["index"] });
                }, 250)
                return (true);
            }
            switch (evt.data.arg) {
                case "start pollen timer":
                    if (location === undefined) return (true);
                    var thisSavedLocation = savedLocations.locations[location["index"]];
                    if (thisSavedLocation["PollenData"]["timer"]) clearTimeout(thisSavedLocation["PollenData"]["timer"]);
                    thisSavedLocation["PollenData"]["timer"] = setTimeout(function () {
                        worker.postMessage({ type: "pollen", arg: "get pollen", data: location["index"] });
                    }, pollenCheckerInterval);
                    break;
                case "stop pollen timer":
                    if (location === undefined) return (true);
                    var thisSavedLocation = savedLocations.locations[location["index"]];
                    if (location["PollenData"]["timer"]) clearTimeout(location["PollenData"]["timer"]);
                    break;
                case "get pollen":
                    var url = urlString(location);
                    url += "&dt=p";
                    worker.postMessage({ type: "pollen", arg: "start pollen timer", data: location["index"] });
                    if (location === undefined) return (true);
                    var ajaxConnection = jQuery.get(url, function (data, textStatus) {
                        if (textStatus != "success") {
                            setTimeout(function () {
                                worker.postMessage({ type: "pollen", arg: "get pollen", data: location["index"] });
                            }, ajaxTimeout);
                            return (false);
                        }
                        location["PollenData"] = JSON.parse(data)["weather"]["PollenData"];
                        location["PollenData"]["updated"] = new Date().getTime();
                        url = ajaxConnection = null;
                    }, "text");
                    break;
            }
            break;
        case "forecast":
            var location = savedLocations.locations[parseInt(evt.data.data)];
            //console.log("FORECAST: " + evt.data.type + " " + evt.data.arg + ": " + evt.data.data);
            if (!okayToUpdate) {
                setTimeout(function () {
                    worker.postMessage({ type: evt.data.type, arg: evt.data.arg, data: location["index"] });
                }, 250)
                return (true);
            }
            switch (evt.data.arg) {
                case "get forecast":
                    var url = urlString(location);
                    url += forecastURL;
                    //console.log(new Date().formatDate("hh:mm:ss") + " " + url);
                    worker.postMessage({ type: "forecast", arg: "start forecast timer", data: location["index"] });
                    if (location === undefined) return (true);
                    var ajaxConnection = jQuery.get(url, function (data, textStatus) {
                        if (textStatus != "success") {
                            setTimeout(function () {
                                worker.postMessage({ type: "forecast", arg: "get forecast", data: location["index"] });
                            }, ajaxTimeout);
                            return (false);
                        }
                        location["ForecastData"] = JSON.parse(data)["weather"]["ForecastData"];
                        location["ForecastData"]["updated"] = new Date().getTime();
                        locationWorker.postMessage({ type: "location", arg: "update", data: location, callback: 'if (compareLocations(currentLocation, location)) worker.postMessage({ type: "forecast", arg: "load forecast ui", data: location["index"] });' });
                        url = ajaxConnection = null;
                    }, "text");
                    break;
                case "load forecast ui":
                    if (compareLocations(currentLocation, location) == false) return (true);
                    var forecast = location["ForecastData"];
                    if ((forecast["forecastList"] === undefined) || (forecast["forecastList"] === null) || (forecast["forecastList"].length == 0)) {
                        if (compareLocations(currentLocation, location)) {
                            jQuery("#forecast-icon").hide("fade", "fast");
                            setTimeout(function () {
                                worker.postMessage({ type: "forecast", arg: "load forecast ui", data: location["index"] })
                            }, 250);
                        }
                        return (true);
                    }
                    jQuery("#forecast-icon").show("fade", "fast");
                    jQuery("#fcast-3day, #forecast-icon").unbind("click");
                    jQuery("#fcast-3day, #forecast-icon").bind("click", function () {
                        worker.postMessage({ type: "forecast", arg: "display forecast", data: location["index"] });
                    });
                    jQuery(".forecast .temperatureUnits").html("°");
                    //jQuery("#fcast-7day .temperatureUnits").html("&deg;");
                    jQuery(".windUnits > .value").html(windUnits(location));
                    // if (jQuery("#forecast-wrap").is(":visible")) {
                    //     if (forecastDialog.dialog("title") != forecastTitle(location)) {
                    //         forecastDialog.dialog("option", "title", forecastTitle(location));
                    //         jQuery("#forecast-wrap .tabs").tabs("select", jQuery("#forecast-wrap .tabs").tabs('option', 'selected'));
                    //     }
                    // }
                    jQuery("#fcast-hourly-select option").remove();
                    jQuery("#fcast-hourly").html("");
                    if (location["isUs"] == false) {
                        if (jQuery("#forecasts .tabs").tabs('option', 'selected') == 2) {
                            jQuery("#forecasts .tabs").tabs('select', 1)
                        }
                        jQuery("#fcast-hourly-tab, #fcast-hourly").hide();
                    } else {
                        jQuery("#fcast-hourly-tab, #fcast-hourly").show();
                    }
                    for (var i = 0; i < forecast["forecastList"].length; i++) {
                        var today = new Date(forecast["forecastList"][i]["dateTime"])
                        if (i == 0) {
                            jQuery("#fcast-7day .forecast-day-content > div").removeClass("horizontal").addClass("vertical");
                            jQuery("#fcast-7day tr").removeClass("now");
                            if (forecast["forecastList"][i]["hasDay"]) {
                                jQuery("#fcast-7day .days").addClass("now");
                                jQuery("#fcast-7day .nights .forecast-day-content > div").addClass("horizontal")
                            } else {
                                jQuery("#fcast-7day .nights").addClass("now");
                                jQuery("#fcast-7day .days .forecast-day-content > div").addClass("horizontal");
                            }
                        }
                        for (var fcast in forecast["forecastList"][i]) {
                            var value = forecast["forecastList"][i][fcast];
                            if (fcast == "hourly" && value !== null && i < 3) {
                                var hourlyForecast = forecast["forecastList"][i][fcast];
                                var thisDay = i;
                                var forecastDay = weekdays[today.getUTCDay()];
                                var dateString = today.formatUTCDate("MM/dd/yyyy");
                                jQuery("#fcast-hourly-select").append("<option value='" + thisDay + "'>" + forecastDay + ", " + dateString + "</option>");
                                var contentString = "";
                                contentString += "<table class='day" + thisDay + " forecast'>";
                                for (var j = 0; j < hourlyForecast.length; j++) {
                                    var thisHourlyForecast = hourlyForecast[j];
                                    var forecastTime = new Date(thisHourlyForecast["dateTime"]);
                                    var thisHour = parseInt(forecastTime.formatUTCDate("hh"));
                                    var dateString = forecastTime.formatUTCDate("MM/dd/yyyy");
                                    var timeString = forecastTime.formatUTCDate("hhT");
                                    var icon = "<img src='images/weather_icons/" + thisHourlyForecast.icon + ".png' alt='" + +thisHourlyForecast.desc + "' />";
                                    contentString += "<tr>";
                                    contentString += "<th scope='row' class='dateTime'>" + timeString + "</th>"; // time
                                    contentString += "<td class='conditions'>";
                                    contentString += "<div class='flexbox horizontal center'>";
                                    contentString += "<span class='icon'>" + icon + "</span>";
                                    contentString += "<div class='flexbox vertical start pack-start'>";
                                    contentString += "<span class='temperature flexbox-box'>" + thisHourlyForecast["temperature"] + "°</span>";
                                    contentString += "<span class='desc flexbox-box'><p>" + thisHourlyForecast["desc"] + "</p></span>";
                                    contentString += "</div>"
                                    contentString += "</div>"
                                    contentString += "</td>";
                                    contentString += "<td class='chancePrecip'>" + thisHourlyForecast["chancePrecip"] + "%</td>";
                                    contentString += "<td class='feelsLike'>" + thisHourlyForecast["feelsLike"] + "°</td>";
                                    contentString += "<td class='humidity'>" + thisHourlyForecast["humidity"] + "%</td>";
                                    contentString += "<td class='dewPoint'>" + thisHourlyForecast["dewPoint"] + "°</td>";
                                    contentString += "<td class='windSpeed'>" + thisHourlyForecast["windDir"] + " " + thisHourlyForecast["windSpeed"] + " " + windUnits(location) + "</td>";
                                    contentString += "<td class='skyCover'>" + thisHourlyForecast["skyCover"] + "%</td>";
                                    contentString += "</tr>";
                                }
                                contentString += "</table>";
                                jQuery("#fcast-hourly").append(contentString);
                                jQuery(".fcast-detailed.day" + i).unbind("click").bind("click", function () {
                                    var thisDay = new RegExp(/day(\d{1})/).exec(jQuery(this).attr("class"))[1];
                                    jQuery("#fcast-hourly-select option[value=" + thisDay + "]").attr("selected", true);
                                    jQuery("#fcast-hourly .forecast").hide();
                                    jQuery("#fcast-hourly .forecast.day" + thisDay).show();
                                    jQuery("#forecasts .tabs").tabs("select", 2);

                                    // Refresh the ad
                                    placeAdsTimer(true);

                                }).css("cursor", "pointer");
                            } else if (fcast.search(/icon/i) >= 0) {
                                var thisIcon = "<img src='images/weather_icons/" + value + ".png' alt=''>"
                                if ((value === null) || (value === undefined)) {
                                    if (forecast["forecastList"][i]["hasDay"]) {
                                        thisIcon = "<img src='images/weather_icons/" + forecast["forecastList"][i]["dayIcon"] + ".png' alt=''>";
                                    } else if (forecast["forecastList"][i]["hasNight"]) {
                                        thisIcon = "<img src='images/weather_icons/" + forecast["forecastList"][i]["nightIcon"] + ".png' alt=''>";
                                    } else {
                                        thisIcon = "";
                                    }
                                    jQuery("#fcast-3day.forecast ." + fcast + ".day" + i + " > .value").html(thisIcon);
                                } else {
                                    value = thisIcon;
                                    jQuery(".forecast ." + fcast + ".day" + i + " > .value").html(value);
                                }
                            } else if (fcast.search(/desc/i) >= 0) {
                                if ((value === undefined) || (value === null)) {
                                    if (forecast["forecastList"][i]["hasDay"]) {
                                        value = forecast["forecastList"][i]["dayDesc"];
                                    } else if (forecast["forecastList"][i]["hasNight"]) {
                                        value = forecast["forecastList"][i]["nightDesc"];
                                    } else {
                                        value = "";
                                    }
                                    jQuery(".forecast ." + fcast + ".day" + i + " > .value").html(value);
                                } else {
                                    jQuery(".forecast ." + fcast + ".day" + i + " > .value").html(value);
                                }
                            } else if (fcast.search(/high/i) == 0) {
                                if ((value !== undefined) && (value !== null)) {
                                    value = "<span class='hi-lo new-label'>Hi:&nbsp;</span>" + forecast["forecastList"][i][fcast];
                                    jQuery(".forecast ." + fcast + ".day" + i + " > .value").html(value);
                                    jQuery(".forecast ." + fcast + ".day" + i + " > .value").closest(".day").show();
                                } else {
                                    value = "<span class='hi-lo new-label'>Hi:&nbsp;</span>--";
                                    jQuery(".forecast ." + fcast + ".day" + i + " > .value").html(value);
                                    jQuery(".forecast ." + fcast + ".day" + i + " > .value").closest(".day").hide();
                                }
                            } else if (fcast.search(/low/i) == 0) {
                                if ((value !== undefined) && (value !== null)) {
                                    value = "<span class='hi-lo new-label'>Lo:&nbsp;</span>" + forecast["forecastList"][i][fcast];
                                    jQuery(".forecast ." + fcast + ".day" + i + " > .value").html(value);
                                    jQuery(".forecast ." + fcast + ".day" + i + " > .value").closest(".night").show();
                                } else {
                                    jQuery(".forecast ." + fcast + ".day" + i + " > .value").closest(".night").hide();
                                }
                            } else if (fcast.search(/title/i) >= 0) {
                                if (forecast["forecastList"][i]["hasDay"] == false) value = forecast["forecastList"][i]["nightTitle"];
                                for (var j = 0; j < weekdays.length; j++) {
                                    if (forecast["forecastList"][i][fcast] && (forecast["forecastList"][i][fcast].search(weekdays[j]) >= 0)) {
                                        var tmpVal = value.replace(weekdays[j], weekdays[j].substring(0, 3));
                                        j = weekdays.length;
                                    }
                                }
                                jQuery(".forecast ." + fcast + ".day" + i + " > .value").html(value);
                                jQuery("#fcast-7day.forecast ." + fcast + ".day" + i + " > .value").html(tmpVal);
                                tmpVal = null;

                            } else {
                                if (fcast == "dateTime") value = new Date(value).formatUTCDate("MM/dd/yyyy");
                                jQuery(".forecast ." + fcast + ".day" + i + " > .value").html(value);
                            }
                            fcast = value = thisIcon = null;
                            if (jQuery("#forecasts").is(":visible")) {
                                jQuery("#fcast-7day .forecast-day-wrap").css("height", "");
                                jQuery("#fcast-7day .days .forecast-day-wrap").equalizeHeights();
                                jQuery("#fcast-7day .nights .forecast-day-wrap").equalizeHeights();
                            }
                        }
                    }
                    jQuery("#fcast-7day td").unbind("click").bind("click", function () {
                        jQuery("#forecasts .tabs").tabs("select", 1);
                        var thisDay = new RegExp(/day(\d{1})/).exec(jQuery(this).find("header").attr("class"))[1];
                        var scrollMargin = 0;
                        for (var i = 0; i < thisDay; i++) scrollMargin += jQuery("#fcast-detailed .fcast-detailed.day" + i).outerHeight(true);
                        var scrollPanel = jQuery("#fcast-detailed").closest(".forecast-content-wrap").css("height", "");
                        var difference = scrollPanel.outerHeight(true) - scrollPanel.parent().height();
                        sizeForecastSlider("detailed", ((difference - scrollMargin) / difference) * 100);
                        thisDay = scrollMargin = scrollPanel = difference = null;

                        // Refresh the ad
                        placeAdsTimer(true);

                        return (true);
                    }).css("cursor", "pointer");
                    jQuery("#fcast-3day").show("fade", "fast");
                    forecast = lastUpdated = null;
                    break;
                case "display forecast":



                    if (openPanel != "forecast") {

                        // Pause the video
                        if (document.getElementById("video")) {
                            document.getElementById("video").pause();
                        }

                        // Make sure all other panels are closed
                        closeAllPanels();

                        // Show the Forecast Panel
                        jQuery("#forecast-panel").fadeIn(100, function() {

                            jQuery("#forecast-panel .tabs").tabs({
                                selected: 0,
                                open: function (event, ui) {
                                    jQuery("#fcast-detailed-wrap .temperature-wrap").css("width", "");
                                    jQuery("#fcast-detailed-wrap .temperature-wrap").equalizeWidths();
                                },
                                show: function (event, ui) {
                                    if (ui["index"] == 0) {
                                        isForecastSummaryTabShowing = true;
                                        omniture("FORECAST", "SUMMARY FORECAST");
                                        jQuery("#forecasts .tabs").css("width", "100%");
                                        jQuery("#fcast-7day .forecast-day-wrap").css("height", "");
                                        jQuery("#fcast-7day .days .forecast-day-wrap").equalizeHeights();
                                        jQuery("#fcast-7day .nights .forecast-day-wrap").equalizeHeights();
                                    } else if ((ui["index"] == 1) || (ui["index"] == 2)) {
                                        isForecastSummaryTabShowing = false;
                                        var selector;
                                        if (ui["index"] == 1) {
                                            omniture("FORECAST", "DETAILED FORECAST");
                                            selector = "#fcast-detailed-wrap";
                                            if (typeof jQuery(selector + " .forecast-slider").slider("option", "value") == "object") {
                                                jQuery(selector + " .forecast-slider-wrap").each(function () {
                                                    sizeForecastSlider("detailed")
                                                });
                                            }
                                        } else {
                                            omniture("FORECAST", "HOURLY FORECAST");
                                            selector = "#fcast-hourly-wrap";
                                            jQuery("#fcast-hourly-select").selectmenu("destroy");
                                            jQuery("#fcast-hourly-select").selectmenu({
                                                style: "dropdown",
                                                width: 200,
                                                change: function () {
                                                    jQuery("#fcast-hourly-wrap .forecast-content").css("margin-top", 0);
                                                    jQuery("#fcast-hourly-wrap .forecast-slider").slider("value", 100);
                                                    var day = jQuery(this).selectmenu("value");
                                                    jQuery("#fcast-hourly table.forecast").each(function () {
                                                        jQuery(this).hide();
                                                    });
                                                    jQuery("#fcast-hourly table.forecast.day" + day).show(0, function () {
                                                        sizeForecastSlider("hourly")
                                                    });

                                                    // Refresh the ad
                                                    placeAdsTimer(true);
                                                    omniture("FORECAST", "HOURLY FORECAST");
                                                }
                                            });
                                            if (typeof jQuery(selector + " .forecast-slider").slider("option", "value") == "object") {
                                                jQuery(selector + " .forecast-slider-wrap").each(function () {
                                                    sizeForecastSlider("hourly")
                                                });
                                            }
                                        }
                                    }

                                    // Refresh the ad
                                    placeAdsTimer(true);
                                }
                            });
                            jQuery("#fcast-7day .days .forecast-day-wrap").equalizeHeights();
                            jQuery("#fcast-7day .nights .forecast-day-wrap").equalizeHeights();

                            jQuery("#fcast-detailed-wrap .forecast-slider").slider("value", 100);
                            jQuery("#fcast-hourly-wrap .forecast-slider").slider("value", 100);
                        });
                        openPanel = "forecast";
                    }

                    if (isForecastSummaryTabShowing) {
                        // Refresh the ad
                        placeAdsTimer(true);
                        omniture("FORECAST", "SUMMARY FORECAST");
                    }

                    break;
                case "start forecast timer":
                    if (location === undefined) return (true);
                    var thisSavedLocation = savedLocations.locations[location["index"]];
                    if (thisSavedLocation["ForecastData"]["timer"]) clearTimeout(thisSavedLocation["ForecastData"]["timer"]);
                    thisSavedLocation["ForecastData"]["timer"] = setTimeout(function () {
                        worker.postMessage({ type: "forecast", arg: "get forecast", data: location["index"] });
                    }, forecastCheckerInterval);
                    break;
                case "stop forecast timer":
                    if (location === undefined) return (true);
                    var thisSavedLocation = savedLocations.locations[location["index"]];
                    if (location["ForecastData"]["timer"]) clearTimeout(location["ForecastData"]["timer"]);
                    break;
            }
            break;
        case "cameras":
            var location = savedLocations.locations[parseInt(evt.data.data)];
            if (!okayToUpdate) {
                setTimeout(function () {
                    worker.postMessage({ type: evt.data.type, arg: evt.data.arg, data: location["index"] });
                }, 250)
                return (true);
            }
            //console.log(evt.data.type + ": " + evt.data.arg + ": " +  location["index"])
            switch (evt.data.arg) {
                case "get cameras":
                    var url = urlString(location) + cameraURL;
                    worker.postMessage({ type: "cameras", arg: "start timer", data: location["index"] });
                    if (location === undefined) return (true);
                    var ajaxConnection = jQuery.get(url, function (data, textStatus) {
                        if (textStatus != "success") {
                            setTimeout(function () {
                                worker.postMessage({ type: "cameras", arg: "get cameras", data: location["index"] });
                            }, ajaxTimeout);
                            return (false);
                        }
                        location["CameraListData"] = JSON.parse(data)["weather"]["CameraListData"];
                        location["CameraListData"]["updated"] = new Date().getTime();

                        for (var i = 0; i < location["CameraListData"]["cameraList"].length; i++) {
                            if (location["CameraListData"]["cameraList"][i]["id"] == "AWSHQ5") {
                                // AWSHQ5 is a known disabled camera. it's presence in the direct feed is a bug in the backend somewhere.
                                // we do not know when/if this will get fixed. Hate to hardcode, but at the moment, not sure what else to do.
                                location["CameraListData"]["cameraList"].splice(i, 1);
                                i = location["CameraListData"]["cameraList"].length;
                            }
                        }
                        locationWorker.postMessage({ type: "location", arg: "update", data: location, callback: 'if (compareLocations(currentLocation, location)) worker.postMessage({ type: "cameras", arg: "load camera ui", data: location["index"] });' });
                        worker.postMessage({ type: "cameras", arg: "preload camera", data: location["index"], arg: location["CameraListData"]["cameraList"].length - 1 });
                        worker.postMessage({ type: "cameras", arg: "preload camera", data: location["index"], arg: 1 });
                        url = ajaxConnection = null;
                    }, "text");
                    break;
                case "load camera ui":
                    if (compareLocations(currentLocation, location) == false) return (true);
                    var thisCameraList = new Array();
                    for (var camera in location["CameraListData"]["cameraList"]) {
                        if (location["CameraListData"]["cameraList"][camera]["distance"] <= cameraRadius) {
                            thisCameraList.push(camera);
                        }
                    }
                    if ((thisCameraList === null) || (thisCameraList === undefined) || (thisCameraList.length == 0)) {
                        if (compareLocations(currentLocation, location)) {
                            jQuery("#camera-icon").hide("fade", "fast");
                            jQuery("#cameras-panel").fadeOut(100);
                            setTimeout(function () {
                                worker.postMessage({ type: "cameras", arg: "load camera ui", data: location["index"] })
                            }, 250);
                        }
                        return (true);
                    } else {
                        if (compareLocations(currentLocation, location)) {
                            if (thisCameraList.length >= 1) {
                                if (thisCameraList.length == 0) jQuery("#camera-icon").hide("fade", "fast");
                                else jQuery("#camera-icon").show("fade", "fast");
                                jQuery(".camera-button.prev").show();
                                jQuery(".camera-button.next").show();
                            } else {
                                jQuery(".camera-button.prev").hide();
                                jQuery(".camera-button.next").hide();
                            }
                        }
                    }

                    jQuery("#camera-icon").bind("click", function () {
                        worker.postMessage({ type: "cameras", arg: "display cameras", data: location["index"] });
                    });
                    jQuery(".camera-button.prev").unbind("click").bind("click", function () {
                        worker.postMessage({ type: "cameras", arg: "previous camera", data: location["index"] });
                    });
                    jQuery(".camera-button.next").unbind("click").bind("click", function () {
                        worker.postMessage({ type: "cameras", arg: "next camera", data: location["index"] });
                    });
                    worker.postMessage({ type: "cameras", arg: "update camera", data: location["index"], camera: 0 });

                    thisCameraList = null;
                    break
                case "display cameras":
                case "display large cameras":

                    if (openPanel != "cameras") {

                        // Pause the video
                        if (document.getElementById("video")) {
                            document.getElementById("video").pause();
                        }

                        // Make sure all other panels are closed
                        closeAllPanels();

                        // Show the Cameras Panel
                        jQuery("#cameras-panel").fadeIn( function() {
                            worker.postMessage({ type: "cameras", arg: "update camera", data: location["index"], camera: 0 });
                        });
                        omniture("CAMERAS", "DETAILED CAMERAS");
                        jQuery(document).bind("keydown", function (evt) {
                            if (evt.which == jQuery.ui.keyCode.LEFT) {
                                worker.postMessage({ type: "cameras", arg: "previous camera", data: location["index"] })
                            } else if (evt.which == jQuery.ui.keyCode.RIGHT) {
                                worker.postMessage({ type: "cameras", arg: "next camera", data: location["index"] })
                            }
                        });
                        openPanel = "cameras";
                    }

                    // Refresh the ad
                    placeAdsTimer(true);

                    break;
                case "previous camera":
                    var thisCameraList = location["CameraListData"]["cameraList"];
                    var thisCameraId = parseInt(jQuery("#camera img").attr("id").replace(/camera-/, ""));
                    if (thisCameraId <= 0) {
                        var prevCameraId = thisCameraList.length - 1;
                        var preloadCameraId = prevCameraId - 1;
                    } else {
                        var prevCameraId = parseInt(thisCameraId - 1);
                        if (prevCameraId == 0) var preloadCameraId = thisCameraList.length - 1;
                        else var preloadCameraId = prevCameraId - 1;
                    }
                    worker.postMessage({ type: "cameras", arg: "update camera", data: location["index"], camera: prevCameraId });
                    worker.postMessage({ type: "cameras", arg: "preload camera", data: location["index"], camera: preloadCameraId });
                    thisCameraId = thisCameraList = prevCameraId = preloadCameraId = null;
                    
                    placeAdsTimer(true);
                    omniture("CAMERAS", "DETAILED CAMERAS");

                    break;
                case "next camera":
                    var thisCameraList = location["CameraListData"]["cameraList"];
                    var thisCameraId = parseInt(jQuery("#camera img").attr("id").replace(/camera-/, ""));
                    if (thisCameraId == thisCameraList.length - 1) {
                        var nextCameraId = 0;
                        var preloadCameraId = nextCameraId + 1;
                    } else {
                        var nextCameraId = parseInt(thisCameraId + 1);
                        if (nextCameraId == thisCameraList.length - 1) var preloadCameraId = 0;
                        else var preloadCameraId = nextCameraId + 1;
                    }
                    worker.postMessage({ type: "cameras", arg: "update camera", data: location["index"], camera: nextCameraId });
                    worker.postMessage({ type: "cameras", arg: "preload camera", data: location["index"], camera: preloadCameraId });
                    thisCameraId = thisCameraList = nextCameraId = preloadCameraId = null;

                    placeAdsTimer(true);
                    omniture("CAMERAS", "DETAILED CAMERAS");

                case "preload camera":
                    var thisCameraId = parseInt(evt.data.arg);
                    var removedImages = jQuery("#camera-cache *").remove();
                    var contentString = "";
                    for (var i = 0; i < savedLocations.locations.length; i++) {
                        var thisLocationCamera = savedLocations.locations[i]["CameraListData"]["cameraList"][thisCameraId];
                        if ((thisLocationCamera === undefined) || (thisLocationCamera === null)) return (true);
                        //contentString += "<img src='" + thisLocationCamera["thumbnail"] + "' alt='' />";
                        contentString += "<img src='" + thisLocationCamera["img"].replace(/_s/i, "_l") + "' alt='' />"
                    }
                    jQuery("#camera-cache").append(contentString);
                    thisCamera = removedImages = contentString = null;
                    break;
                case "update camera":
                    var thisCameraId = evt.data.camera;
                    var thisCameraList = location["CameraListData"]["cameraList"];
                    var thisCamera = thisCameraList[thisCameraId];
                    if ((thisCamera === undefined) || (thisCamera === null)) return (true);
                    var cameraCount = thisCameraList.length;
                    jQuery(".camera-button").button("option", "disabled", true);
                    jQuery(".camera").hide(0, function () {
                        jQuery("..image-description-bar .image-number").html("Camera " + parseInt(thisCameraId + 1) + " of " + cameraCount);
                        jQuery("..image-description-bar .city").html(thisCamera["city"] + ", " + thisCamera["state"]);
                        jQuery("..image-description-bar .name").html(thisCamera["name"]);

                        jQuery("#camera img").attr("data-src", thisCamera["img"]);
                        var remoteImage = new RAL.RemoteImage({element: $("#camera img")[0]});
                        RAL.Queue.add(remoteImage, {autoStart: true});
                        jQuery("#camera img").attr("id", "camera-" + thisCameraId);
                        jQuery("#camera img").attr("src", "/images/spacer.gif");

                        jQuery(this).show("fade", function () {
                            jQuery(".camera-button").button("option", "disabled", false);
                        });
                    });
                    break;
                case "load camera in window":
                    worker.postMessage({ type: "cameras", arg: "preload camera", data: location["index"], arg: 0 });
                    jQuery("#window-pane").css("background-image", "");
                    var thisCamera = location["CameraListData"]["cameraList"][0];
                    jQuery("#video").hide("fade", "fast", function () { jQuery(this).remove(); });
                    if (jQuery("#window-camera").attr("src") != thisCamera["img"]) {
                        jQuery("#window-camera").hide("fade", "fast", function () {
                            jQuery(this).remove();
                            jQuery("#window-pane").append("<img id='window-camera' data-src='" + thisCamera["img"] + "' width=582 height=380 style='display:none;' />")
                            var remoteImage = new RAL.RemoteImage({element: $("#window-camera")[0]});
                            RAL.Queue.add(remoteImage, {autoStart: true});
                            if (jQuery("#window-camera").css("display") == "none") jQuery("#window-camera").show("fade", "fast");
                            jQuery("#window-camera").unbind("click").bind("click", function () {
                                worker.postMessage({ type: "cameras", arg: "update camera", data: location["index"], camera: 0 });
                                worker.postMessage({ type: "cameras", arg: "display large cameras", data: location["index"] })
                            }).css("cursor", "pointer");
                        });
                    } else {
                        if (jQuery("#window-camera").css("display") == "none") jQuery("#window-camera").show("fade", "fast");
                    }
                    break;
                case "start timer":
                    if (location === undefined) return (true);
                    var thisSavedLocation = savedLocations.locations[location["index"]];
                    if (thisSavedLocation["CameraListData"]["timer"]) clearTimeout(thisSavedLocation["CameraListData"]["timer"]);
                    thisSavedLocation["CameraListData"]["timer"] = setTimeout(function () {
                        worker.postMessage({ type: "cameras", arg: "get cameras", data: location["index"] });
                    }, cameraCheckerInterval);
                    break;
                case "stop timer":
                    if (location === undefined) return (true);
                    var thisSavedLocation = savedLocations.locations[location["index"]];
                    if (thisSavedLocation["CameraListData"]["timer"]) clearTimeout(thisSavedLocation["CameraListData"]["timer"]);
                    break;
            }
            break;
        case "alert":
            var location = savedLocations.locations[parseInt(evt.data.data)];
            //console.log(new Date().formatDate("hh:mm:ss") + " " + evt.data.type + " " + evt.data.arg + " " + location["displayName"])
            if (!okayToUpdate) {
                setTimeout(function () {
                    worker.postMessage({ type: evt.data.type, arg: evt.data.arg, data: location["index"] });
                }, 250)
                return (true);
            }
            //console.log(evt.data.type + ": " + evt.data.arg + ": " + location["index"])
            switch (evt.data.arg) {
                case "get alerts":
                    var url = urlString(location);
                    url += "&dt=a";
                    worker.postMessage({ type: "alert", arg: "start timer", data: location["index"] });
                    if (location === undefined) return (true);
                    var ajaxConnection = jQuery.get(url, function (data, textStatus) {
                        if (textStatus != "success") {
                            setTimeout(function () {
                                worker.postMessage({ type: "alert", arg: "get alerts", data: location["index"] });
                            }, ajaxTimeout);
                            return (false);
                        }
                        location["AlertData"] = JSON.parse(data)["weather"]["AlertData"];
                        location["AlertData"]["updated"] = new Date().getTime();
                        if (location["AlertData"]["alertCount"] > 0) {
                            worker.postMessage({ type: "alert", arg: "load alerts ui", data: location["index"] });
                        } else {
                            jQuery(".location" + location["index"] + " .alert-icon").unbind("click").hide();
                            if (compareLocations(currentLocation, location)) {
                                jQuery("#obs-dashboard .alert-icon").unbind("click").hide();
                                jQuery("#obs-wrap .alert-icon").unbind("click").hide();
                            }
                        }
                        locationWorker.postMessage({ type: "location", arg: "update", data: location, callback: 'worker.postMessage({ type: "alert", arg: "load alerts ui", data: location["index"] });' });
                        url = ajaxConnection = null;
                    }, "text");
                    break;
                case "load alerts notification":

                    var alertData = location["AlertData"];
                    var alertString = "";
                    for (var i = 0; i < alertData["alertList"].length; i++) {
                        var thisAlert = alertData["alertList"][i];
                        var thisAlertId = thisAlert["alertId"];
                        var thisAlertIcon = "../images/icon48-alert.png";
                        var thisAlertTitle = thisAlert["description"] + " for " + location.displayName;
                        var thisAlertText = thisAlert["message"];
                        var thisAlertExpires = thisAlert["dateTimeExpiresUtc"];
                        var thisAlertHasBeenNotified = false;
                        for (var j = 0; j < alertsNotified.length; j++) {
                            if (alertsNotified[j] == thisAlertId) {
                                thisAlertHasBeenNotified = true;
                                j = alertsNotified.length;
                            }
                        }
                        if (!thisAlertHasBeenNotified) {
                            if (changedSettings.settings["showAlertNotifications"] === true) {
                                notificationWindow.notifications.push(notificationWindow.myNotifications.createNotification(thisAlertIcon, thisAlertTitle, thisAlertText));
                                var alertIndex = notificationWindow.notifications.length - 1;
                                notificationWindow.notifications[alertIndex]["id"] = thisAlertId;
                                notificationWindow.notifications[alertIndex]["replaceId"] = thisAlertId;
                                notificationWindow.notifications[alertIndex]["locationId"] = location["index"];
                                notificationWindow.notifications[alertIndex]["expires"] = thisAlertExpires;
                                notificationWindow.notifications[alertIndex]["ondisplay"] = function () {
                                    var now = new Date();
                                    var alertExpires = new Date(this["expires"]);
                                    var expiresIn = alertExpires - now;
                                    function loadTimer() {
                                        var alertId = this["id"];
                                        function timeoutFunc() {
                                            hideNotification(alertId);
                                        }
                                        this.setVal = function (val) { alertId = val; }
                                        this.causeTimeout = function () { setTimeout(timeoutFunc, expiresIn); }
                                    }
                                    var obj = new loadTimer();
                                    obj.setVal(thisAlertId)
                                    obj.causeTimeout();
                                    obj = null;
                                };
                                notificationWindow.notifications[alertIndex]["onclick"] = function () {
                                    currentLocation = location;
                                    forceAlertDialog = true;
                                    jQuery("#locations #location" + this["locationId"]).trigger("click");
                                };
                                notificationWindow.notifications[alertIndex]["onclose"] = function () {
                                    removeNotification(this["id"]);
                                };
                                notificationWindow.notifications[alertIndex].show();
                                alertsNotified.push(thisAlertId);
                            }
                            // if (changedSettings.settings["playAlertSound"] === true) {
                            //     document.getElementById("chirp").play();
                            // }
                        }
                    }
                    break;
                case "load alerts ui":
                    var alertData = location["AlertData"];
                    var alertsList = alertData["alertList"];
                    if (alertData["alertCount"] > 0) {
                        //worker.postMessage({ type: "alert", arg: "load alerts notification", data: location["index"] });
                        jQuery(".location" + location["index"] + " .alert-icon").show();
                        if (compareLocations(currentLocation, location)) {
                            //worker.postMessage({ type: "update icon" });
                            jQuery("#obs-dashboard .alert-icon").show();
                            jQuery("#obs-wrap .alert-icon").show();
                            jQuery("#obs-dashboard .alertCount .value, #obs-wrap .alertCount .value").html(alertData["alertCount"]);
                            jQuery("#obs-dashboard .alert-icon,  #obs-wrap .alert-icon").unbind("click").bind("click", function (evt, ui) {
                                evt.stopPropagation();
                                worker.postMessage({ type: "alert", arg: "display alerts", data: location["index"] });
                            });
                            //if (jQuery("#alerts").is(":hidden")) {
                                jQuery("#alerts").accordion("destroy");
                                jQuery("#alerts .detailed-alert").remove();
                                for (var i = 0; i < alertsList.length; i++) {
                                    var contentString = "";
                                    var alertNumber = parseInt(i + 1);
                                    var thisAlert = alertsList[i];
                                    var thisAlertMessage = thisAlert.message.replace(/(\r\n)+|(\r|\n)+/g, "<br />").replace(/\.{3}/gi, "&hellip; ");
                                    var thisAlertExpires = new Date(thisAlert.dateTimeExpiresUtc);
                                    var contentString = "";
                                    contentString += "<dl class='detailed-alert'>"
                                    contentString += "<dt><a href='#'>Alert " + alertNumber + ": " + thisAlert.description + " - Expires: " + thisAlertExpires.formatDate("MM/dd/yyyy hh:mmT") + "</a></dt>";
                                    contentString += "<dd>"
                                    contentString += "<div class='alert-message'>" + thisAlertMessage + "</div>";
                                    contentString += "</dd>";
                                    contentString += "</dl>"
                                    jQuery("#alerts").append(contentString);
                                }
                                    if (jQuery("#alerts").is(":visible")) {
                                        jQuery("#alerts").accordion({
                                            fillSpace: true,
                                            header: "> dl > dt",
                                            active: 0,
                                        });
                                        jQuery("#alerts-panel .panel-title").text("Alerts for " + location["displayName"]);

                                    }
                            //}
                        }
                        jQuery(".location" + location["index"] + " .alertCount .value").html(alertData["alertCount"]);
                        if (forceAlertDialog) {
                            worker.postMessage({ type: "alert", arg: "display alerts", data: location["index"] });
                            forceAlertDialog = false;
                        }
                    } else {
                        jQuery("#alerts-panel").fadeOut(100);
                        openPanel = "";
                        jQuery("#alerts").accordion("destroy");

                        jQuery(".location" + location["index"] + " .alert-icon").unbind("click").hide();
                        if (compareLocations(currentLocation, location)) {
                            jQuery("#obs-dashboard .alert-icon").unbind("click").hide();
                            jQuery("#obs-wrap .alert-icon").unbind("click").hide();
                        }
                    }
                    break;
                case "display alerts":

                    if (openPanel != "alerts") {

                        // Pause the video
                        if (document.getElementById("video")) {
                            document.getElementById("video").pause();
                        }

                        // Make sure all other panels are closed
                        closeAllPanels();

                        // Show the Obs Panel
                        jQuery("#alerts-panel .panel-title").text("Alerts for " + location["displayName"]);
                        jQuery("#alerts-panel").fadeIn(100, function() {
                            
                            jQuery("#alerts").accordion({
                                fillSpace: true,
                                header: "> dl > dt",
                                active: 0
                            });
                        });
                        openPanel = "alerts";
                    }

                    // Refresh the ad
                    placeAdsTimer(true);

                    break;
                case "start timer":
                    if (location === undefined) return (true);
                    if (location["AlertData"]["timer"]) clearTimeout(location["AlertData"]["timer"]);
                    location["AlertData"]["timer"] = setTimeout(function () {
                        worker.postMessage({ type: "alert", arg: "get alerts", data: location["index"] });
                    }, alertCheckerInterval);
                    break;
                case "stop timer":
                    if (location === undefined) return (true);
                    if (location["AlertData"]["timer"]) clearTimeout(location["AlertData"]["timer"]);
                    break;
            }
            break;
    }
    return (true);
}

worker.onerror = function(evt) {
	console.log(evt.data);
	return (true);
};

function urlString(LOCATION) {
	if (LOCATION === undefined) return (true);
	var url = "http://direct.weatherbug.com/DataService/GetData.ashx?la=" + LOCATION["lat"] + "&lo=" + LOCATION["lon"];
	if (LOCATION["isUs"]) {
		//if (LOCATION["zipCode"]) url += "&zip=" + LOCATION["zipCode"];
		url = url + "&units=" + changedSettings.settings["units"];
	} else {
		if (LOCATION["cityCode"]) url += "&city=" + LOCATION["cityCode"];
		url = url + "&units=" + changedSettings.settings["intlUnits"];
	}
	if ((LOCATION["StationData"] != undefined) && (LOCATION["StationData"] !== null)) {
		if (LOCATION["StationData"]["id"]) {
			url += "&sid=" + LOCATION["StationData"]["id"];
		}
	}
	return(url);
}

Date.prototype.formatDate = function (format, padMonth) {
	var date = this;
	if (!format) format = "MM/dd/yyyy";
	var month = date.getMonth() + 1;
	var year = date.getFullYear();
	if (padMonth !== null && padMonth !== undefined) {
		if (padMonth) month = month.toString().padL(2, "0");
	}
	format = format.replace("MMM", months[month - 1]);
	format = format.replace("MM", month.toString());
	if (format.indexOf("yyyy") > -1) format = format.replace("yyyy", year.toString());
	else if (format.indexOf("yy") > -1) format = format.replace("yy", year.toString().substr(2, 2));
	format = format.replace("dd", date.getDate().toString());

	var hours = date.getHours();
	if (format.indexOf("T") > -1) {
		if (hours > 11)
			format = format.replace("T", "PM")
		else
			format = format.replace("T", "AM")
	}
	if (format.indexOf("HH") > -1)
		format = format.replace("HH", hours.toString().padL(2, "0"));
	if (format.indexOf("hh") > -1) {
		if (hours > 12) hours = hours - 12;
		if (hours == 0) hours = 12;
		format = format.replace("hh", hours.toString());
	}
	if (format.indexOf("mm") > -1)
		format = format.replace("mm", date.getMinutes().toString().padL(2, "0"));
	if (format.indexOf("ss") > -1)
		format = format.replace("ss", date.getSeconds().toString().padL(2, "0"));

	return format;
}

Date.prototype.formatUTCDate = function (format, padMonth) {
	var UTCDateRegEx = /(\w{3}), (\d{2}) (\w{3}) (\d{4}) (\d{2}):(\d{2}):(\d{2}) (\w{3})/i;
	var debugStr = "";
	debugStr += this.toUTCString() + "\r\n";
	if (this.toUTCString().match(UTCDateRegEx)) {
		var thisDateInfo = UTCDateRegEx.exec(this.toUTCString());
		var thisDate = parseInt(parseFloat(thisDateInfo[2])) + 1;  // China Ticket: suggests removing '+ 1'
		var thisMonth = thisDateInfo[3];
		for (var i = 0; i < months.length; i++) {
			if (months[i].search(thisMonth) >= 0) thisMonth = i;
		}
		var thisYear = thisDateInfo[4];
		var thisHours = thisDateInfo[5];
		var thisMinutes = thisDateInfo[6];
		var thisSeconds = thisDateInfo[7];
		var tmpDate = Date.UTC(thisYear, thisMonth, thisDate)
		var newDate = new Date(tmpDate);
		newDate.setHours(thisHours)
		newDate.setMinutes(thisMinutes);
		newDate.setSeconds(thisSeconds);
		if (padMonth !== null && padMonth !== undefined) {
			return (new Date(newDate).formatDate(format, true));
		} else {
			return (new Date(newDate).formatDate(format));
		}

	}
}

String.repeat = function(chr, count) {
	var str = "";
	for (var x = 0; x < count; x++) { str += chr };
	return str;
}
String.prototype.padL = function(width, pad) {
	if (!width || width < 1)
		return this;

	if (!pad) pad = " ";
	var length = width - this.length
	if (length < 1) return this.substr(0, width);

	return (String.repeat(pad, length) + this).substr(0, width);
}
String.prototype.padR = function(width, pad) {
	if (!width || width < 1)
		return this;

	if (!pad) pad = " ";
	var length = width - this.length
	if (length < 1) this.substr(0, width);

	return (this + String.repeat(pad, length)).substr(0, width);
}

var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

jQuery.fn.equalizeHeights = function() {
	wasHidden = false;
	var currentTallest = 0;
	try {
		jQuery(this).each(function() {
			if (jQuery(this).hasClass("clearfloats")) return (true);
			wasHidden = false;
			if (jQuery(this).css("display").toLowerCase() == "none") {
				jQuery(this).css("position", "absolute");
				jQuery(this).css("visibility", "hidden");
				jQuery(this).css("display", "block");
				wasHidden = true;
			}
			if (jQuery(this).outerHeight() > currentTallest) currentTallest = jQuery(this).outerHeight();
			if (wasHidden) {
				jQuery(this).css("position", "");
				jQuery(this).css("visibility", "");
				jQuery(this).css("display", "");
			}
			if (wasHidden) {
				jQuery(this).css("visibility", "");
				jQuery(this).css("display", "");
			}
		});
		jQuery(this).each(function() {
			var paddingTop = parseInt(jQuery(this).css("padding-top").replace("px", ""));
			var paddingBottom = parseInt(jQuery(this).css("padding-bottom").replace("px", ""));
			var padding = paddingTop + paddingBottom;
			if (jQuery(this).hasClass("set-height")) jQuery(this).css({ 'height': currentTallest - padding + "px" });
			jQuery(this).css({ 'height': currentTallest - padding + "px" });
			paddingTop = paddingBottom = padding = null;
		});
	} catch (e) { }
	wasHidden = currentTallest = null;
	return (this);
};

jQuery.fn.equalizeWidths = function() {
	wasHidden = false;
	var currentWidest = 0;
	jQuery(this).each(function() {
		if (jQuery(this).hasClass("dont-equalize")) return (true);
		wasHidden = false;
		if (jQuery(this).css("display").toLowerCase() == "none") {
			jQuery(this).css("position", "absolute");
			jQuery(this).css("visibility", "hidden");
			jQuery(this).css("display", "block");
			wasHidden = true;
		}
		if (jQuery(this).width() > currentWidest) currentWidest = jQuery(this).width();
		if (wasHidden) {
			jQuery(this).css("position", "");
			jQuery(this).css("visibility", "");
			jQuery(this).css("display", "");
		}
	});
	jQuery(this).each(function() {
		jQuery(this).css({ 'width': currentWidest + "px" });
	});
	return (this);
};

var _gaq = _gaq || [];

function omniture(CHANNEL, PAGE) {
     //debugger;
	//console.log(CHANNEL + ": " + PAGE)
	if (CHANNEL == "ALERTS") {
		wxOAS_sitepage = 'www.wbextension.com/chrome/alerts';
	} else if (PAGE == "SUMMARY FORECAST") {
		wxOAS_sitepage = 'www.wbextension.com/chrome/forecast/summary';
	} else if (PAGE == "DETAILED FORECAST") {
		wxOAS_sitepage = 'www.wbextension.com/chrome/forecast/detailed';
	} else if (PAGE == "HOURLY FORECAST") {
		wxOAS_sitepage = 'www.wbextension.com/chrome/forecast/hourly';
	} else if (CHANNEL == "CAMERAS") {
		wxOAS_sitepage = 'www.wbextension.com/chrome/cameras';
    } else if (CHANNEL == "RADAR") {
		wxOAS_sitepage = 'www.wbextension.com/chrome/radar';
	} else if (CHANNEL == "RADAR ENLARGE") {
		wxOAS_sitepage = 'www.wbextension.com/chrome/radar';
	} else if (CHANNEL == "OBS") {
        wxOAS_sitepage = 'www.wbextension.com/chrome/obs';
    } else if (CHANNEL == "HOME") {
        wxOAS_sitepage = 'www.wbextension.com/chrome';
    }

    /* Commented for GA Migration

    s.channel = CHANNEL;
    s.pageName = PAGE;
    s.prop3 = oGetLocData("state");
    s.prop4 = oGetLocData("city");
    s.prop5 = oGetLocData("zipCode");
    s.prop6 = oGetLocData("dma");
    //s.prop17 = oZCode;
    var s_code = s.t();
    if (s_code) jQuery("#omniture").append(s_code);
    */


    /* GA Implementation*/

    var _account = "UA-20687678-35";
    var _state = oGetLocData("state");
    var _city = oGetLocData("city");
    var _zipcode = oGetLocData("zipCode");
    var _dma = (oGetLocData("dma") ? oGetLocData("dma") : "000");

    _gaq.push(['_setAccount', _account]);
    _gaq.push(['_setDomainName', 'wbwxwindow']);
    _gaq.push(['_setCustomVar', 1, 'channel', CHANNEL, 2], ['_setCustomVar', 2, 'state', _state, 2], ['_setCustomVar', 3, 'city', _city, 2]);
    _gaq.push(['_setCustomVar', 4, 'Zipcode', _zipcode, 2]);
    _gaq.push(['_setCustomVar', 5, 'CountryName', _dma, 2]);

    _gaq.push(['_trackPageview', PAGE]);

}
