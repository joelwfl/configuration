var obsDialog;
var obsTitle = function(LOCATION)	{
	var lastUpdated = new Date(LOCATION["ObsData"]["updated"]).formatDate("MM/dd/yyyy hh:mmT");
	var title = "";
	title += "<div class='dialog-title-wrap flexbox horizontal'>";
	title += "<span class='dialog-title flexbox-box'>";
	title += "Observations for " + LOCATION.displayName;
	title += "</span>";
	title += "<span class='last-updated'>Updated: " + lastUpdated + "</span>",
	title += "</div>";
	return(title);
}

var condVideos = new Object();
condVideos["dayClear"] = new Object();
condVideos["dayClear"]["conditions"] = new Array(0, 7, 26, 64, 65);
condVideos["dayClear"]["localVideo"] = true;
condVideos["dayClear"]["video"] = "day_clear.webm";
condVideos["dayClear"]["poster"] = "day_clear.jpg";

condVideos["dayWindy"] = new Object();
condVideos["dayWindy"]["conditions"] = new Array();
condVideos["dayWindy"]["conditions"].push(50);
condVideos["dayWindy"]["localVideo"] = true;
condVideos["dayWindy"]["video"] = "day_wind.webm";
condVideos["dayWindy"]["poster"] = "day_wind.jpg";

condVideos["dayFog"] = new Object();
condVideos["dayFog"]["conditions"] = new Array();
condVideos["dayFog"]["conditions"].push(51);
condVideos["dayFog"]["localVideo"] = true;
condVideos["dayFog"]["video"] = "day_fog.webm";
condVideos["dayFog"]["poster"] = "day_fog.jpg";

condVideos["dayFrost"] = new Object();
condVideos["dayFrost"]["conditions"] = new Array();
condVideos["dayFrost"]["conditions"].push(69);
condVideos["dayFrost"]["localVideo"] = true;
condVideos["dayFrost"]["video"] = "day_frost.webm";
condVideos["dayFrost"]["poster"] = "day_frost.jpg";

condVideos["dayCloudy"] = new Object();
condVideos["dayCloudy"]["conditions"] = new Array(1, 3, 4, 25, 66, 67, 68);
condVideos["dayCloudy"]["localVideo"] = true;
condVideos["dayCloudy"]["video"] = "day_cloudy.webm";
condVideos["dayCloudy"]["poster"] = "day_cloudy.jpg";

condVideos["dayMostlyCloudy"] = new Object();
condVideos["dayMostlyCloudy"]["conditions"] = new Array(23, 24);
condVideos["dayMostlyCloudy"]["localVideo"] = true;
condVideos["dayMostlyCloudy"]["video"] = "day_mostly_cloudy.webm";
condVideos["dayMostlyCloudy"]["poster"] = "day_mostly_cloudy.jpg";

condVideos["daySunRain"] = new Object();
condVideos["daySunRain"]["conditions"] = new Array(38, 41, 52, 108, 109, 110, 148);
condVideos["daySunRain"]["localVideo"] = true;
condVideos["daySunRain"]["video"] = "day_sun_rain.webm";
condVideos["daySunRain"]["poster"] = "day_sun_rain.jpg";

condVideos["dayRain"] = new Object();
condVideos["dayRain"]["conditions"] = new Array(5, 20, 58, 59, 63, 87, 88, 89, 132, 133, 134, 135, 141, 156, 157);
condVideos["dayRain"]["localVideo"] = true;
condVideos["dayRain"]["video"] = "day_rain.webm";
condVideos["dayRain"]["poster"] = "day_rain.jpg";

condVideos["daySunSnow"] = new Object();
condVideos["daySunSnow"]["conditions"] = new Array(9, 19, 39, 40, 84, 85, 86, 111, 112, 114, 140, 149);
condVideos["daySunSnow"]["localVideo"] = true;
condVideos["daySunSnow"]["video"] = "day_sun_snow.webm";
condVideos["daySunSnow"]["poster"] = "day_sun_snow.jpg";

condVideos["dayStorm"] = new Object();
condVideos["dayStorm"]["conditions"] = new Array(6, 22, 53, 93, 94, 95, 143);
condVideos["dayStorm"]["localVideo"] = true;
condVideos["dayStorm"]["video"] = "day_storm.webm";
condVideos["dayStorm"]["poster"] = "day_storm.jpg";

