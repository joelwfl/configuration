(function() {
  var __slice = [].slice;

  this.log = function() {
    var args;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return chrome.extension.sendRequest({
      action: 'console',
      fn: 'info',
      args: args
    });
  };

  this.cs = {};

  jQuery(function($) {
    var checkAndPush, enableFu, executeAction, keyComboMap, keyExpiryCode, keyHandler, keyQueue, mask, maskVars, refElem, v, _i, _len;
    enableFu = true;
    keyComboMap = {};
    mask = {};
    maskVars = ['window', 'document', 'chrome', 'cs'];
    for (_i = 0, _len = maskVars.length; _i < _len; _i++) {
      v = maskVars[_i];
      mask[v] = void 0;
    }
    chrome.extension.sendRequest({
      action: 'getHotkeys'
    }, function(hotkeys) {
      var loc;
      log('got hotkeys');
      loc = window.location.toString();
      return $.each(hotkeys, function(id, keyData) {
        var allow;
        allow = false;
        return chrome.extension.sendRequest({
          action: 'getGlobalFilters'
        }, function(filters) {
          var allFilters, isNegativePattern, pat, re, _j, _len1;
          allFilters = keyData.filters.concat(filters);
          for (_j = 0, _len1 = allFilters.length; _j < _len1; _j++) {
            pat = allFilters[_j];
            isNegativePattern = pat[0] === '-';
            log('matching with pattern', pat);
            if (isNegativePattern) {
              pat = pat.slice(1);
            }
            re = new RegExp(globToRegex(pat));
            log('regex is', re);
            if (loc.match(re)) {
              allow = !isNegativePattern;
              break;
            }
          }
          if (!allow) {
            log('allow is false');
            return;
          }
          keyData.id = id;
          keyComboMap[keyData.keyc] = keyData;
          return log('combo map', keyData.keyc, keyData);
        });
      });
    });
    keyQueue = {
      q: '',
      display: $('<div id=keyboardFuQueue />').appendTo('body'),
      push: function(combo) {
        keyQueue.q += combo;
        return keyQueue.updateDisplay();
      },
      clear: function() {
        keyQueue.q = '';
        return keyQueue.updateDisplay();
      },
      updateDisplay: function() {
        if (keyQueue.q.length) {
          return keyQueue.display.text(keyQueue.q).addClass('active');
        } else {
          return keyQueue.display.removeClass('active');
        }
      }
    };
    keyHandler = function(e) {
      var combo, fuPopups;
      if (!enableFu) {
        return;
      }
      if (this !== e.target && (/textarea|select/i.test(e.target.nodeName) || /text|search|tel|url|email|password/i.test(e.target.type) || typeof $(e.target).attr('contenteditable') !== 'undefined')) {
        return;
      }
      if (e.which === 27) {
        if (keyQueue.q.length > 0) {
          keyQueue.clear();
          return;
        }
        fuPopups = $('div.fu-popup:visible');
        if (fuPopups.length > 0) {
          fuPopups.hide();
        }
        return;
      }
      combo = readKeyCombo(e);
      if (combo) {
        return checkAndPush(combo);
      }
    };
    document.addEventListener('keydown', keyHandler);
    document.addEventListener('keypress', keyHandler);
    executeAction = function(keyc) {
      return (new Function('with (this) { ' + keyComboMap[keyc].code + ' }')).call(mask);
    };
    keyExpiryCode = 0;
    checkAndPush = function(combo) {
      var isPrefix, keyData, keyc, totalCombo;
      log('checkAndPush', combo);
      totalCombo = keyQueue.q + combo;
      keyExpiryCode++;
      log('totalCombo', totalCombo);
      isPrefix = false;
      for (keyc in keyComboMap) {
        keyData = keyComboMap[keyc];
        if (keyc.length > totalCombo.length && keyc.slice(0, totalCombo.length) === totalCombo) {
          isPrefix = true;
          break;
        }
      }
      if (isPrefix) {
        keyQueue.push(combo);
        setTimeout((function(_keyExpiryCode) {
          return function() {
            if (keyExpiryCode !== _keyExpiryCode) {
              return;
            }
            if (keyQueue.q in keyComboMap) {
              executeAction(keyQueue.q);
            }
            keyQueue.clear();
            return log('emptied keyQueue');
          };
        })(keyExpiryCode), 2200);
      } else {
        if (totalCombo in keyComboMap) {
          log('executing', totalCombo);
          executeAction(totalCombo);
        }
        keyQueue.clear();
      }
      return log('key queue', keyQueue.q);
    };
    refElem = null;
    cs.toggleKeyReference = function() {
      var kdata, keyc, markup;
      if (refElem === null) {
        refElem = $('<div id=fuKeyRef class=fu-popup style=display:none />').appendTo('body');
        markup = '';
        for (keyc in keyComboMap) {
          kdata = keyComboMap[keyc];
          markup += "<div class=fu-key-item><span class=fu-refbox-desc>" + kdata.desc + "</span><code class=fu-refbox-keyc>" + (htmlentities(keyc)) + "</code></div>";
        }
        refElem.html(markup);
      }
      return refElem.toggle();
    };
    return cs.toggleKeyboardFu = function() {
      return enableFu = !enableFu;
    };
  });

}).call(this);
