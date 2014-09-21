(function() {

  jQuery(function($) {
    var actions, allClosedTabs, allOpenTabs, keyStore, tabSwitchBy;
    chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
      return actions[request.action](request, sender, sendResponse);
    });
    actions = {
      alert: function(request, sender, sendResponse) {
        console.info('alert request made');
        return alert(request.message);
      },
      console: function(request) {
        return console[request.fn].apply(console, request.args);
      },
      getHotkeys: function(request, sender, sendResponse) {
        console.info('hotkeys get request made');
        return sendResponse(keyStore.load(request.urlsAsGlobs));
      },
      setHotkeys: function(request, sender, sendResponse) {
        console.info('hotkeys save request made');
        keyStore.dump(request.hotkeys);
        return sendResponse({
          ok: true
        });
      },
      importHotkeys: function(request, sender, sendResponse) {
        console.info('hotkeys import request made');
        keyStore["import"](request.content);
        return sendResponse({
          ok: true
        });
      },
      exportHotkeys: function(request, sender, sendResponse) {
        console.info('hotkeys export request made');
        return sendResponse(keyStore["export"]());
      },
      getGlobalFilters: function(request, sender, sendResponse) {
        console.info('global fitlers set request made');
        return sendResponse(keyStore.loadGlobalFilters());
      },
      setGlobalFilters: function(request, sender, sendResponse) {
        console.info('global fitlers get request made');
        keyStore.dumpGlobalFilters(request.filters);
        return sendResponse({
          ok: true
        });
      },
      open: function(request, sender, sendResponse) {
        var location, resource, target, url;
        resource = request.resource, target = request.target, location = request.location;
        url = (function() {
          switch (resource) {
            case '!parent':
              target || (target = 'here');
              return location.replace(/\/[^\/]+\/?$/, '');
            case '!fu-options':
              return chrome.extension.getURL('options.html');
            case '!extensions':
              return 'chrome://extensions';
            case '!chrome-options':
              return 'chrome://settings';
            default:
              return resource;
          }
        })();
        if (target === 'here') {
          return sendResponse({
            url: url
          });
        } else if (target === 'window') {
          return chrome.windows.create({
            url: url
          });
        } else {
          return chrome.tabs.create({
            url: url
          });
        }
      },
      openBookmark: function(request, sender, sendResponse) {
        console.info('openBookmark request made');
        return chrome.bookmarks.search(request.name, function(marks) {
          var mark, url, _i, _len;
          url = null;
          for (_i = 0, _len = marks.length; _i < _len; _i++) {
            mark = marks[_i];
            if (mark.title === request.name) {
              url = mark.url;
              break;
            }
          }
          if (url != null) {
            return sendResponse({
              url: url
            });
          } else {
            return alert("The bookmark '" + request.name + "' does not exist or does not have a valid url");
          }
        });
      },
      openBookmarkByPath: function(request, sender, sendResponse) {
        var location, pathItems, target;
        console.info('openBookmarkByPath request made');
        location = request.location, target = request.target;
        pathItems = location.split('/');
        console.info('pathItems is', pathItems);
        return chrome.bookmarks.getTree(function(nodes) {
          var currentNodeList, found, item, n, nodeToOpen, url, _i, _len;
          currentNodeList = nodes;
          nodeToOpen = null;
          while (pathItems.length) {
            item = pathItems.shift();
            found = false;
            for (_i = 0, _len = currentNodeList.length; _i < _len; _i++) {
              n = currentNodeList[_i];
              if (n.title === item) {
                found = true;
                if (pathItems.length === 0) {
                  nodeToOpen = n;
                } else {
                  currentNodeList = n.children;
                  break;
                }
              }
            }
            if (!found) {
              alert("The bookmark '" + request.name + "' does not exist or does not have a valid url");
            }
          }
          if (nodeToOpen == null) {
            alert("Bookmark '" + request.name + "' could not be found");
            return;
          }
          url = nodeToOpen.url;
          if (url.slice(0, 11) === 'javascript:') {
            return chrome.tabs.executeScript(null, {
              code: unescape(url.slice(11))
            });
          } else if (target === 'here') {
            return sendResponse({
              url: url
            });
          } else if (target === 'window') {
            return chrome.windows.create({
              url: url
            });
          } else {
            return chrome.tabs.create({
              url: url
            });
          }
        });
      },
      openNewTab: function(request, sender, sendResponse) {
        return chrome.tabs.create({});
      },
      viewSource: function() {
        var sourceUrl;
        sourceUrl = location.toString().replace(new RegExp('^' + location.protocol + '//'), 'view-source:');
        console.info('source url', sourceUrl);
        return chrome.tabs.getSelected(null, function(tab) {
          return chrome.tabs.create({
            index: tab.index + 1,
            url: sourceUrl
          });
        });
      },
      tabSwitchBy: function(request, sender, sendResponse) {
        console.info('tabSwitch request made');
        return tabSwitchBy(request.count);
      },
      tabMoveBy: function(request, sender, sendResponse) {
        console.info('tabMove request made');
        return chrome.tabs.getSelected(null, function(tab) {
          return chrome.tabs.move(tab.id, {
            index: tab.index + request.count
          });
        });
      },
      tabClose: function(request, sender, sendResponse) {
        console.info('tabClose request made');
        return chrome.tabs.getSelected(null, function(tab) {
          return chrome.tabs.remove(tab.id);
        });
      },
      tabCloseOther: function(request, sender, sendResponse) {
        console.info('tabCloseOther request made');
        return chrome.tabs.getSelected(null, function(tab) {
          return chrome.tabs.getAllInWindow(tab.windowId, function(tabs) {
            var t, tabids;
            tabids = (function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = tabs.length; _i < _len; _i++) {
                t = tabs[_i];
                if (t.id !== tab.id) {
                  _results.push(t.id);
                }
              }
              return _results;
            })();
            return chrome.tabs.remove(tabids);
          });
        });
      },
      tabUndoClose: function(request, sender, sendResponse) {
        var index, url, _ref;
        console.info('tabUndoClose request made');
        if (allClosedTabs.length) {
          _ref = allClosedTabs.pop(), url = _ref.url, index = _ref.index;
          return chrome.tabs.create({
            url: url,
            index: index
          });
        }
      }
    };
    keyStore = {
      defaultHotkeys: {
        1: {
          keyc: 'j',
          desc: 'Scroll down',
          code: 'fu.scrollDown()',
          filters: []
        },
        2: {
          keyc: 'k',
          desc: 'Scroll up',
          code: 'fu.scrollUp()',
          filters: []
        },
        3: {
          keyc: 'h',
          desc: 'Scroll left',
          code: 'fu.scrollLeft()',
          filters: []
        },
        4: {
          keyc: 'l',
          desc: 'Scroll right',
          code: 'fu.scrollRight()',
          filters: []
        },
        5: {
          keyc: 'gg',
          desc: 'Go to top',
          code: 'fu.scrollToTop()',
          filters: []
        },
        6: {
          keyc: 'G',
          desc: 'Go to bottom',
          code: 'fu.scrollToBottom()',
          filters: []
        },
        7: {
          keyc: 'gj',
          desc: 'Scroll down big',
          code: 'fu.scrollDown(370)',
          filters: []
        },
        8: {
          keyc: 'gk',
          desc: 'Scroll up big',
          code: 'fu.scrollUp(370)',
          filters: []
        },
        9: {
          keyc: 'L',
          desc: 'Next tab',
          code: 'fu.tabNext()',
          filters: []
        },
        10: {
          keyc: 'H',
          desc: 'Previous tab',
          code: 'fu.tabPrevious()',
          filters: []
        },
        11: {
          keyc: 'N',
          desc: 'Move tab left',
          code: 'fu.tabLeft()',
          filters: []
        },
        12: {
          keyc: 'M',
          desc: 'Move tab right',
          code: 'fu.tabRight()',
          filters: []
        },
        13: {
          keyc: '<C-x>',
          desc: 'Close tab',
          code: 'fu.tabClose()',
          filters: []
        },
        14: {
          keyc: 'u',
          desc: 'Undo close tab',
          code: 'fu.tabUndoClose()',
          filters: []
        },
        15: {
          keyc: 'go',
          desc: 'Open Keyboard-fu options page',
          code: 'fu.open("!fu-options")',
          filters: []
        },
        16: {
          keyc: 'o',
          desc: 'Go back',
          code: 'history.back()',
          filters: []
        },
        17: {
          keyc: 'i',
          desc: 'Go forward',
          code: 'history.forward()',
          filters: []
        },
        18: {
          keyc: 'gu',
          desc: 'Go up in the url',
          code: 'fu.open("!parent")',
          filters: []
        },
        19: {
          keyc: 'gs',
          desc: 'View source of current page',
          code: 'fu.viewSource()',
          filters: []
        },
        20: {
          keyc: 'gf',
          desc: 'Toggle Keyboard-fu in current tab',
          code: 'fu.toggleKeyboardFu()',
          filters: []
        },
        21: {
          keyc: '?',
          desc: 'Toggle help box',
          code: 'fu.toggleKeyReference()',
          filters: ['http:#*.google.com/*']
        }
      },
      load: function() {
        var hotkeys, rawHotkeys, rh, _i, _len;
        if (!localStorage.hotkeys) {
          keyStore.dump(keyStore.defaultHotkeys);
        }
        rawHotkeys = JSON.parse(localStorage.hotkeys);
        hotkeys = {};
        for (_i = 0, _len = rawHotkeys.length; _i < _len; _i++) {
          rh = rawHotkeys[_i];
          hotkeys[rh[0]] = {
            keyc: rh[1],
            desc: rh[2],
            code: rh[3],
            filters: rh[4]
          };
        }
        return hotkeys;
      },
      dump: function(hotkeys) {
        var rawHotkeys;
        rawHotkeys = [];
        $.each(hotkeys, function(i, keyData) {
          return rawHotkeys.push([i, keyData.keyc, keyData.desc, keyData.code, keyData.filters]);
        });
        return localStorage.hotkeys = JSON.stringify(rawHotkeys);
      },
      "import": function(content) {
        var importObj, key, val, _results;
        importObj = JSON.parse(content);
        localStorage.clear();
        _results = [];
        for (key in importObj) {
          val = importObj[key];
          _results.push(localStorage[key] = val);
        }
        return _results;
      },
      "export": function() {
        return JSON.stringify(localStorage);
      },
      defaultGlobalFilters: ['-https:#mail.google.com/*', '-https:#reader.google.com/*', '*'],
      loadGlobalFilters: function() {
        if (!localStorage.globalFilters) {
          keyStore.dumpGlobalFilters(keyStore.defaultGlobalFilters);
        }
        return JSON.parse(localStorage.globalFilters);
      },
      dumpGlobalFilters: function(filters) {
        return localStorage.globalFilters = JSON.stringify(filters);
      }
    };
    tabSwitchBy = function(count) {
      return chrome.tabs.getSelected(null, function(tab) {
        var newIndex;
        newIndex = tab.index + count;
        return chrome.tabs.getAllInWindow(null, function(tabs) {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = tabs.length; _i < _len; _i++) {
            tab = tabs[_i];
            if (tab.index === newIndex) {
              chrome.tabs.update(tab.id, {
                selected: true
              });
              break;
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        });
      });
    };
    allOpenTabs = {};
    allClosedTabs = [];
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      if (tab && changeInfo.status === 'complete') {
        return allOpenTabs[tabId] = tab;
      }
    });
    chrome.tabs.onRemoved.addListener(function(tabId) {
      var tabInfo;
      if (!(tabId in allOpenTabs)) {
        return;
      }
      tabInfo = allOpenTabs[tabId];
      delete allOpenTabs[tabId];
      return allClosedTabs.push(tabInfo);
    });
    return chrome.tabs.getAllInWindow(null, function(tabs) {
      var t, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = tabs.length; _i < _len; _i++) {
        t = tabs[_i];
        _results.push(allOpenTabs[t.id] = t);
      }
      return _results;
    });
  });

}).call(this);