condVideos["daySnowRain"] = new Object();
condVideos["daySnowRain"]["conditions"] = new Array(46, 48, 56, 57, 60, 61, 90, 91, 92, 120, 121, 122, 129, 130, 131, 135, 136, 137, 142, 152, 155);
condVideos["daySnowRain"]["localVideo"] = true;
condVideos["daySnowRain"]["video"] = "day_snow_rain.webm";
condVideos["daySnowRain"]["poster"] = "day_snow_rain.jpg";

condVideos["daySnow"] = new Object();
condVideos["daySnow"]["conditions"] = new Array(8, 11, 21, 25, 54, 55, 62, 78, 79, 80, 126, 127, 128, 138, 154);
condVideos["daySnow"]["localVideo"] = true;
condVideos["daySnow"]["video"] = "day_snow.webm";
condVideos["daySnow"]["poster"] = "day_snow.jpg";

condVideos["nightClear"] = new Object();
condVideos["nightClear"]["conditions"] = new Array(17, 31, 70, 72, 75);
condVideos["nightClear"]["localVideo"] = true;
condVideos["nightClear"]["video"] = "night_clear.webm";
condVideos["nightClear"]["poster"] = "night_clear.jpg";

condVideos["nightWindy"] = new Object();
condVideos["nightWindy"]["conditions"] = new Array();
condVideos["nightWindy"]["conditions"].push(158);
condVideos["nightWindy"]["localVideo"] = true;
condVideos["nightWindy"]["video"] = "night_windy.webm";
condVideos["nightWindy"]["poster"] = "night_windy.jpg";

condVideos["nightFog"] = new Object();
condVideos["nightFog"]["conditions"] = new Array(33, 159);
condVideos["nightFog"]["localVideo"] = true;
condVideos["nightFog"]["video"] = "night_fog.webm";
condVideos["nightFog"]["poster"] = "night_fog.jpg";

condVideos["nightFrost"] = new Object();
condVideos["nightFrost"]["conditions"] = new Array();
condVideos["nightFrost"]["conditions"].push(74);
condVideos["nightFrost"]["localVideo"] = true;
condVideos["nightFrost"]["video"] = "night_frost.webm";
condVideos["nightFrost"]["poster"] = "night_frost.jpg";

condVideos["nightCloudy"] = new Object();
condVideos["nightCloudy"]["conditions"] = new Array(2, 13, 16, 34, 35, 71, 73);
condVideos["nightCloudy"]["localVideo"] = true;
condVideos["nightCloudy"]["video"] = "night_cloudy.webm";
condVideos["nightCloudy"]["poster"] = "night_cloudy.jpg";

condVideos["nightRain"] = new Object();
condVideos["nightRain"]["conditions"] = new Array(14, 15, 42, 45, 81, 82, 83, 114, 115, 116, 139, 150, 162, 163, 165, 167, 170, 173);
condVideos["nightRain"]["localVideo"] = true;
condVideos["nightRain"]["video"] = "night_rain.webm";
condVideos["nightRain"]["poster"] = "night_rain.jpg";

condVideos["nightSnow"] = new Object();
condVideos["nightSnow"]["conditions"] = new Array(12, 27, 29, 32, 43, 44, 96, 97, 98, 102, 103, 104, 117, 118, 119, 144, 146, 151, 160, 161, 164, 176);
condVideos["nightSnow"]["localVideo"] = true;
condVideos["nightSnow"]["video"] = "night_snow.webm";
condVideos["nightSnow"]["poster"] = "night_snow.jpg";

condVideos["nightStorm"] = new Object();
condVideos["nightStorm"]["conditions"] = new Array(18, 30, 105, 106, 107, 147);
condVideos["nightStorm"]["localVideo"] = true;
condVideos["nightStorm"]["video"] = "night_storm.webm";
condVideos["nightStorm"]["poster"] = "night_storm.jpg";

condVideos["nightSnowRain"] = new Object();
condVideos["nightSnowRain"]["conditions"] = new Array(28, 36, 47, 49, 99, 100, 101, 123, 124, 125, 145, 153, 166, 168, 169, 171, 172, 174, 175);
condVideos["nightSnowRain"]["localVideo"] = true;
condVideos["nightSnowRain"]["video"] = "night_snow_rain.webm";
condVideos["nightSnowRain"]["poster"] = "night_snow_rain.jpg";


//for (var video in condVideos)	{
//	console.log('<video src="' + condVideos[video]["video"] + '" id="video" width="428" height="280" preload autoplay loop></video>')
//}