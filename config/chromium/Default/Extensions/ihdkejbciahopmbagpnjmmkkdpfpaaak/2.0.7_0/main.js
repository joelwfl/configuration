// Launched
chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    id: 'com.weatherbug.weatherwindow',
    frame: 'none',
    width: 1024,
    height: 768,
    minWidth: 975,
    minHeight: 700
  });
});