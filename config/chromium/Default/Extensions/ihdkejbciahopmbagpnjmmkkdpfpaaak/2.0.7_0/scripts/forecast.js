var forecastURL = "&dt=f&nf=7&ht=d&ht=t&ht=sc&ht=cp&ht=fl&ht=wd&ht=ws&ht=dp&ht=h&ih=1";
function windUnits(LOCATION) {
	var thisWindUnit = 0;
	if ((LOCATION["ForecastData"]["windUnits"] === undefined) || (LOCATION["ForecastData"]["windUnits"] === null)) {
		if (LOCATION["isUs"])	{
			thisWindUnit = parseInt(changedSettings.settings["units"]);
		} else {
			thisWindUnit =  parseInt(changedSettings.settings["intlUnits"]);
		}
	} else {
		return(LOCATION["ForecastData"]["windUnits"]);
	}
	if (thisWindUnit == 1) return("kph")
	else return("mph");
}

var forecastDialog;
var forecastTitle = function(LOCATION)	{
	var lastUpdated = new Date(LOCATION["ForecastData"]["updated"]).formatDate("MM/dd/yyyy hh:mmT");
	var title = "";
	title += "<div class='dialog-title-wrap flexbox horizontal'>";
	title += "<span class='dialog-title flexbox-box'>";
	title += "Forecasts for " + LOCATION.displayName;
	title += "</span>";
	title += "<span class='last-updated'>Updated: " + lastUpdated + "</span>",
	title += "</div>";
	return(title);
}

function sizeForecastSlider(FCAST, VAL) {
	if ((VAL === undefined) || (VAL === null) || (isNaN(VAL))) VAL = 100;
	
	var selector = "detailed";
	if (FCAST == "hourly") selector = "hourly";

	var scrollPanel = function() { return (jQuery("#fcast-" + selector + "-wrap .forecast-content-wrap")) };
	scrollPanel().css("height", "");
	var scrollPanelHeight = scrollPanel().height();
	var container = scrollPanel().parent();
	var containerHeight = container.height();
	var containerHeader = container.find(".header");
	if (containerHeader.length > 0) {
		containerHeight -= containerHeader.outerHeight(true);
	}
	var difference = parseInt(scrollPanel().outerHeight(true) - containerHeight);
	if (difference > 0) {
		slideHandler = function(evt, ui) {
			var difference = parseInt(scrollPanelHeight - containerHeight);
			var topValue = -((100 - ui.value) * difference / 100);
			container.find(".forecast-content").css("margin-top", topValue);
		};
		container.find(".forecast-content-wrap").css("height", containerHeight);
		container.find(".forecast-slider").slider({
			orientation: "vertical",
			range: 'max',
			min: 0,
			max: 100,
			value: VAL,
			slide: slideHandler,
			change: slideHandler
		});
		container.mousewheel(function(evt, delta) {
			var value = jQuery(this).find(".forecast-slider").slider("option", "value");
			if (delta > 0) value += 10;
			else if (delta < 0) value -= 10;
			value = Math.max(0, Math.min(100, value));
			jQuery(this).find(".forecast-slider").slider("option", "value", value);
			evt.preventDefault();
		});
	}
	return (true);
}