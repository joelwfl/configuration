  var b = chrome.extension.getBackgroundPage()
  sessions = b.loadSessions();
  var selectedEngine = -1;
  var saveSessionTitle;
  var listTitle;

  function onLoad() {
      if (sessions!=null) {
		  createSessions();
	  }
	  chrome.tabs.getSelected(null, function (tab) {
			if (tab.title!=null) {
				document.getElementById("saveSessionText").value = tab.title;
			}
	  })
	  if ((sessions==null) || (sessions.list.length==0)) {
		 document.getElementById("list").style.display = 'none';
	  }

	  setBoxesTitlePosition();
  }

  function setBoxesTitlePosition() {
	  var _body = document.getElementsByTagName("body")[0];
	   
	  if (sessions!=null) {
		  if ((listTitle==null) && (sessions.list.length>0)) {
			  listTitle = document.createElement("div");
			  listTitle.setAttribute("class", "box-title");
			  listTitle.textContent = "Sessions List";
			  _body.appendChild(listTitle);
		  }
	  }
	  if (saveSessionTitle==null) {
		  saveSessionTitle = document.createElement("div");
		  saveSessionTitle.setAttribute("class", "box-title");
		  saveSessionTitle.textContent = "Save Session";
		  _body.appendChild(saveSessionTitle);
	  }
	  if (listTitle) {
		  listTitle.style.top = (document.getElementById("list").offsetTop - 7) + "px"
		  listTitle.style.left = (document.getElementById("list").offsetLeft + 12) + "px"
	  }
	  if (saveSessionTitle) {
		  saveSessionTitle.style.top = (document.getElementById("save-session-box").offsetTop - 7) + "px"
		  saveSessionTitle.style.left = (document.getElementById("save-session-box").offsetLeft + 12) + "px"
	  }
  }

  function loadSession(index) {
      b.loadSession(sessions.list[index]);
  }


  function cancelRemove(index) {
	  var row = document.getElementById("row-" + index);

	  row._title.innerHTML = sessions.list[index].title;
	  row.remove.style.display = 'block';
	  row.rename.style.display = 'block';
	  row._open.style.display = 'block';
	  row.sep.style.display = 'block';
	  row.sep2.style.display = 'block';

	  row.removeChild(row.no);
	  row.removeChild(row.yes);
  }
  function startRemove(index) {
	  var row = document.getElementById("row-" + index);
	  row._title.innerHTML = "<font style='color:#d3192b'>Are you sure you want to remove this session?</font>";
	
	  row.remove.style.display = 'none';
	  row.rename.style.display = 'none';
	  row._open.style.display = 'none';
	  row.sep.style.display = 'none';
	  row.sep2.style.display = 'none';

	  row.appendChild(row.no);
	  row.appendChild(row.yes);
  }
  function removeSession(index) {

	  sessions.list.splice(index, 1);
	  if (sessions.list.length==0) {
		  document.getElementById("list").style.display = 'none';
		  if (listTitle) listTitle.style.display = 'none';
	  }
	  
	  b.udpateSessions(sessions)
      createSessions();
	  setBoxesTitlePosition();
      if (selectedEngine==index) {
	    selectedEngine = -1;
	  }
  }

  function saveSession() {
		var title = document.getElementById("saveSessionText").value;
		var backgroundPage = chrome.extension.getBackgroundPage();
		backgroundPage.saveSession(title, function() {
			sessions = b.loadSessions();
			if (sessions!=null) {
				var list = document.getElementById("list");
				list.style.display = 'block';
			    if (listTitle) listTitle.style.display = 'block';
				list.appendChild(createRow(sessions.list.length-1));
				setBoxesTitlePosition();
			}
		});	
		document.getElementById("saveBtn").disabled = true;
		document.getElementById("saveSessionText").disabled = true;
  }

  function finishRename(index) {
  		var row = document.getElementById("row-" + index);
		sessions.list[index].title = row.renameTextBox.value;
		row._title.innerHTML =  row.renameTextBox.value;
		b.udpateSessions(sessions);
		setBoxesTitlePosition();
		row.inRenameMode = false;
  }
  function openRename(index) {
		var row = document.getElementById("row-" + index);
		row._title.innerHTML = "";
		row.inRenameMode = true;
		var renameTextBox = document.createElement("input");
		renameTextBox.setAttribute("class", "rowRenameText");
		renameTextBox.setAttribute("type", "text");
		renameTextBox.addEventListener("keyup", function(e) {
			if (e.keyCode==13) {
				finishRename(index);
			}
		},false);
		renameTextBox.value = sessions.list[index].title;
		row.renameTextBox = renameTextBox;
		row._title.appendChild(renameTextBox);
		renameTextBox.focus();
		setBoxesTitlePosition();
  }

  function setRow(row, i) {
          row.innerHTML = "";
		  row.setAttribute("class", "row");

		  var item = sessions.list[i];
		 

		  var title = document.createElement("div");
		  title.setAttribute("class", "title");
		  var titleText = item.title;
		  if (titleText.length>40) titleText = titleText.substring(0, 40)+"..."
		  title.textContent = titleText;
		  row._title = title;
		  var num = document.createElement("div");
		  num.setAttribute("class", "num");
		  num.textContent = "(" + item.numOfTabs + "/" + item.windows.length + ") - " + item.date;

		  var sep = document.createElement("div");
		  sep.setAttribute("class", "separator");
		  sep.textContent = "-";
		  row.sep = sep;

		  var sep2 = document.createElement("div");
		  sep2.setAttribute("class", "separator");
		  sep2.textContent = "-";
		  row.sep2 = sep2;


		  row.setAttribute("class", "row");

		  var _open = document.createElement("a");
		  //_open.setAttribute("class", "_open");
		  _open.setAttribute("href", "#");
		  _open.setAttribute("onclick", "return false;");
		  _open.textContent = "Open";
		  _open.index = i;
		  row._open = _open;
		  _open.addEventListener("click", function(e) {
			 loadSession(e.currentTarget.index);
		  },false);

		  var rename = document.createElement("a");
		  rename.setAttribute("class", "link");
		  rename.setAttribute("href", "#");
		  rename.setAttribute("onClick", "return;");
		  rename.textContent = "Rename";
		  rename.index = i;
		  row.rename = rename;
		  rename.addEventListener("click", function(e) {
			 openRename(e.currentTarget.index);
			 e.stopPropagation();
			 e.preventDefault();
		  },false);

		  var remove = document.createElement("a");
		  remove.setAttribute("class", "_open");
		  remove.setAttribute("href", "#");
		  remove.setAttribute("onClick", "return false;");
		  remove.textContent = "Remove";
		  remove.style.marginRight = "5px";
		  remove.index = i;
		  row.remove = remove;
		  remove.addEventListener("click", function(e) {
			 startRemove(e.currentTarget.index);
			 e.stopPropagation();
			 e.preventDefault();
		  },false);

		  var yes = document.createElement("a");
		  yes.setAttribute("class", "_open");
		  yes.setAttribute("href", "#");
		  yes.setAttribute("onClick", "return false;");
		  yes.textContent = "Yes";
		  yes.style.marginRight = "5px";
		  yes.index = i;
		  yes.addEventListener("click", function(e) {
			 removeSession(e.currentTarget.index);
			 e.stopPropagation();
			 e.preventDefault();
		  },false);
		  var no = document.createElement("a");
		  no.setAttribute("class", "_open");
		  no.setAttribute("href", "#");
		  no.setAttribute("onClick", "return false;");
		  no.textContent = "No";
		  no.style.marginRight = "5px";
		  no.index = i;
		  no.addEventListener("click", function(e) {
			 cancelRemove(e.currentTarget.index);
			 e.stopPropagation();
			 e.preventDefault();
		  },false);
		  row.no = no;
		  row.yes = yes;

		  row.addEventListener("click", function(e) {
		     if (e.currentTarget.inRenameMode==true) {
			    if (e.target.className!="rowRenameText") {
					finishRename(e.currentTarget.index);
				}
			 }
		  },false);

		  row.appendChild(title);
		  row.appendChild(num);
		  row.appendChild(remove);
		  row.appendChild(sep);
		  row.appendChild(rename);
		  row.appendChild(sep2);
		  row.appendChild(_open);
  }

  function createRow(i) {
	  var row = document.createElement("div");
	  row.setAttribute("id", "row-" + i);
	  row.index = i;
	  setRow(row, i);
	  return row;
  }

  function createSessions() {
     var list = document.getElementById("list");
	 list.innerHTML = "";
	 for (var i=0;i<sessions.list.length;i++) {
		  list.appendChild(createRow(i));
	 }
  }
  var b = chrome.extension.getBackgroundPage()
  sessions = b.loadSessions();
  var selectedEngine = -1;
  var saveSessionTitle;
  var listTitle;

  function onLoad() {
      if (sessions!=null) {
		  createSessions();
	  }
	  chrome.tabs.getSelected(null, function (tab) {
			if (tab.title!=null) {
				document.getElementById("saveSessionText").value = tab.title;
			}
	  })
	  if ((sessions==null) || (sessions.list.length==0)) {
		 document.getElementById("list").style.display = 'none';
	  }

	  setBoxesTitlePosition();
	  document.querySelector('#saveBtn').addEventListener('click',saveSession);
  }

  function setBoxesTitlePosition() {
	  var _body = document.getElementsByTagName("body")[0];
	   
	  if (sessions!=null) {
		  if ((listTitle==null) && (sessions.list.length>0)) {
			  listTitle = document.createElement("div");
			  listTitle.setAttribute("class", "box-title");
			  listTitle.textContent = "Sessions List";
			  _body.appendChild(listTitle);
		  }
	  }
	  if (saveSessionTitle==null) {
		  saveSessionTitle = document.createElement("div");
		  saveSessionTitle.setAttribute("class", "box-title");
		  saveSessionTitle.textContent = "Save Session";
		  _body.appendChild(saveSessionTitle);
	  }
	  if (listTitle) {
		  listTitle.style.top = (document.getElementById("list").offsetTop - 7) + "px"
		  listTitle.style.left = (document.getElementById("list").offsetLeft + 12) + "px"
	  }
	  if (saveSessionTitle) {
		  saveSessionTitle.style.top = (document.getElementById("save-session-box").offsetTop - 7) + "px"
		  saveSessionTitle.style.left = (document.getElementById("save-session-box").offsetLeft + 12) + "px"
	  }
  }

  function loadSession(index) {
      b.loadSession(sessions.list[index]);
  }


  function cancelRemove(index) {
	  var row = document.getElementById("row-" + index);

	  row._title.innerHTML = sessions.list[index].title;
	  row.remove.style.display = 'block';
	  row.rename.style.display = 'block';
	  row._open.style.display = 'block';
	  row.sep.style.display = 'block';
	  row.sep2.style.display = 'block';

	  row.removeChild(row.no);
	  row.removeChild(row.yes);
  }
  function startRemove(index) {
	  var row = document.getElementById("row-" + index);
	  row._title.innerHTML = "<font style='color:#d3192b'>Are you sure you want to remove this session?</font>";
	
	  row.remove.style.display = 'none';
	  row.rename.style.display = 'none';
	  row._open.style.display = 'none';
	  row.sep.style.display = 'none';
	  row.sep2.style.display = 'none';

	  row.appendChild(row.no);
	  row.appendChild(row.yes);
  }
  function removeSession(index) {

	  sessions.list.splice(index, 1);
	  if (sessions.list.length==0) {
		  document.getElementById("list").style.display = 'none';
		  if (listTitle) listTitle.style.display = 'none';
	  }
	  
	  b.udpateSessions(sessions)
      createSessions();
	  setBoxesTitlePosition();
      if (selectedEngine==index) {
	    selectedEngine = -1;
	  }
  }

  function saveSession() {
		var title = document.getElementById("saveSessionText").value;
		var backgroundPage = chrome.extension.getBackgroundPage();
		backgroundPage.saveSession(title, function() {
			sessions = b.loadSessions();
			if (sessions!=null) {
				var list = document.getElementById("list");
				list.style.display = 'block';
			    if (listTitle) listTitle.style.display = 'block';
				list.appendChild(createRow(sessions.list.length-1));
				setBoxesTitlePosition();
			}
		});	
		document.getElementById("saveBtn").disabled = true;
		document.getElementById("saveSessionText").disabled = true;
  }

  function finishRename(index) {
  		var row = document.getElementById("row-" + index);
		sessions.list[index].title = row.renameTextBox.value;
		row._title.innerHTML =  row.renameTextBox.value;
		b.udpateSessions(sessions);
		setBoxesTitlePosition();
		row.inRenameMode = false;
  }
  function openRename(index) {
		var row = document.getElementById("row-" + index);
		row._title.innerHTML = "";
		row.inRenameMode = true;
		var renameTextBox = document.createElement("input");
		renameTextBox.setAttribute("class", "rowRenameText");
		renameTextBox.setAttribute("type", "text");
		renameTextBox.addEventListener("keyup", function(e) {
			if (e.keyCode==13) {
				finishRename(index);
			}
		},false);
		renameTextBox.value = sessions.list[index].title;
		row.renameTextBox = renameTextBox;
		row._title.appendChild(renameTextBox);
		renameTextBox.focus();
		setBoxesTitlePosition();
  }

  function setRow(row, i) {
          row.innerHTML = "";
		  row.setAttribute("class", "row");

		  var item = sessions.list[i];
		 

		  var title = document.createElement("div");
		  title.setAttribute("class", "title");
		  var titleText = item.title;
		  if (titleText.length>40) titleText = titleText.substring(0, 40)+"..."
		  title.textContent = titleText;
		  row._title = title;
		  var num = document.createElement("div");
		  num.setAttribute("class", "num");
		  num.textContent = "(" + item.numOfTabs + "/" + item.windows.length + ") - " + item.date;

		  var sep = document.createElement("div");
		  sep.setAttribute("class", "separator");
		  sep.textContent = "-";
		  row.sep = sep;

		  var sep2 = document.createElement("div");
		  sep2.setAttribute("class", "separator");
		  sep2.textContent = "-";
		  row.sep2 = sep2;


		  row.setAttribute("class", "row");

		  var _open = document.createElement("a");
		  //_open.setAttribute("class", "_open");
		  _open.setAttribute("href", "#");
		  _open.setAttribute("onclick", "return false;");
		  _open.textContent = "Open";
		  _open.index = i;
		  row._open = _open;
		  _open.addEventListener("click", function(e) {
			 loadSession(e.currentTarget.index);
		  },false);

		  var rename = document.createElement("a");
		  rename.setAttribute("class", "link");
		  rename.setAttribute("href", "#");
		  rename.setAttribute("onClick", "return;");
		  rename.textContent = "Rename";
		  rename.index = i;
		  row.rename = rename;
		  rename.addEventListener("click", function(e) {
			 openRename(e.currentTarget.index);
			 e.stopPropagation();
			 e.preventDefault();
		  },false);

		  var remove = document.createElement("a");
		  remove.setAttribute("class", "_open");
		  remove.setAttribute("href", "#");
		  remove.setAttribute("onClick", "return false;");
		  remove.textContent = "Remove";
		  remove.style.marginRight = "5px";
		  remove.index = i;
		  row.remove = remove;
		  remove.addEventListener("click", function(e) {
			 startRemove(e.currentTarget.index);
			 e.stopPropagation();
			 e.preventDefault();
		  },false);

		  var yes = document.createElement("a");
		  yes.setAttribute("class", "_open");
		  yes.setAttribute("href", "#");
		  yes.setAttribute("onClick", "return false;");
		  yes.textContent = "Yes";
		  yes.style.marginRight = "5px";
		  yes.index = i;
		  yes.addEventListener("click", function(e) {
			 removeSession(e.currentTarget.index);
			 e.stopPropagation();
			 e.preventDefault();
		  },false);
		  var no = document.createElement("a");
		  no.setAttribute("class", "_open");
		  no.setAttribute("href", "#");
		  no.setAttribute("onClick", "return false;");
		  no.textContent = "No";
		  no.style.marginRight = "5px";
		  no.index = i;
		  no.addEventListener("click", function(e) {
			 cancelRemove(e.currentTarget.index);
			 e.stopPropagation();
			 e.preventDefault();
		  },false);
		  row.no = no;
		  row.yes = yes;

		  row.addEventListener("click", function(e) {
		     if (e.currentTarget.inRenameMode==true) {
			    if (e.target.className!="rowRenameText") {
					finishRename(e.currentTarget.index);
				}
			 }
		  },false);

		  row.appendChild(title);
		  row.appendChild(num);
		  row.appendChild(remove);
		  row.appendChild(sep);
		  row.appendChild(rename);
		  row.appendChild(sep2);
		  row.appendChild(_open);
  }

  function createRow(i) {
	  var row = document.createElement("div");
	  row.setAttribute("id", "row-" + i);
	  row.index = i;
	  setRow(row, i);
	  return row;
  }

  function createSessions() {
     var list = document.getElementById("list");
	 list.innerHTML = "";
	 for (var i=0;i<sessions.list.length;i++) {
		  list.appendChild(createRow(i));
	 }
  }
window.onload = onLoad;