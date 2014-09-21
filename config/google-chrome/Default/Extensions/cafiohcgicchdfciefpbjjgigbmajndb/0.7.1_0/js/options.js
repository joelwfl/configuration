(function() {
  var globalFilterBox, hotkeys, ieBox, keyBox, keyForm, keyFormControls, keyFormStatus, keyHandler, keyList, keycCapture, loadGlobalFilters, loadHotkeys, loadKeyForm, nextId, saveHotkeys;

  hotkeys = null;

  nextId = 1;

  keyList = $('#keyList');

  keyBox = $('#keyBox');

  keyForm = $('#keyForm');

  keyFormControls = $('#keyFormControls');

  keyFormStatus = keyFormControls.find('.status');

  loadHotkeys = function(selectedKeyId) {
    return chrome.extension.sendRequest({
      action: 'getHotkeys'
    }, function(_hotkeys) {
      hotkeys = _hotkeys;
      keyList.empty();
      return $.each(hotkeys, function(id, keyData) {
        var el;
        id = parseInt(id, 10);
        el = $("<a href=\"#\" class=\"hotkey-item" + (id === selectedKeyId ? ' selected' : '') + "\">\n    <code class=keyc></code><span class=desc></span>\n</a>").appendTo(keyList);
        el.data('key-id', id);
        el.data('key-data', keyData);
        el.children('.keyc').text(keyData.keyc);
        el.children('.desc').text(keyData.desc);
        if (nextId === id) {
          return nextId++;
        }
      });
    });
  };

  loadKeyForm = function(id) {
    var keyBoxMarkup, keyData;
    keyBoxMarkup = "<input type=hidden class=id-input value=\"" + (id || nextId) + "\" />\n<div><span class=title>Hotkey</span><span type=text class=\"keyc-display text\" data-keyc=\"\"></span>\n    <button class=keyc-capture-btn>Capture</button><button class=keyc-uncapture-btn style=display:none>Stop Capture</button><button class=keyc-clear-btn>Clear</button></div>\n<label><span class=title>Description</span><input type=text class=\"desc-input text\" /></label>\n<label><span class=title>Code to execute</span><textarea rows=10 class=\"code-input text\" /></label>\n<label><span class=title>Url filter (Global filters will be added to the end of this list)</span><textarea rows=7 class=\"filters-input text\" /> one pattern per line";
    keyForm.html(keyBoxMarkup);
    if (id) {
      keyData = hotkeys[id];
      keyForm.find('span.keyc-display').text(keyData.keyc);
      keyForm.find('input.desc-input').val(keyData.desc);
      keyForm.find('textarea.code-input').val(keyData.code);
      keyForm.find('textarea.filters-input').val(keyData.filters.join('\n'));
    }
    return keyBox.show().siblings('.box').hide();
  };

  keyList.delegate('a.hotkey-item', 'click', function(e) {
    var id, th;
    e.preventDefault();
    th = $(this);
    id = th.data('key-id');
    th.addClass('selected').siblings().removeClass('selected');
    return loadKeyForm(id);
  });

  $('#newKeyBtn').click(function(e) {
    e.preventDefault();
    keyList.find('a.selected').removeClass('selected');
    return loadKeyForm();
  });

  keycCapture = false;

  keyHandler = function(e) {
    if (!keycCapture) {
      return;
    }
    e.stopPropagation();
    console.info('capture', e);
    return keyForm.find('span.keyc-display').text(function(i, oldVal) {
      return oldVal + readKeyCombo(e, true);
    });
  };

  document.addEventListener('keydown', keyHandler);

  document.addEventListener('keypress', keyHandler);

  keyForm.delegate('button.keyc-clear-btn', 'click', function(e) {
    return keyForm.find('span.keyc-display').text('');
  });

  keyForm.delegate('button.keyc-capture-btn, button.keyc-uncapture-btn', 'click', function(e) {
    keycCapture = !keycCapture;
    keyForm.find('span.keyc-display').toggleClass('capturing');
    keyForm.find('input.text, textarea')[keycCapture ? 'attr' : 'removeAttr']('disabled', 1);
    return $(this).hide().siblings('button.keyc-capture-btn, button.keyc-uncapture-btn').show();
  });

  $('#saveKeyBtn').click(function(e) {
    var id;
    id = keyForm.find('input.id-input').val();
    if (!hotkeys[id]) {
      hotkeys[id] = {};
    }
    hotkeys[id].keyc = keyForm.find('span.keyc-display').text();
    hotkeys[id].desc = keyForm.find('input.desc-input').val();
    hotkeys[id].code = keyForm.find('textarea.code-input').val();
    hotkeys[id].filters = keyForm.find('textarea.filters-input').val().split('\n');
    return saveHotkeys();
  });

  $('#saveNewKeyBtn').click(function(e) {
    keyForm.find('input.id-input').val(nextId);
    return $('#saveKeyBtn').click();
  });

  $('#delKeyBtn').click(function(e) {
    var id;
    id = keyForm.find('input.id-input').val();
    delete hotkeys[id];
    return saveHotkeys();
  });

  saveHotkeys = function() {
    chrome.extension.sendRequest({
      action: 'setHotkeys',
      hotkeys: hotkeys
    }, function(response) {
      var msg;
      msg = response.ok ? 'Saved successfully' : 'Error saving. Please try again later.';
      return keyFormStatus.html(msg).delay(2000).fadeOut(1000);
    });
    return loadHotkeys(keyList.find('a.selected').data('key-id') || nextId);
  };

  loadHotkeys();

  loadGlobalFilters = function() {
    return chrome.extension.sendRequest({
      action: 'getGlobalFilters'
    }, function(filters) {
      return $('#globalFilterInput').val(filters.join('\n'));
    });
  };

  globalFilterBox = $('#globalFilterBox');

  $('#globalFiltersBtn').click(function(e) {
    loadGlobalFilters();
    return globalFilterBox.show().siblings('div.box').hide();
  });

  $('#globalFilterSaveBtn').click(function(e) {
    var th;
    th = $(this);
    return chrome.extension.sendRequest({
      action: 'setGlobalFilters',
      filters: $('#globalFilterInput').val().split('\n')
    }, function(response) {
      var msg;
      loadGlobalFilters();
      msg = response.ok ? '<span>Saved successfully.</span>' : '<span>Saving failed. Please try again later.</span>';
      return th.after(msg).next().delay(2000).fadeOut(1000);
    });
  });

  $('#bottomControls').delegate('a', 'click', function(e) {
    e.preventDefault();
    return keyList.find('a.selected').removeClass('selected');
  });

  $('a[target=_blank]').click(function(e) {
    return window.open(chrome.extension.getURL($(this).attr('href')));
  });

  ieBox = $('#ieBox');

  ieBox.delegate('.import-btn', 'click', function(e) {
    var th;
    th = $(this);
    return chrome.extension.sendRequest({
      action: 'importHotkeys',
      content: $('#importBox').val()
    }, function(response) {
      var msg;
      loadHotkeys();
      msg = response.ok ? '<span>Import successful.</span>' : '<span>Import failed. Please try again later.</span>';
      return th.after(msg).next().delay(2000).fadeOut(1000);
    });
  });

  $('#ieBtn').click(function(e) {
    chrome.extension.sendRequest({
      action: 'exportHotkeys'
    }, function(content) {
      return $('#exportBox').val(content);
    });
    return ieBox.show().siblings('div.box').hide();
  });

}).call(this);
