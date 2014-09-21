   function loadSession(session) {
		var loadByWindow = function(win, sessionWin) {
			chrome.tabs.getAllInWindow(win.id, function (tabs){
				if (tabs.length>1) {
				  for (var i=1;i<tabs.length;i++) {
					 chrome.tabs.remove(tabs[i].id)
				  }
				}
				var firstTabId = tabs[0].id
				var tabs = sessionWin.tabs
			
				if (tabs.length>0) {
					chrome.tabs.update(firstTabId, {
						url : tabs[0]
					}, null)
					for (var j=1;j<tabs.length;j++) {
						chrome.tabs.create({windowId : win.id, url: tabs[j]})
					}
				}
			})			
		}
		var windows = session.windows;
			chrome.windows.getAll({populate :false}, function (winList) {
				  
				  
				  var totalWins = winList.length;
				  if (winList.length>windows.length) {
					  for (var i=0;i<windows.length;i++) {
					        if (i==0) {
								loadByWindow(winList[i], windows[i], true);
							} else {
								loadByWindow(winList[i], windows[i]);
							}
					  }					  
						  
					  var c = 0;
					  var l = winList.length - windows.length;
					  totalWins = windows.length;
					  for (var i=windows.length;i<winList.length;i++) {
							chrome.windows.remove(winList[i].id)
					  }
				  } else if (winList.length<windows.length) {
					  for (var i=0;i<winList.length;i++) {
								loadByWindow(winList[i], windows[i]);
					  }	
					  var c = i;
					  for (var i=winList.length;i<windows.length;i++) {
						   chrome.windows.create({}, function (win) {
							   var interval = setTimeout(function() {
								   loadByWindow(win, windows[c]);
								   cfff++;
							   }, 500);
						   })
					  }							   


				  } else {
					  for (var i=0;i<windows.length;i++) {
					        if (i==0) {
								loadByWindow(winList[i], windows[i], true);
							} else {
								loadByWindow(winList[i], windows[i]);
							}
					  }	
				  }
			})			
   }

   function loadSessions() {

		var sessionText = localStorage["sessions"];
		if ((sessionText==null) || (sessionText=="null")) {
			return null;
		} else {
			var sessions = JSON.parse(sessionText);
			return sessions;
		}
   }

   function udpateSessions(sessions) {

		var sessionText = JSON.stringify(sessions, function (key, value) {
			return value;
		});
		localStorage["sessions"] = sessionText;
   } 
   function todayStr() {
	  var today=new Date()
	  return today.getMonth()+1+"/"+today.getDate()+"/"+(today.getYear() + 1900)
   }

   function saveSession(title, callback) {
		var sessionTitle = title
		var sessionID = 0;

		var session = {title:null, windows:new Array()};
		session.title = sessionTitle;
		session.date = todayStr();
		chrome.windows.getAll({populate :true}, function (winList) {
			var numOfTabs = 0;
  
			for (var i=0;i<winList.length;i++) {
				var win = winList[i];
				numOfTabs += winList[i].tabs.length;
				var tabList = new Array();
				for (var j=0;j<win.tabs.length;j++) {
					tabList.push(win.tabs[j].url);
				}
				
				session.windows.push({
					winID : win.id,
					tabs  : tabList
				});

				session.numOfTabs = numOfTabs;
			}

			var sessions = loadSessions();
			if (sessions==null) { 
			  sessions = { list : new Array()} 
			}
			sessions.list.push(session);
			var sessionText = JSON.stringify(sessions, function (key, value) {
				return value;
			});
			localStorage["sessions"] = sessionText;

			if (callback!=null) callback.apply(this)
		})
   }
  // localStorage["_new_"] = null;
   
   // Extension Version
   /*
	if ((localStorage["_new_"]!="false") && (localStorage["_new_"]!=false)) {
	   localStorage["_version_"] = "0.4" ;
	   localStorage["_new_"]     = false ;
	   var notification = webkitNotifications.createHTMLNotification(
		  'notification.html'
	   );
	   notification.show();
	} else {
	  localStorage["_version_"] = "0.4" ;
	}*/


