chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('window.html',
        {
            'innerBounds': {
                'width': 1040,
                'height': 768,
                'minWidth': 1040,
                'minHeight': 600
            }
        },
        function(win) {
            var APPURL = "https://" + chrome.i18n.getMessage("@@extension_id") + ".chromiumapp.org/";
            var FACEBOOK_LOGIN_SUCCESS_URL = "http://www.any.do/facebook_proxy/login_success?redirect=" + encodeURIComponent(APPURL);
            var FACEBOOK_APP_ID = "218307504870310";
            var FACEBOOK_PERMISSIONS = "email,user_birthday,friends_birthday,user_relationships,read_friendlists,publish_stream,publish_actions,user_checkins,user_interests,user_religion_politics,user_events,friends_events,offline_access";
            var FACEBOOK_OAUTH_URL = "http://www.facebook.com/dialog/oauth?display=touch&scope=" + FACEBOOK_PERMISSIONS + "&client_id=" + FACEBOOK_APP_ID + "&redirect_uri=" + FACEBOOK_LOGIN_SUCCESS_URL;

            win.contentWindow.onload = function () {
                var webview = win.contentWindow.document.querySelector('#main');
                webview.addEventListener('newwindow', function (e) {
                      e.preventDefault();
                      // e.targetUrl contains the target URL of the original link click
                      // or window.open() call: use it to open your own window to it.
                      // Something to keep in mind: window.open() called from the
                      // app's event page is currently (Nov 2013) handicapped and buggy
                      // (e.g. it doesn't have access to local storage, including cookie
                      // store). You can try to use it here and below, but be prepare that
                      // it may sometimes produce bad results.
                      // chrome.app.window.create('');

                      if(e.name === 'facebook') {
                          chrome.identity.launchWebAuthFlow(
                              {
                                  url: FACEBOOK_OAUTH_URL,
                                  interactive: true
                              },
                              function(redirect_url) {
                                  var accessToken = redirect_url.split("token=")[1];

                                  webview.contentWindow.postMessage(
                                      {
                                          name: "facebookLogin",
                                          token: accessToken
                                      }
                                      , '*'
                                  );
                              }
                          );
                      } else if (e.name === 'google') {
                          chrome.identity.getAuthToken(
                              {
                                  "interactive": true
                              },
                              function(token) {
                                  webview.contentWindow.postMessage(
                                      {
                                          name: "googleLogin",
                                          token: token
                                      }
                                      , '*'
                                  );
                          });
                      } else if (e.name === 'mailto') {
                          window.open('mailto:feedback+chrome@any.do');
                      } else {
                          window.open(e.targetUrl);
                      }

                      e.window.discard();
                });
            };
        }
    );
});
