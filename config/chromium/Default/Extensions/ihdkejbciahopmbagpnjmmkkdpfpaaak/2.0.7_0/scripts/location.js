var searchedLocations = [];
var backupLocations = [];
var okayToUpdate = true;

jQuery(document).ready(function() {
	jQuery("#locations").disableSelection().sortable({
		placeholder: "ui-state-highlight",
		tolerance: "pointer",
		containment: "parent",
		scroll: true,
		handle: "header",
		axis: "x",
		opacity: 0.6,
		revert: true,
		change: function() { okayToUpdate = false; },
		update: function() { locationWorker.postMessage({ type: "locations", arg: "sort" }) },
	});	
	return (true);
});

locationWorker.onmessage = function(evt) {
	//console.log(new Date().formatDate("hh:mm:ss") + " " + evt.data.type + " " + evt.data.arg)
	switch (evt.data.type) {
		case "locations":
			switch (evt.data.arg) {
				case "get":
					chrome.storage.local.get("savedLocations", function(val) {
						// NOTE that chrome.storage is asycn, which is why we're firing in here
						// to clear all location data, run chrome.storage.sync.remove("savedLocations"); in the console.
						savedLocations = val.savedLocations;
						if (savedLocations === undefined) {
							savedLocations = new Object;
							savedLocations.locations = [];
							locationWorker.postMessage({ type: "location", arg: "geolocate" });
						}
						locationWorker.postMessage({ type: "locations", arg: "load" });
					});

					break;
				case "search":
					var  searchButton = {
						id: "searchButton",
						text: "Search",
						click: function() {
							if (jQuery("#search-location").attr("value").length > 0) {
								jQuery(this).dialog("close");
								locationWorker.postMessage({ type: "locations", arg: "search results" });
							}
							return(true);
						}
					};
					var geolocateButton =	{
						id: "geoLocationButton",
						text: "Geolocate",
						click: function () {
							jQuery(this).dialog("close");
							locationWorker.postMessage({ type: "location", arg: "geolocate" });
							return(true);
						}
					};
					var cancelButton = {
						id: "searchCancelButton",
						text: "Cancel",
						click: function () {
							if (savedLocations.locations.length == 0) {
								locationWorker.postMessage({ type: "location", arg: "add", data: createLocation("HQ") })
							}
							jQuery("#search-location").attr("value", null);
							jQuery(this).dialog("close");
							return (true);
						}
					}
					var dialogButtons = new Object({
						Search: searchButton,
						Geolocate: geolocateButton,
						Cancel: cancelButton
					});
					if (geolocationPermissionDenied) {
						dialogButtons = new Object({
							Search: searchButton,
							Cancel: cancelButton
						});
					}
					jQuery("#search-location-wrap").dialog({
						position: dialogPosition,
						modal: true, draggable: false, resizable: false, stack: false, minWidth: 460,
						buttons: dialogButtons,
						open: function() {
							searchedLocations = [];
							return (true);
						},
						close: function() {
							if ((savedLocations.locations.length == 0) && (jQuery("#search-location").attr("value").length == 0)) {
								locationWorker.postMessage({ type: "location", arg: "add", data: createLocation("HQ") });
							}
							jQuery("#search-location-wrap .error").html(null);
							return (true);
						}
					});
					break;
				case "search results":
					var searchTerm = jQuery("#search-location").attr("value");
					var searchType = "address";
					if (searchTerm.search(/^(-{0,1}\d+.[\d.]*)\,(-{0,1}\d+.[\d.]*)$/) == 0) {
						searchType = "latlng";
					}
					var url = "http://maps.googleapis.com/maps/api/geocode/json?" + searchType + "=" + searchTerm + "&sensor=true";
					var ajaxConnection = jQuery.get(url, function(data, textStatus) {
						var locations = JSON.parse(data);
						if (locations.results.length == 0) {
							jQuery("#search-location-wrap").dialog("open");
							jQuery("#search-location-wrap .error").html("No locations found, please try again.");
						} else if (locations.results.length >= 1) {
							jQuery("#search-location-wrap .error").html("");
							locationWorker.postMessage({ type: "locations", arg: "confirm", data: locations.results });
						}
						searchTerm = searchType = url = ajaxConnection = null;
					}, "text");
					break;
				case "display confirm":
					jQuery("#confirm-location-wrap").dialog({
						position: dialogPosition,
						modal: true, draggable: false, resizable: false, stack: false, minWidth: 460,
						buttons: {
							Select: function() {
								if (jQuery("#confirm-location").attr("value") == "-1") {
									// none of the options presented are correct, search again
									locationWorker.postMessage({ type: "locations", arg: "search" });
								} else {
									currentLocation = searchedLocations[jQuery("#confirm-location").attr("value")];
									locationWorker.postMessage({ type: "location", arg: "add", data: searchedLocations[jQuery("#confirm-location").attr("value")] });
                                    placeAdsTimer();
								}
								jQuery(this).dialog("destroy");
								return (true);
							},
							Cancel: function() {
								if (savedLocations.locations.length == 0) {
									locationWorker.postMessage({ type: "location", arg: "add", data: createLocation("HQ") })
								}
								jQuery(this).dialog("destroy");
								placeAdsTimer();
								return (true);
							}
						},
						close: function() {
							locationWorker.postMessage({ type: "location", arg: "add", data: createLocation("HQ") })
							jQuery("#confirm-location-wrap .error").html(null);
							jQuery(this).dialog("destroy");
							placeAdsTimer();
							return (true);
						}
					});
					break;
				case "confirm":
					var locations = evt.data.data;
					var locationSelector = jQuery("#confirm-location");

					locationSelector.find("option").remove();

					for (var i = 0; i < locations.length; i++) {
						var location = locations[i];
						var thisLocationObject = createLocation();
						var city, locality, region, country, countryCode, zipcode;
						for (var j = 0; j < location["address_components"].length; j++) {
							var types = "";
							for (var type in location["address_components"][j]["types"]) {
								types += location["address_components"][j]["types"][type] + ",";
							}
							if ((types.search(/political/i) >= 0) && (types.search(/locality/i) >= 0)) {
								city = location["address_components"][j]["long_name"];
							} else if ((types.search(/political/i) >= 0) && (types.search(/administrative_area_level_2/i) >= 0)) {
								locality = location["address_components"][j]["short_name"];
							} else if ((types.search(/political/i) >= 0) && (types.search(/administrative_area_level_1/i) >= 0)) {
								region = location["address_components"][j]["short_name"];
							} else if ((types.search(/political/i) >= 0) && (types.search(/country/i) >= 0)) {
								country = location["address_components"][j]["long_name"];
								countryCode = location["address_components"][j]["short_name"];
							} else if (types.search(/postal_code/i) >= 0) {
								zipcode = location["address_components"][j]["long_name"];
							}
							types = null;
						}
						if ((city === undefined) || (city === null))	{
							if ((locality === undefined) || (locality === null))	{
								if ((region === undefined) || (region === null))	{
									city = null;
								} else {
									city = region;
								}
							} else {
								city = locality;
							}
						}

						thisLocationObject["displayName"] = city;
						thisLocationObject["city"] = city;

                        //var url = "http://direct.weatherbug.com/DataService/GetLocation.ashx?zip=" + zipcode;

                        var url = "";

						if (countryCode == "US") {
							if (thisLocationObject["city"] === null)	{
								thisLocationObject.displayName = location["formatted_address"];
							} else {
								thisLocationObject["displayName"] += ", " + region;
							}
							thisLocationObject["country"] = countryCode;
							thisLocationObject["isUs"] = true;
							thisLocationObject["zipCode"] = zipcode;
							thisLocationObject["state"] = region;
                            url = "http://direct.weatherbug.com/DataService/GetLocationSearch.ashx?ci=" + city + "&st=" + thisLocationObject["state"] + "&co=United States";
						} else {
							if (thisLocationObject["city"] === null)	{
								thisLocationObject.displayName = location["formatted_address"];
							} else {
								thisLocationObject["displayName"] += ", " + country;
							}
							thisLocationObject["country"] = country;
							thisLocationObject["isUs"] = false;
							thisLocationObject["zipCode"] = null;
                            url = "http://direct.weatherbug.com/DataService/GetLocationSearch.ashx?ci=" + location["formatted_address"] + "&co=" + country;
						}

                        try
                        {
                        	// I don't think CSP will allow syncronous requests, or maybe it's web workers. not sure.
                        	// and async won't guarentee the value everytime.
                            //jQuery.ajaxSetup({async:false});
                            var _thisLocationObject = thisLocationObject;
	                        var ajaxConnection = jQuery.get(url, function(data, textStatus) {
	                        	if (data && data.cityList) {
		                        	_thisLocationObject["dma"] = data.cityList[0].dma;
		                        }
	                        }, "json");
                            //jQuery.ajaxSetup({async:true});
                        }
                        catch(e)
                        {
                            console.log('error getting dma');
                        }

						thisLocationObject.lat = Math.round(location["geometry"]["location"]["lat"] * 10000) / 10000;
						thisLocationObject.lon = Math.round(location["geometry"]["location"]["lng"] * 10000) / 10000;
						locationSelector.append("<option value='" + i + "'>" + location["formatted_address"] + "</option>");
						searchedLocations.push(thisLocationObject);
						city = locality = region = country = countryCode = zipcode = location = thisLocationObject = null;
					}


					locationSelector.append("<option value='-1'>None of the above... Search Again...</option>");
					locationWorker.postMessage({ type: "locations", arg: "display confirm" });
					break;
				case "load":

                    placeAdsTimer();
                    omniture("HOME", "HOME PAGE");
                
					for (var i = 0; i < savedLocations.locations.length; i++) {
						if ((i == 0) && (currentLocation === undefined)) currentLocation = savedLocations.locations[i];
						backupLocations.push(savedLocations.locations[i]);
						function loadTimer() {
							var locationIndex = i;
							function timeoutFunc ()	{
								if (jQuery("#locations #location" + locationIndex).length == 0) {
									locationWorker.postMessage({ type: "location", arg: "add location to menu", data: savedLocations.locations[locationIndex] });
								} else {
									locationWorker.postMessage({ type: "location", arg: "load", data: savedLocations.locations[locationIndex] });
								}
							}
							this.setVal = function(val) { locationIndex = val; }
							this.causeTimeout = function() { setTimeout(timeoutFunc, locationIndex * .5 * secs); }
						}
						var obj  = new loadTimer();
						obj.causeTimeout();
						obj = null;
					}
					if (savedLocations.locations.length < 10) {
						jQuery("#location-panel").show("fade","fast");
					} else {
						jQuery("#location-panel").hide("fade","fast");
					}
					
					if (savedLocations.locations.length > 4) {
						jQuery("#prev-location").button({
							text: false,
							disabled: function() { return(currentLocation["index"] < 4); },
							icons: { primary: "ui-icon-seek-prev" }
						}).show("fade", "fast").bind("click", function() {
							worker.postMessage({ type: "previous location" });
						});

						jQuery("#next-location").button({
							text: false,
							disabled: function() { return(currentLocation["index"] > savedLocations.locations.length); },
							icons: { primary: "ui-icon-seek-next" }
						}).show("fade", "fast").bind("click", function() {
							worker.postMessage({ type: "next location" })
						});
					}
					
					break;
				case "save":
					chrome.storage.local.set({'savedLocations': savedLocations}, function(){
						//console.log("Saved locations completed: " + JSON.stringify(savedLocations));
					});
					okayToUpdate = true;
					break;
				case "reindex":
					okayToUpdate = false;
					if (savedLocations.locations.length > 0) {
						worker.postMessage({ type: "stop timers" });
						var sortedLocations = new Array(0);
						var locations = jQuery("#locations").sortable('toArray');
						jQuery("#locations li").each(function(){ 
							var previousIndex = parseInt(jQuery(this).attr("id").replace(/location/, ""));
							jQuery(this).removeClass("location" + previousIndex).addClass("location" + jQuery(this).index())
							jQuery(this).attr("id","location" + jQuery(this).index());
							previousIndex = null;
						});
						for (var i = 0; i < locations.length;  i++) {
							var newLocation = savedLocations.locations[i];
							newLocation["index"] = i;
							sortedLocations[i] = newLocation;
						}
						savedLocations.locations = sortedLocations;
						worker.postMessage({ type: "start timers" });
						currentLocation = savedLocations.locations[jQuery("#locations li.active").index()];
						locationWorker.postMessage({ type: "locations", arg: "save" });
						locationWorker.postMessage({ type: "location", arg: "load", data: currentLocation });
					}
					break;
				case "sort":
					okayToUpdate = false;
					var locations = jQuery("#locations").sortable('toArray');
					var sortedLocations = [];
					for (var i = 0; i < locations.length;  i++) {
						var locationId = locations[i];
						var locationIndex = parseInt(locationId.replace(/location/, ""));
						sortedLocations.push(savedLocations.locations[locationIndex]);
					}
					if (sortedLocations.length > 0) {
						savedLocations.locations = null;
						savedLocations.locations = sortedLocations;
						locationWorker.postMessage({ type: "locations", arg: "reindex" })
					}
					break;
			}
			break;
		case "location":
			var location = evt.data.data;
			switch (evt.data.arg) {
				case "geolocate":
					if (navigator.geolocation) {
						var watchPosisition = navigator.geolocation.watchPosition(function(position) {
							currentLocation = createLocation();
							currentLocation["lat"] = position.coords.latitude;
							currentLocation["lon"] = position.coords.longitude;
							jQuery("#search-location").attr("value", currentLocation["lat"] + "," + currentLocation["lon"]);
							locationWorker.postMessage({
								type: "locations",
								arg: "search results"
							});
							navigator.geolocation.clearWatch(watchPosisition);
						}, function(error) {
							var errorMessage;
							switch(error.code) {
								case error.TIMEOUT:
									errorMessage = "Geolocation service timed out."
									break;
								case error.POSITION_UNAVAILABLE:
									errorMessage = "Geolocated position is unavailable."
									break;
								case error.PERMISSION_DENIED:
									errorMessage = "Permission to get locations is denied by user or user settings."
									geolocationPermissionDenied = true;
									break;
								case error.UNKNOWN_ERROR:
									errorMessage = "Unknown geolocation error."
									break;
							}
							jQuery("#search-location-wrap .error").html(errorMessage);
							locationWorker.postMessage({ type: "locations", arg: "search" });
							return (true);
						});
					} else {
						locationWorker.postMessage({ type: "locations", arg: "search" });
					}
					break;
				case "load":
					if (!okayToUpdate) return (true);
					var url = urlString(location);

					var gettingAlerts = gettingObs = gettingCameras = gettingForecast = gettingStations = gettingUV = gettingLocation = gettingPollen = false;
					var now = new Date().getTime();
					
					if ((location["AlertData"] === undefined) || (location["AlertData"] === null)) {
						worker.postMessage({ type: "alert", arg: "start timer", data: location["index"] });
						location["AlertData"] = new Object;
					} 
					gettingAlerts = true; // always get alerts
					
					if ((location["ObsData"] === undefined) || (location["ObsData"] === null)) {
						worker.postMessage({ type: "obs", arg: "start obs timer", data: location["index"] });
						location["ObsData"] = new Object;
						gettingObs = true;
					} else if ((location["ObsData"]["updated"] === null) || (location["ObsData"]["updated"] === undefined)) {
						gettingObs = true;
					} else {
						worker.postMessage({ type: "obs", arg: "load obs ui", data: location["index"] });
						if ((now - location["ObsData"]["updated"]) >= obsCheckerInterval) {
							gettingObs = true;
						}
					}
					
					if ((location["UvData"] === null) || (location["UvData"] === undefined)) {
						worker.postMessage({ type: "obs", arg: "start uv timer", data: location["index"] });
						location["UvData"] = new Object;
						gettingUV = true;
					} else if ((location["UvData"]["updated"] === null) || (location["ForecastData"]["updated"] === undefined)) {
						gettingUV = true;
					} else {
						worker.postMessage({ type: "obs", arg: "load uv ui", data: location["index"] })
						if ((now - location["UvData"]["updated"]) >= uvCheckerInterval) {
							gettingUV = true;
						}
					}
					
					if ((location["CameraListData"] === null) || (location["CameraListData"] === undefined)) {
						worker.postMessage({ type: "cameras", arg: "start timer", data: location["index"] });
						location["CameraListData"] = new Object;
						gettingCameras = true;
					} else if ((location["CameraListData"]["updated"] === null) || (location["CameraListData"]["updated"] === undefined)) {
						gettingCameras = true;
					} else {
						if (compareLocations(currentLocation, location)) {
							worker.postMessage({ type: "cameras", arg: "load camera ui", data: location["index"] });
						}
						if ((now - location["CameraListData"]["updated"]) >= cameraCheckerInterval) {
							gettingCameras = true;
						}
					}

					if ((location["ForecastData"] === null) || (location["ForecastData"] === undefined)) {
						worker.postMessage({ type: "forecast", arg: "start forecast timer", data: location["index"] });
						location["ForecastData"] = new Object;
						gettingForecast = true;
					} else if ((location["ForecastData"]["updated"] === null) || (location["ForecastData"]["updated"] === undefined)) {
						gettingForecast = true;
					} else {
						worker.postMessage({ type: "forecast", arg: "load forecast ui", data: location["index"] })
						if ((now - location["ForecastData"]["updated"]) >= forecastCheckerInterval) {
							gettingForecast = true;
						}
					}

					if ((location["StationData"] === null) || (location["StationData"] === undefined)) {
						location["StationData"] = new Object;
						gettingStations = true;
					} else if ((location["StationData"]["updated"] === null) || (location["StationData"]["updated"] === undefined)) {
						gettingStations = true;
					} else {
						if ((now - location["StationData"]["updated"]) >= locationCheckerInterval) {
							gettingStations = true;
						}
					}

                    if ((location["PollenData"] === null) || (location["PollenData"] === undefined)) {
						location["PollenData"] = new Object;
						gettingPollen = true;
					} else if ((location["PollenData"]["updated"] === null) || (location["PollenData"]["updated"] === undefined)) {
						gettingPollen = true;
					} else {
						if (now - new Date(location["StationData"]["updated"]).getTime() >= pollenCheckerInterval) {
							gettingPollen = true;
						}
					}
					
	                worker.postMessage({ type: "set location menu", arg: location["index"] });
	                
					
					var locationTab = jQuery("#locations .location" + location["index"]);
					if (locationTab.is(":hidden")) {
						locationTab.show("blind", { direction: "down" }, "slow")
					}
					
					if (gettingLocation) url += "&dt=l";
					if (gettingStations) url += "&dt=s";

					function updateLocation()	{

						try{

                            //console.log('update location');

                            var haveInfo = false;
                        	var loadLocationCallback = "";
                            var loadLocationCallbackObs = "";
                            var loadLocationCallbackCameras = "";
                            var loadLocationCallbackForecast = "";
                            var loadLocationCallbackAlerts = "";
                            var loadLocationCallbackPollen = "";

							if (gettingObs) 
                            {
                                loadLocationCallbackObs =	'worker.postMessage({ type: "obs", arg: "get obs", data: location["index"] });';
                                locationWorker.postMessage({ type: "location", arg: "update", data: location, callback: loadLocationCallbackObs });
                            }
							if (gettingCameras) 
                            {
                                loadLocationCallbackCameras =	'worker.postMessage({ type: "cameras", arg: "get cameras", data: location["index"] });';
                                locationWorker.postMessage({ type: "location", arg: "update", data: location, callback: loadLocationCallbackCameras });
                            }
							if (gettingForecast) 
                            {
                                loadLocationCallbackForecast = 'worker.postMessage({ type: "forecast", arg: "get forecast", data: location["index"] });';
                                locationWorker.postMessage({ type: "location", arg: "update", data: location, callback: loadLocationCallbackForecast });
                            }
							if (gettingAlerts) 
                            {
                                loadLocationCallbackAlerts = 'worker.postMessage({ type: "alert", arg: "get alerts", data: location["index"] });';
                                locationWorker.postMessage({ type: "location", arg: "update", data: location, callback: loadLocationCallbackAlerts });
                            }
                            if (gettingPollen) 
                            {
                                loadLocationCallbackPollen = 'worker.postMessage({ type: "pollen", arg: "get pollen", data: location["index"] });';
                                locationWorker.postMessage({ type: "location", arg: "update", data: location, callback: loadLocationCallbackPollen });
                            }

							loadLocationCallback = null;

                            mapWorker.postMessage({ type: "load", data: location["index"] });

						} catch(e) {
                            //console.log('Error Updating Station Objects: ' + e.Message);
                        }
						return(true);
					}
					if (url != urlString(location)) {
						//console.log(new Date().formatDate("hh:mm:ss") + " " + url);
						var ajaxConnection = jQuery.get(url, function(data, textStatus) {
							if (textStatus != "success") {
								setTimeout(function() {
									locationWorker.postMessage({ type: "location", arg: "load", data: location });
								}, ajaxTimeout);
								return (false);
							}
							var weatherData = JSON.parse(data)["weather"]
							var updated = new Date().getTime();
							if (url.search(/&dt=l/) > 0) {
								for (var locationData in weatherData["LocationData"]["location"]) {
									if (locationData == "lat")	{
										if (location[locationData] === null || location[locationData] === undefined)	{
											location[locationData] = weatherData["LocationData"]["location"][locationData];
										}
									} else if (locationData == "lon")	{
										if (location[locationData] === null || location[locationData] === undefined)	{
											location[locationData] = weatherData["LocationData"]["location"][locationData];
										}
									} else {
										location[locationData] = weatherData["LocationData"]["location"][locationData]
									}
									location["updated"] = updated;
								}
								
							}
							
							if (url.search(/&dt=s/) > 0) {
								location["StationData"] = weatherData["StationData"]["stationList"][0];
								location["StationData"]["updated"] = updated;
							}
							url = weatherData = updated = ajaxConnection = null;
							updateLocation()
						}, "text");
					}
					updateLocation();
					break;
				case "add":
					var isDupe = false;
					for (var i = 0; i < savedLocations.locations.length; i++)	{
						if (compareLocations(location, savedLocations.locations[i])) isDupe = true;
					}
					if (isDupe)	{
						jQuery("#search-location-wrap").dialog("open");
						jQuery("#search-location-wrap .error").html("Duplicate location, please try again.");
					} else {
						location["index"] = savedLocations.locations.length;
						currentLocation = location;
						savedLocations.locations.push(location);
						locationWorker.postMessage({ type: "location", arg: "add location to menu", data: location });
						locationWorker.postMessage({ type: "locations", arg: "save" });
						if (savedLocations.locations.length < 10) {
							jQuery("#location-panel").show("fade","fast");
						} else {
							jQuery("#location-panel").hide("fade","fast");
						}
						
						if (savedLocations.locations.length > 4) {
							jQuery("#prev-location").button({
								text: false,
								disabled: true,
								icons: { primary: "ui-icon-seek-prev" }
							}).show("fade", "fast").bind("click", function() {
								worker.postMessage({ type: "previous location" });
							});

							jQuery("#next-location").button({
								text: false,
								disabled: true,
								icons: { primary: "ui-icon-seek-next" }
							}).show("fade", "fast").bind("click", function() {
								worker.postMessage({ type: "next location" })
							});
						}
					}
					break;
				case "add location to menu":
					var locationTabs = jQuery("#locations");
					var contentString = "";
					contentString += "<li id='location" + location["index"] + "' style='display:none;' class='location location" + location["index"] + " border-box";
					if (compareLocations(currentLocation, location)) {
						jQuery("#locations li").removeClass("active");
						contentString += " active";
					}
					contentString += "'>";
					contentString += "<header class='flexbox horizontal center'>";
					//contentString += "<span class='drag-handle'></span>";
					contentString += "<div class='alert-icon'><span class='alertCount'><span class='value'></span></span></div>";
					contentString += "<div class='displayName flexbox-box flexbox center pack-center'><span class='value'></span></div>";
					contentString += "<div class='delete-location'><button>Delete Location</button></div>";
					//contentString += "<div class='edit-location'><button>Edit Location</button></div>";
					contentString += "</header>";
					contentString += "<div class='obs flexbox horizontal start'>";
					contentString += "<span class='obs icon'><span class='value'></span></span>";
					contentString += "<span class='temperature-wrap flexbox vertical center'>";
					contentString += "<span class='obs temperature'><span class='value'></span></span><span class='obs temperatureUnits'><span class='value'></span></span>";
					contentString += "</span>";
					contentString += "<span class='obs desc flexbox-box flexbox horizontal center pack-center'><span class='value'></span></span>";
					contentString += "</div>";
					contentString += "<div id='location-extras' style='display:none'>";
					contentString += "</div>";
					contentString += "</li>";
					locationTabs.append(contentString);
					locationTabs.find(".location" + location["index"]).unbind("click")
						.bind("click", function() {
							if (jQuery(this).hasClass("active")) return(true);
							jQuery("#locations .location").removeClass("active");
							jQuery(this).addClass("active");
							currentLocation = savedLocations.locations[jQuery("#locations .location").index(jQuery(this))];
							locationWorker.postMessage({ type: "location", arg: "load", data: currentLocation });

							placeAdsTimer();
							omniture("HOME", "HOME PAGE"); // user is switching tabs, but what page are they on? we'll say home for now
						}
					).addClass("clickable");
					locationTabs.find(".location" + location["index"] + " .delete-location").button({
						text: false,
						icons: { primary: "ui-icon-close" }
					}).show("fade", "fast").bind("click", function() {
						locationWorker.postMessage({ type: "location", arg: "confirm delete", data: savedLocations.locations[jQuery(this).closest("li").index()] });
					}, false);
					locationWorker.postMessage({ type: "location", arg: "load", data: location });
					locationTabs = contentString = null;
        			
        			closeAllPanels();
					break;
				case "edit":
					//jQuery("#locations .location" + location["index"] + " .location-extras").show();
					break;
				case "update":
					var thisLocation = savedLocations.locations[location["index"]];
					if (JSON.stringify(thisLocation) != JSON.stringify(location)) {
						savedLocations.locations[location["index"]] = location;
						locationWorker.postMessage({ type: "locations", arg: "save" });
					}
					
					var FIX_CALLBACK = evt.data.callback.substring(evt.data.callback.indexOf("{"));
					FIX_CALLBACK = FIX_CALLBACK.substring(0, FIX_CALLBACK.length - 2);
					FIX_CALLBACK = FIX_CALLBACK.replace('type', '"type"').replace('arg', '"arg"').replace('data', '"data"');
					FIX_CALLBACK = FIX_CALLBACK.replace('location["index"]', location["index"]);
                    FIX_CALLBACK = JSON.parse(FIX_CALLBACK);

                    if ((FIX_CALLBACK.type == "forecast") || (FIX_CALLBACK.type == "obs") || (FIX_CALLBACK.type == "cameras") || (FIX_CALLBACK.type == "alert") || (FIX_CALLBACK.type == "pollen"))
                    {
                        worker.postMessage(FIX_CALLBACK); 
                    }
					thisLocation = null;
					break;
				case "delete":
					worker.postMessage({ type: "alert", arg: "stop timer", data: location["index"] });
					worker.postMessage({ type: "obs", arg: "stop obs timer", data: location["index"] });
					worker.postMessage({ type: "obs", arg: "stop uv timer", data: location["index"] });
					worker.postMessage({ type: "forecast", arg: "stop forecast timer", data: location["index"] });
					worker.postMessage({ type: "cameras", arg: "stop timer", data: location["index"] });
                    worker.postMessage({ type: "pollen", arg: "stop pollen timer", data: location["index"] });
					jQuery("#locations li.location" + location["index"]).hide("blind", { direction: "down" }, "fast", function() {
						jQuery(this).remove();
						savedLocations.locations.splice(location["index"], 1);
						if (savedLocations.locations.length == 0) {
							locationWorker.postMessage({ type: "location", arg: "geolocate" });
						} else if (savedLocations.locations.length <= 4) {
							jQuery("#prev-location").button("destroy");
							jQuery("#next-location").button("destroy");
						}
						if (savedLocations.locations.length < 10) {
							jQuery("#location-panel").show("fade","fast");
						} else {
							jQuery("#location-panel").hide("fade","fast");
						}
					
						worker.postMessage({ type: "first location" });
						jQuery("#locations .location").first().addClass("clickable active");

						locationWorker.postMessage({ type: "locations", arg: "reindex" });
						// currentLocation = savedLocations.locations[0];
						// locationWorker.postMessage({ type: "location", arg: "load", data: currentLocation });
						return (true);
					});
					break;
				case "confirm delete":
					jQuery("#delete-location-wrap").dialog({
						position: dialogPosition,
						modal: true, draggable: false, resizable: false, stack: false, width: 250,
						buttons: {
							Delete: function() {
								var locationIndex = jQuery("#delete-location-wrap .index .value").html();
								locationWorker.postMessage({ type: "location", arg: "delete", data: savedLocations.locations[locationIndex] });
                                placeAdsTimer();
								jQuery(this).dialog("close");
								return (true);
							},
							Cancel: function() {
								jQuery(this).dialog("close");
								return (true);
							}
						},
						close: function() {
							jQuery("#delete-location-wrap .index .value").html("");
							jQuery(this).dialog("destroy");
							return (true);
						}
					});
					jQuery("#delete-location-wrap .displayName .value").html(location["displayName"]);
					jQuery("#delete-location-wrap .index .value").html(location["index"]);
					break;
			}
			break;
	}
	return (true);
}

