var map;
var initMessage;
var markers = [];
var mapBounds;

var currentLocation;

var lastUpdatedDate;

var animationTimer;
var animationTilesChecker;
var animationTiles = [];
var animationCount = 1;
var animationSlot = 0;

// These values are copied from common.js. they should be the same values.
var settingsMapOpacity = 0.75;
var settingsMapType = "";
var settingsMapScrollWheel = true;
var settingsMapZoom = 6;
var settingsIntlMapLayer = 47;
var settingsMapLayer = 52;

var milisecs = 1;
var secs = 1000 * milisecs;
var mins = 60 * secs;
var hrs = 60 * mins;
var days = 24 * hrs;
var wks = 7 * days;
var animationTilesCheckerInterval = 5 * mins;

$(document).ready(function() {

  jQuery('#map-animate button#anim-play')
  .button({
    text: false,
    label: "Animate Map",
    icons: {
      primary: 'ui-icon-play'
    }
  })
  .bind("click", function() {
    if (animationTimer) {
      stopAnimation();
    } else {
      startAnimation(animationSlot);
    }
  }).show();

  jQuery('#map-animate button#anim-begin')
  .button({
    text: false,
    label: "Go to the first animation slot",
    icons: {
      primary: 'ui-icon-seek-start'
    }
  })
  .click(function() {
    if (animationTimer) {
      stopAnimation();
    } else {
      showAnimationTiles(animationTiles.length - 1);
    }
  });

  jQuery('#map-animate button#anim-prev')
  .button({
    text: false,
    label: "Go to the previous animation slot",
    icons: {
      primary: 'ui-icon-seek-prev'
    }
  })
  .click(function() {
    if (animationTimer) {
      stopAnimation();
    } else {
      showAnimationTiles(++animationSlot);
    }
  });

  jQuery('#map-animate button#anim-next')
  .button({
    text: false,
    label: "Go to the next animation slot",
    icons: {
      primary: 'ui-icon-seek-next'
    }
  })
  .click(function() {
    if (animationTimer) {
      stopAnimation();
    } else {
      showAnimationTiles(--animationSlot);
    }
  });

  jQuery('#map-animate button#anim-end')
  .button({
    text: false,
    label: "Go to the last animation slot",
    icons: {
      primary: 'ui-icon-seek-end'
    }
  })
  .click(function() {
    if (animationTimer) {
      stopAnimation();
    } else {
      showAnimationTiles(0);
    }
  });
});

var messageHandler = function(e) {
  //console.log('Message received', e.data);

  switch (e.data.type) {
    case "init":
      initialize(e.data);
      break;
    case "updateLocations":
      updateLocations(e.data);
      break;
    case "centerMap":
      centerMap(e.data);
      break;
    case "getAnimationTiles":
      getAnimationTiles(e.data);
      break;
    case "showAnimationTiles":
      showAnimationTiles(e.data);
      break;
    case "setSettingsMapLayer":
      setSettingsMapLayer(e.data);
      break;
    case "setSettingsIntlMapLayer":
      setSettingsIntlMapLayer(e.data);
      break;
    case "closeMap":
      closeMap(e.data);
    case "stopAnimation":
      stopAnimation(e.data);
    case "resetAnimation":
      resetAnimation(e.data);
    case "clearMapLayers":
      cleanUpLayers(e.data);
      break;
    default:
      break;
  }
}
window.addEventListener('message', messageHandler);


function loadScript() {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = "https://maps.googleapis.com/maps/api/js?sensor=false&language=en&callback=loaded";
  document.body.appendChild(script);
}
function loaded() {

  var mapOptions = {
    zoom: initMessage.zoom,
    center: new google.maps.LatLng(initMessage.centerLat, initMessage.centerLon),
    scrollwheel: initMessage.scrollwhell,
    mapTypeId: google.maps.MapTypeId.TERRAIN,
    streetViewControl: false,
    panControl: false,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL,
      position: google.maps.ControlPosition.LEFT_TOP
    },
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.TOP_LEFT
    }
  };  
  map = new google.maps.Map(document.getElementById("map_container"), mapOptions);
  mapBounds = new google.maps.LatLngBounds();
}

function initialize(message) {
  initMessage = message;
  loadScript();
}

function updateLocations(message) {

  if (map) {

    // Clear markers on map
    for (var i = 0; i < markers.length; i++ ) {
      markers[i].setMap(null);
    }
    markers = [];

    // Add locations to map
    for (var i = 0; i < message.locations.length; i++) {
       var markerPosition = new google.maps.LatLng(message.locations[i]["lat"], message.locations[i]["lon"]);
       var marker = new google.maps.Marker({
           map: map,
           position: markerPosition
       });
       markers.push(marker);
       //mapBounds.extend(markerPosition);
       markerPosition = null;
     }
   }
}

function centerMap(message) {
  if (map) {
    currentLocation = message.location;
    map.setCenter(new google.maps.LatLng(message.location.lat, message.location.lon));
  }
}

function closeMap() {
  stopAnimation();
  resetAnimation();
  animationSlot = 0;
  cleanUpLayers();
}

function setSettingsMapLayer(message) {
  if (message !== undefined && message.layerId !== undefined) {
    settingsMapLayer = message.layerId;
  }
}

