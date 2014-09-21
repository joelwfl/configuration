(function() {
  var body;

  body = $('body');

  this.fu = {
    open: function(resource, target) {
      var location;
      log('opening resource page from fu');
      location = window.location.toString();
      return chrome.extension.sendRequest({
        action: 'open',
        resource: resource,
        target: target,
        location: location
      }, function(response) {
        return window.location = response.url;
      });
    },
    openBookmarkByPath: function(location, target) {
      if (target == null) {
        target = 'tab';
      }
      log('opening bookmark from fu');
      return chrome.extension.sendRequest({
        action: 'openBookmarkByPath',
        location: location,
        target: target
      }, function(response) {
        return window.location = response.url;
      });
    },
    viewSource: function() {
      log('opening source page');
      return chrome.extension.sendRequest({
        action: 'viewSource'
      });
    },
    openNewTab: function() {
      log('opening new tag from fu');
      return chrome.extension.sendRequest({
        action: 'openNewTab'
      });
    },
    toggleKeyReference: function() {
      log('toggle key reference from fu');
      return cs.toggleKeyReference();
    },
    toggleKeyboardFu: function() {
      log('toggle keyboard-fu from fu');
      return cs.toggleKeyboardFu();
    },
    scrollDown: function(size, time) {
      if (size == null) {
        size = 100;
      }
      if (time == null) {
        time = 150;
      }
      log('scroll down from fu');
      return body.animate({
        scrollTop: body.scrollTop() + size
      }, time);
    },
    scrollUp: function(size, time) {
      if (size == null) {
        size = 100;
      }
      if (time == null) {
        time = 150;
      }
      log('scroll up from fu');
      return body.animate({
        scrollTop: body.scrollTop() - size
      }, time);
    },
    scrollRight: function(size, time) {
      if (size == null) {
        size = 70;
      }
      if (time == null) {
        time = 120;
      }
      log('scroll right from fu');
      return body.animate({
        scrollLeft: body.scrollLeft() + size
      }, time);
    },
    scrollLeft: function(size, time) {
      if (size == null) {
        size = 70;
      }
      if (time == null) {
        time = 120;
      }
      log('scroll left from fu');
      return body.animate({
        scrollLeft: body.scrollLeft() - size
      }, time);
    },
    scrollToTop: function(time) {
      if (time == null) {
        time = 150;
      }
      log('scroll to top from fu');
      return body.animate({
        scrollTop: 0
      }, time);
    },
    scrollToBottom: function(time) {
      if (time == null) {
        time = 150;
      }
      log('scroll to bottom from fu');
      return body.animate({
        scrollTop: body.height()
      }, time);
    },
    tabNext: function() {
      log('next tab from fu');
      return chrome.extension.sendRequest({
        action: 'tabSwitchBy',
        count: 1
      });
    },
    tabPrevious: function() {
      log('previous tab from fu');
      return chrome.extension.sendRequest({
        action: 'tabSwitchBy',
        count: -1
      });
    },
    tabRight: function() {
      log('move tab to right from fu');
      return chrome.extension.sendRequest({
        action: 'tabMoveBy',
        count: 1
      });
    },
    tabLeft: function() {
      log('move tab to left from fu');
      return chrome.extension.sendRequest({
        action: 'tabMoveBy',
        count: -1
      });
    },
    tabClose: function() {
      log('close tab from fu');
      return chrome.extension.sendRequest({
        action: 'tabClose'
      });
    },
    tabCloseOther: function() {
      log('close other tabs from fu');
      return chrome.extension.sendRequest({
        action: 'tabCloseOther'
      });
    },
    tabUndoClose: function() {
      log('undo close tab from fu');
      return chrome.extension.sendRequest({
        action: 'tabUndoClose'
      });
    }
  };

}).call(this);
