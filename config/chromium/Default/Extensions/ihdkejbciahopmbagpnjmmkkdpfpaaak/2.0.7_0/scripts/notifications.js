var alertsNotified = new Array(0);
var tweetsNotified = new Array(0);
var tweetUrl = "http://twitter.com/statuses/user_timeline/WeatherBug.json?count=3&callback=fetchTweets";
var tweetChecker;
var notificationWindow = notificationWindow || {};
(function () {
	if (typeof window["webkitNotifications"] === "object") {
		notificationWindow.myNotifications = window.webkitNotifications;
		notificationWindow.notificationStatus = "Unknown";
		notificationWindow.notifications = new Array(0);
		notificationWindow.setup = function () {
			if (notificationWindow.myNotifications.checkPermission() === 1) { // 1 = PERMISSION_UNKNOWN
				notificationWindow.myNotifications.requestPermission();
				notificationWindow.notificationStatus = "Unknown";
			} else if (notificationWindow.myNotifications.checkPermission() === 0) { // 0 = PERMISSION_ALLOWED
				notificationWindow.notificationStatus = "Allowed";
			} else {  // 2 = PERMISSION_DENIED
				notificationWindow.notificationStatus = "Denied";
			}
		};
	}
})();

jQuery(window).bind("load", function () {
	notificationWindow.setup();
});

function fetchTweets(data) {
	var tweet;
	var i = data.length;
	while (i--) {
		tweet = data[i];
		var thisTweetHasBeenNotified = false;
		for (var j = 0; j < tweetsNotified.length; j++) {
			if (tweetsNotified[j] == tweet.id) {
				thisTweetHasBeenNotified = true;
				j = tweetsNotified.length;
			}
		}
		if (!thisTweetHasBeenNotified) {
			var tweetId = tweet.id_str;
			var tweetIcon = tweet.user.profile_image_url;
			var tweetUserName = tweet.user.name;
			var tweetText = tweet.text;
			notificationWindow.notifications.push(notificationWindow.myNotifications.createNotification(tweetIcon, tweetUserName, tweetText));
			var tweetIndex = notificationWindow.notifications.length - 1;
			notificationWindow.notifications[tweetIndex]["id"] = tweetId;
			notificationWindow.notifications[tweetIndex]["replaceId"] = tweetId;
			notificationWindow.notifications[tweetIndex]["onclick"] = function () {
				window.open("http://twitter.com/#!/WeatherBug/status/" + this["id"]);
			};
			notificationWindow.notifications[tweetIndex]["ondisplay"] = function () {
				function loadTimer() {
					var tweetId = this["id"];
					function timeoutFunc() {
						hideNotification(tweetId);
					}
					this.setVal = function (val) { tweetId = val; }
					this.causeTimeout = function () { setTimeout(timeoutFunc, 15000); }
				}
				var obj = new loadTimer();
				obj.setVal(this["id"])
				obj.causeTimeout();
				obj = null;
			}
			notificationWindow.notifications[tweetIndex]["onclose"] = function () {
				removeNotification(this["id"]);
			};
			notificationWindow.notifications[tweetIndex].show();
			tweetsNotified.push(tweetId);
		}
	}
}

function hideNotification(NOTIFICATIONID)	{
	for (var i = 0; i < notificationWindow.notifications.length; i++)	{
		if (notificationWindow.notifications[i]["id"] == NOTIFICATIONID)	{
			notificationWindow.notifications[i].cancel();
			removeNotification(NOTIFICATIONID)
		}
	}
}

function removeNotification(NOTIFICATIONID)	{
	for (var i = 0; i < notificationWindow.notifications.length; i++)	{
		if (notificationWindow.notifications[i]["id"] == NOTIFICATIONID)	{
			notificationWindow.notifications.splice(i,1);
			i = notificationWindow.notifications.length;
		}
	}
}

tweetWorker.onmessage = function (evt) {
	var location = savedLocations.locations[parseInt(evt.data.data)];
	switch (evt.data.type) {
		case "get tweets":
			jQuery.getScript(tweetUrl);
			if (tweetChecker) clearTimeout(tweetChecker);
			tweetChecker = setTimeout(function () { tweetWorker.postMessage({ type: "get tweets" }); }, tweetCheckerInterval)
			break;
	}
	return (true);
}
		