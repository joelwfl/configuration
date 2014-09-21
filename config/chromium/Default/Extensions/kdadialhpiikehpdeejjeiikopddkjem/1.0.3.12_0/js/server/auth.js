define(["jquery","underscore","constants","helpers","base64"],function(e,c,i,g,f){return{createUser:function(a,b,d,h,c,f){e.ajax({url:USER_URL,type:"post",dataType:"json",contentType:"application/json",xhrFields:{withCredentials:!0},crossDomain:!0,data:JSON.stringify({name:a,username:b,password:d,emails:[h],phoneNumbers:[]}),success:c,error:f})},remindMe:function(a,b,d){e.ajax({url:FORGOT_URL,type:"post",xhrFields:{withCredentials:!0},crossDomain:!0,data:{email:a},success:b,error:d})},logIn:function(a,
b,d,c){e.ajax({url:LOGIN_URL,type:"post",xhrFields:{withCredentials:!0},crossDomain:!0,data:{j_username:a,j_password:b,_spring_security_remember_me:"on"},success:function(a){this.activeUser=a;d()}.bind(this),error:function(a){0==a.status?d(a):c(a)}})},getFacebookAccessToken:function(){return window.storage.getItem("access_token")},getGoogleAccessToken:function(){chrome.identity.getAuthToken({interactive:!0},function(a){this.logInWithGoogle(a,function(){chrome.runtime.sendMessage({action:"googleConnectComplete"})})}.bind(this))},
logInWithGoogle:function(a,b,d){e.ajax({url:GOOGLE_URL,type:"post",xhrFields:{withCredentials:!0},crossDomain:!0,data:{access_token:a,refresh_token:"",_spring_security_remember_me:"on"},success:c.bind(function(a){console.log(a);"function"==typeof b&&b()},this),error:c.bind(function(){console.log("error");"function"==typeof d&&d()},this)})},saveFacebookAccessToken:function(a){window.storage.setItem("username",a);window.storage.setItem("access_token",a)},logInWithFacebook:function(a,b,d){e.ajax({url:FACEBOOK_URL,
type:"post",xhrFields:{withCredentials:!0},crossDomain:!0,data:{access_token:a,_spring_security_remember_me:"on"},success:c.bind(function(a){b(a)},this),error:c.bind(function(a){0==a.status?b(a):d(a)},this)})},logOut:function(){"undefined"!=typeof chrome&&chrome.runtime.sendMessage({action:"logOut"},function(){});console.log("logging out...");e.ajax({url:LOGOUT_URL,type:"post",xhrFields:{withCredentials:!0},crossDomain:!0,complete:c.bind(function(){this.removeAllCookies();var a=g.getStorageItemsByKeyStart(["gmail_",
"gmail-tour","view_","calendar_day"]);window.storage.clear();c.each(a,function(a,d){storage.setItem(d,a)});document.location.href=""},this)})},removeAllCookies:function(){var a=SERVER_API_URL.replace("http://","");"undefined"!=typeof chrome?chrome.cookies.getAll({domain:a},function(a){console.log("removing cookies:"+a);for(var d in a)cookie=a[d],chrome.cookies.remove({url:"http"+(cookie.secure?"s":"")+"://"+cookie.domain+cookie.path,name:cookie.name})}):console.error("implement remove cookies")},
logInUsingStoredCredentials:function(a,b){if(window.storage.getItem("access_token"))this.logInWithFacebook(this.getFacebookAccessToken(),a,b);else if(window.storage.getItem("username")){var d=window.storage.getItem("username"),c=f.decodeBase64(window.storage.getItem("password"));this.logIn(d,c,a,b)}else b()},credentialsSaved:function(){return null!=window.storage.getItem("username")||null!=window.storage.getItem("access_token")},saveCredentials:function(a,b){window.storage.setItem("username",a);window.storage.setItem("password",
f.encodeBase64(b))},isLoggedIn:function(a,b){e.ajax({url:FACEBOOK_URL,type:"get",xhrFields:{withCredentials:!0},crossDomain:!0,success:c.bind(function(){a()},this),error:c.bind(function(){b()},this)})},tryLogIn:function(a,b){"true"===storage.getItem("forceLogout")?this.logOut():e.ajax({url:ME_URL,type:"get",xhrFields:{withCredentials:!0},crossDomain:!0,success:c.bind(function(b){console.log("got success when trying to get /me",b);this.activeUser=b;a(b)},this),error:c.bind(function(){console.log("Error handler reached!");
this.credentialsSaved()?(console.log("trying to do an automatic log-in "),this.logInUsingStoredCredentials(function(){a()},c.bind(function(){this.logOut()},this))):(console.log("Not logged in callback!"),b())},this)})},getUserName:function(){return window.storage.getItem("username")},facebookConnect:function(a,b){this.getFacebookAccessToken()?this.logInWithFacebook(this.getFacebookAccessToken(),a,b):"undefined"!=typeof chrome&&this.facebookConnectChrome(a,b)},facebookConnectChrome:function(){window.open(FACEBOOK_OAUTH_URL,
"facebook","width=640,height=320")}}});