function placeAdsTimer(noDelay)
{
	if (noDelay) {
		placeAds();
	} else {
	    var t = setTimeout(function() { placeAds(); },2000);
	    t = null;
	}
    return false;
}

function placeAds()
{
    worker.postMessage({ type: "ads", arg: "place ads" });
    return false;
}

function createLocation(LOCATION) {
	var location = {};
	location["index"] = savedLocations.locations.length;
	location["displayName"] = null;
	location["city"] = null;
	location["cityCode"] = null;
	location["country"] = null;
	location["dma"] = null;
	location["isUs"] = false;
	location["lat"] = null;
	location["lon"] = null;
	location["state"] = null;
	location["zipCode"] = null;
	location["AlertData"] = new Object();
	location["ObsData"] = new Object();
	location["CameraListData"] = new Object();
	location["ForecastData"] = new Object();
	location["StationData"] = new Object();
	location["UvData"] = new Object();
    location["PollenData"] = new Object();
	if ((LOCATION) && (LOCATION == "HQ")) {
		location["displayName"] = "WeatherBug Headquarters"
		location["city"] = "Germantown";
		location["country"] = "US";
		location["dma"] = 511;
		location["isUs"] = true;
		location["lat"] = 39.2006;
		location["lon"] = -77.2631;
		location["state"] = "MD";
		location["zipCode"] = 20876;
	}
	return (location);
}

function compareLocations(LOC1, LOC2) {
	var isDupe = false;
	if ((LOC1) && (LOC2)) {
		if (LOC1.displayName == LOC2.displayName) 
        { 
            isDupe = true; 
            //console.log('Duplicate1');      
        }
		else if ((LOC1.lat == LOC2.lat) && (LOC1.lon == LOC2.lon)) 
        { 
            isDupe = true; 
            //console.log('Duplicate2');      
        }
	}
	return (isDupe);
}