function setSettingsIntlMapLayer(message) {
  if (message !== undefined && message.layerId !== undefined) {
    settingsIntlMapLayer = message.layerId;
  }
}

function getAnimationTiles(message) {
  for (var i = 0; i < animationTiles.length; i++) {
    if (animationTiles[i]) animationTiles[i].hide();
  }
  animationTiles = [];
  cleanUpLayers();

  var legendURL = "http://chrome.tiles.weatherbug.com/DataService/GetLegend_v2.aspx?pid=1ae17a58-42dd-48d5-908b-72fe6ede8fba&cid=" + CID + "&lid=";
  jQuery("#map-animation-slots .animation-slot").remove();

  var mapLayer = settingsMapLayer;
  if (message !== undefined && message.layerId !== undefined) {
    mapLayer = message.layerId;
  } else {
    if (currentLocation["isUs"] == false) {
      mapLayer = settingsIntlMapLayer;
    }
  }

  if ((mapLayer == 0) || (mapLayer == 45) || (mapLayer == 46) || (mapLayer == 47) || (mapLayer == 58) || (mapLayer == 59)) {
    jQuery("#map-animate-wrap").hide();
  } else {
    jQuery("#map-animate-wrap").show();
  }
  if (jQuery("#map-legend img").attr("src") != legendURL + mapLayer) {
    jQuery("#map-legend img").fadeOut("fast", function () {
      jQuery(this).attr("src", legendURL + mapLayer).fadeIn("fast");
    });
  }
  for (var i = 0; i < animationCount; i++) {
    var thisOverlay = addOverlay(mapLayer, i, settingsMapOpacity);
    animationTiles.push(thisOverlay);
    jQuery("#map-animation-slots").prepend("<div class='animation-slot flexbox-box' id='animation-slot-" + i + "'></div>");
    thisOverlay = null;
  }

  //savedLocations["mapTilesUpdated"] = new Date();
  lastUpdatedDate = new Date();
  jQuery("#map-last-update").html(lastUpdatedDate.formatDate("MM/dd/yyyy, hh:mmT"))
  jQuery("#map-animation-slots .animation-slot").unbind("click");
  jQuery("#map-animation-slots .animation-slot").bind("click", function () {
    animationSlot = jQuery(this).attr("id").replace("animation-slot-", "");
    showAnimationTiles(parseInt(animationSlot));
  });
  showAnimationTiles(0);
  if (animationTilesChecker) clearTimeout(animationTilesChecker);
  animationTilesChecker = setTimeout(function () {
    getAnimationTiles();
  }, animationTilesCheckerInterval);
}

function showAnimationTiles(animationSlot) {
  if (animationSlot == animationTiles.length) animationSlot = 0;
  else if (animationSlot < 0) animationSlot = animationTiles.length - 1;
  var tilesUpdated = lastUpdatedDate;
  var tilesLoaded = true;
  for (var i = 0; i < animationTiles.length; i++) {
    if (animationSlot == i) {
      var thisAnimationTile = animationTiles[i];
      for (var j = 0; j < thisAnimationTile["tiles"].length; j++) {
        if (!thisAnimationTile["tiles"][j].complete) tilesLoaded = false;
      }
      jQuery("#map-last-update").html(new Date(tilesUpdated.getTime() - animationSlot * 5 * mins).formatDate("MM/dd/yyyy, hh:mmT"))
      jQuery("#animation-slot-" + i).addClass("here");
      animationTiles[i].show();
    } else {
      jQuery("#animation-slot-" + i).removeClass("here");
      animationTiles[i].hide();
    }
    if (tilesLoaded) jQuery("#map-animation-loading").css("display", "");
  }
  if (animationCount > 1) {
    if (animationTimer) {
      clearTimeout(animationTimer);
      animationTimer = false;
    }
    if (animationSlot == 0) var animationTimeout = 700;
    else var animationTimeout = 100;
    animationTimer = setInterval(function () {
      showAnimationTiles(--animationSlot);
    }, animationTimeout);
  }
}

function startAnimation() {
  animationCount = 12;
  getAnimationTiles();
  jQuery("#map-animate button#anim-play").button('option', { label: 'pause', icons: { primary: 'ui-icon-pause'} })
  ;
  jQuery("#map-animate button#anim-end").show();
  jQuery("#map-animate button#anim-next").show();
  jQuery("#map-animate button#anim-prev").show();
  jQuery("#map-animate button#anim-begin").show();
  jQuery("#map-animation-slots").show();
}

function stopAnimation() {
  animationCount = 1;
  clearTimeout(animationTimer);
  animationTimer = false;
  jQuery("#map-animate button#anim-play").button('option', { label: 'play', icons: { primary: 'ui-icon-play'} })
  ;
}

function resetAnimation() {
  jQuery("#map-animate button#anim-end").hide();
  jQuery("#map-animate button#anim-next").hide();
  jQuery("#map-animate button#anim-prev").hide();
  jQuery("#map-animate button#anim-begin").hide();
  jQuery("#map-animation-slots").hide();
}

function cleanUpLayers() {
  map.overlayMapTypes.clear();
  //console.log("all layers cleared");
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
var weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];