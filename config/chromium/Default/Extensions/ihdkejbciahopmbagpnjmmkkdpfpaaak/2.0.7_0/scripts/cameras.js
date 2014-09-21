var cameraRadius = 100;
var cameraURL = "&dt=cl&r=" + cameraRadius + "&ii=1&cs=2";
var cameraDialog;
var enlargeCameraDialog;

jQuery(document).ready(function() {
	jQuery("#camera-icon").button({
		text: false,
		icons: { primary: "ui-icon-camera" }
	});
	jQuery(".camera-button.prev").button({
		text: false,
		icons: { primary: "ui-icon-seek-prev" }
	}).show();
	jQuery(".camera-button.next").button({
		text: false,
		icons: { primary: "ui-icon-seek-next" }
	}).show();
});

var cameraTitle = function(LOCATION)	{
	var lastUpdated = new Date(LOCATION["CameraListData"]["updated"]).formatDate("MM/dd/yyyy hh:mmT");
	var title = "";
	title += "<div class='dialog-title-wrap flexbox horizontal'>";
	title += "<span class='dialog-title flexbox-box'>";
	title += "Cameras"
	title += "</span>";
	title += "<span class='last-updated'>Updated: " + lastUpdated + "</span>",
	title += "</div>";
	return(title);
}

var enlargeCameraTitle = function(LOCATION)	{
	var lastUpdated = new Date(LOCATION["CameraListData"]["updated"]).formatDate("MM/dd/yyyy hh:mmT");
	var title = "";
	title += "<div class='dialog-title-wrap flexbox horizontal'>";
	title += "<span class='dialog-title flexbox-box'>";
	title += "Cameras near " + LOCATION.displayName;
	title += "</span>";
	title += "<span class='last-updated'>Updated: " + lastUpdated + "</span>",
	title += "</div>";
	return(title);
}