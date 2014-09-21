var prefix = 'keep_prod';
  var launchGoogleKeep = function () {
    chrome.app.window.create(prefix + 'index.html', {
      type: 'shell',
      width: 360,
      height: 540,
      minWidth: 360,
      minHeight: 540,
      id: 'google-keep'
    });
  };

  var onNotificationsClicked = function(id) {
    // Only launch if no other windows exist.
    var windows = chrome.app.window.getAll();
    if (windows && windows.length == 0) {
      chrome.notifications.clear(id, function() {}); // Callback required.
      launchGoogleKeep();
    }
  };
  chrome.app.runtime.onLaunched.addListener(launchGoogleKeep);
  chrome.notifications.onClicked.addListener(onNotificationsClicked);
