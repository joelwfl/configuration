// Generated by CoffeeScript 1.6.3
var FeedItem, FeedSite, Reader, create_feed_array, create_sample_feed, get_first_image, get_icon, load_rss_feed, save_model_test, sync_object;

sync_object = {
  "GDrive": {
    "key": "64840406425-l292ah0o3tt1idacjdru6lrib3ljdkl7.apps.googleusercontent.com",
    "scope": "https://www.googleapis.com/auth/drive",
    "app_name": "jellyreader"
  },
  "Dropbox": {
    "key": "q5yx30gr8mcvq4f",
    "secret": "qy64qphr70lwui5",
    "app_name": "jellyreader"
  }
};

Nimbus.Auth.setup(sync_object);

/*
  reader models
*/


FeedItem = Nimbus.Model.setup('FeedItem', ['link', 'title', 'description', 'author', 'updated', 'feed', 'read', 'star', 'image', "content", "site"]);

FeedSite = Nimbus.Model.setup('FeedSite', ['title', 'link', 'type', 'description', 'updated', "icon"]);

Nimbus.Auth.set_app_ready(function() {
  console.log("app ready called");
  if (Nimbus.Auth.authorized()) {
    $('.app_spinner').show();
    FeedItem.sync_all(function() {
      return FeedSite.sync_all(function() {
        $("#loading").addClass("loaded");
        $('.app_spinner').hide();
        return angular.element(document.getElementById('app_body')).scope().load();
      });
    });
  }
});

/*
  main reader class
*/


Reader = {
  tasks: 0,
  worker: null,
  cache: {},
  spinner_opt: {
    lines: 13,
    length: 11,
    width: 5,
    radius: 17,
    corners: 1,
    rotate: 0,
    color: '#FFF',
    speed: 1,
    trail: 60,
    shadow: false,
    hwaccel: false,
    className: 'spinner',
    zIndex: 2e9,
    top: 'auto',
    left: 'auto'
  },
  spin: function(text) {
    return this.spinner = iosOverlay({
      'text': text,
      spinner: new Spinner(Reader.spinner_opt).spin()
    });
  },
  refresh: function(sites) {
    var i, site, _i, _len;
    if (this.tasks) {
      console.log('refresh in progress');
      return;
    }
    this.spin('Updating');
    if (!sites) {
      sites = FeedSite.all();
    }
    this.tasks = sites.length;
    for (i = _i = 0, _len = sites.length; _i < _len; i = ++_i) {
      site = sites[i];
      this.get_feeds(site);
    }
  },
  stop: function() {
    $('span.spinner').hide();
    angular.element(document.getElementById('app_body')).scope().app_loading = false;
    angular.element(document.getElementById('app_body')).scope().$apply();
    return this.spinner.hide();
  },
  get_rss: function(url) {
    var config, is_feedburner_ok, is_rss_url, original_url, rss_tag_present, _this;
    this.cache.url = url;
    original_url = url;
    is_rss_url = false;
    rss_tag_present = false;
    config = {
      'url': url,
      dataType: 'xml',
      async: false,
      success: function(data, status, xhr) {
        console.log('ok');
        return is_rss_url = true;
      },
      error: function(req, msg, e) {
        var icon_exp, icon_reg, icons, link, link_exp, match, regexp;
        console.log('error');
        regexp = /<link.*type=['"]application\/rss\+xml['"].*\/*>/;
        match = regexp.exec(req.responseText);
        if (match) {
          rss_tag_present = true;
          link_exp = new RegExp('href=[\'\"][^\'^\"]+');
          link = link_exp.exec(match)[0].replace('href=', '').replace('"', '').replace("'", '');
          url = link.indexOf('http') !== -1 ? link : url + link;
        }
        icon_reg = /<link.*rel="shortcut icon".*href=(\S*)\s*\/?>/;
        icons = icon_reg.exec(req.responseText);
        if (icons) {
          icon_exp = new RegExp('href=[\'\"][^\'^\"]+');
          return Reader.cache.icon = icon_exp.exec(icons)[0].replace('href=', '').replace('"', '').replace("'", '');
        }
      }
    };
    $.ajax(config);
    if (is_rss_url) {
      return url;
    }
    _this = this;
    if (rss_tag_present) {
      return url;
    } else {
      is_feedburner_ok = false;
      config.url = this.feedburner_url(original_url) + '?format=xml';
      config.error = function(req, msg, e) {
        return console.log(e);
      };
      $.ajax(config);
      if (is_rss_url) {
        return config.url.replace('?format=xml', '');
      } else {
        return is_rss_url;
      }
    }
  },
  get_icon: function(url) {
    return get_icon(site);
  },
  get_feed_image: function(feed) {
    return get_first_image(feed);
  },
  feedburner_url: function(url) {
    var index;
    if (url.indexOf("feedburner.com") !== -1) {
      return url;
    }
    url = url.replace("http://", "").replace("https://", "").replace("www.", "");
    index = url.indexOf("/");
    if (index !== -1) {
      url = url.substring(0, index);
    }
    url = 'http://feeds.feedburner.com/' + url;
    return url;
  },
  get_feeds: function(site) {
    var link, _this;
    _this = this;
    link = site.link.indexOf('feeds.feedburner.com') !== -1 ? site.link + '?format=xml' : site.link;
    $.ajax({
      url: link,
      dataType: 'xml',
      headers: {
        Accept: "text/xml; charset=UTF-8"
      },
      success: function(data) {
        var json;
        log(data);
        json = $.xmlToJSON(data);
        if (json.rss) {
          return _this.save_feeds(json.rss, site);
        } else {
          return _this.save_feeds(json.feed, site);
        }
      },
      error: function(req, msg, e) {
        log(msg);
        if (_this.tasks > 0) {
          _this.tasks--;
        }
        if (!_this.tasks) {
          angular.element(document.getElementById('app_body')).scope().load();
          return _this.stop();
        }
      }
    });
  },
  save_feeds: function(json, site) {
    var worker, _this;
    _this = this;
    worker = new Worker('js/feed_loader.js');
    worker.postMessage(JSON.stringify(json));
    return worker.onmessage = function(evt) {
      var data, feed, i, item, _i, _len, _ref;
      log(JSON.parse(evt.data));
      data = JSON.parse(evt.data);
      if (data.site.title) {
        if (!data.site.icon) {
          delete data.site.icon;
        }
        site.updateAttributes(data.site);
      }
      FeedItem.batch_mode = true;
      FeedItem.on_batch_save = false;
      _ref = data.items;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        feed = _ref[i];
        if (i === data.items.length - 1) {
          FeedItem.on_batch_save = true;
        }
        item = FeedItem.findByAttribute('link', feed.link);
        if (!item) {
          item = FeedItem.create(feed);
        } else {
          item.save();
        }
      }
      FeedItem.batch_mode = FeedItem.on_batch_save = false;
      if (_this.tasks > 0) {
        _this.tasks--;
      }
      if (!_this.tasks) {
        angular.element(document.getElementById('app_body')).scope().load();
        _this.stop();
      }
      worker.terminate();
    };
  },
  logout: function() {
    Nimbus.Auth.logout();
    $("#loading").removeClass("loaded");
  }
};

window.CORS_PROXY = "http://192.241.167.76:9292/";

create_sample_feed = function() {
  var feedItem, obj;
  obj = {
    'link': "http://www.google.com",
    'title': "Test One Two Three five six seven",
    'description': "Short description",
    'author': "Jack Farnam",
    'updated': Date.now(),
    'feed': "http://google.com",
    'read': false,
    'star': false,
    'content': "<p>one two three asdf adf kadsf akdsfj kaldsfj akdfjalk sdfadskf alkdfjaldskf</p>",
    'site': "Techcrunch"
  };
  feedItem = FeedItem.create(obj);
  return feedItem.save();
};

create_feed_array = function(x) {
  var y, _i, _results;
  _results = [];
  for (y = _i = 1; 1 <= x ? _i <= x : _i >= x; y = 1 <= x ? ++_i : --_i) {
    _results.push(create_sample_feed());
  }
  return _results;
};

save_model_test = function(times) {
  var i, _i;
  for (i = _i = 1; 1 <= times ? _i <= times : _i >= times; i = 1 <= times ? ++_i : --_i) {
    FeedItem.saveLocal(true);
  }
};

load_rss_feed = function(url) {
  var feedSite, obj, rss;
  if (url.indexOf('http://') === -1) {
    url = 'http://' + url;
  }
  Reader.cache = {
    'url': url,
    'icon': ''
  };
  if (rss = Reader.get_rss(url)) {
    feedSite = FeedSite.findByAttribute('link', url);
    if (feedSite) {
      Reader.get_feeds(feedSite);
      return;
    }
    console.log('create site');
    obj = {
      name: "",
      link: rss,
      type: "",
      description: "",
      updated: ""
    };
    feedSite = FeedSite.create(obj);
    get_icon(feedSite, url);
    return Reader.get_feeds(feedSite);
  } else {
    console.log('not valid');
    iosOverlay({
      icon: 'img/cross.png',
      text: 'Invalid Url',
      duration: 1500
    });
    return $('span.spinner').hide();
  }
};

get_first_image = function(feedItem) {
  var content, first, regexp;
  content = "";
  if (feedItem.content != null) {
    content = feedItem.content;
  } else {
    content = feedItem.description;
  }
  content = decodeURIComponent(window.atob(content));
  regexp = /<img\s*[^>]*\s*src='?(\S+)'?[^>]*>/;
  regexp.test(content);
  first = RegExp.$1;
  first = first.replace('"', "").replace('"', "").replace("'", "").replace("'", "");
  return first;
};

get_icon = function(feedSite, url) {
  var config, icon, last;
  if (Reader.cache.icon && (Reader.cache.url === feedSite.link || url)) {
    feedSite.icon = Reader.cache.icon;
    feedSite.save();
    console.log('shortcut saved');
    return;
  }
  icon = "";
  last = url.length - 1;
  if (url[last] === "/") {
    icon = url + "favicon.ico";
  } else {
    icon = url + "/favicon.ico";
  }
  icon = icon.replace('feeds.feedburner.com/', "").replace('?format=xml', "");
  config = {
    'url': icon,
    success: function(data) {
      console.log("icon retrieved");
      feedSite.icon = icon;
      return feedSite.save();
    },
    error: function(data) {
      console.log("THERE IS NO ICON AT DEFAULT LOCATION");
      config = {
        'url': feedSite.link,
        success: function(data) {
          var found_icon, iframe, iframeDoc, node, nodeList, _i, _len;
          iframe = document.getElementById('parse-iframe');
          if (iframe) {
            document.body.removeChild(iframe);
          }
          iframe = document.createElement("iframe");
          iframe.id = 'parse-iframe';
          iframe.style.display = 'none';
          document.body.appendChild(iframe);
          iframeDoc = document.getElementById('parse-iframe').contentWindow.document;
          iframeDoc.body.innerHTML = data;
          nodeList = iframeDoc.getElementsByTagName("link");
          for (_i = 0, _len = nodeList.length; _i < _len; _i++) {
            node = nodeList[_i];
            if (node.getAttribute("rel").toLowerCase() === "shortcut icon") {
              found_icon = node.getAttribute("href");
              if (found_icon.slice(0, 4) !== "http") {
                found_icon = feedSite.link + found_icon;
              }
            }
          }
          feedSite.icon = found_icon;
          feedSite.save();
          return angular.element(document.getElementById('app_body')).scope().$apply();
        }
      };
      return $.ajax(config);
    }
  };
  return $.ajax(config);
};

window.refresh = function() {
  return Reader.refresh();
};

$(function() {
  var EffecktDemos;
  if (localStorage['state']) {
    $('.spinner').show();
  }
  if (location.href.indexOf('chrome') === -1) {
    console.log("THIS IS NOT CHROME, USE CORS PROXY");
    $.ajaxPrefilter(function(options, originalOptions, jqXHR) {
      options.url = options.url.replace('http://', "");
      options.url = CORS_PROXY + options.url;
      return console.log("option.url", options.url);
    });
  }
  $("#login_dropbox").click(function() {
    console.log("Auth button clicked");
    return Nimbus.Auth.authorize('Dropbox');
  });
  $("#login_gdrive").click(function() {
    console.log("Auth button clicked");
    return Nimbus.Auth.authorize('GDrive');
  });
  $("#logout").click(function() {
    return Reader.logout();
  });
  $("#refresh").click(function() {
    return refresh();
  });
  if (document.URL.slice(0, 6) === "chrome") {
    log("Chrome edition authentication");
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
      if (tab.title === "API Request Authorized - Dropbox") {
        chrome.tabs.remove(tabId);
        return Nimbus.Client.Dropbox.get_access_token(function(data) {
          localStorage["state"] = "Working";
          if (Nimbus.Auth.authorized_callback != null) {
            Nimbus.Auth.authorized_callback();
          }
          Nimbus.Auth.app_ready_func();
          console.log("NimbusBase is working! Chrome edition.");
          return Nimbus.track.registered_user();
        });
      }
    });
  }
  EffecktDemos = {
    init: function() {
      return $(window).load(function() {
        return $(".no-transitions").removeClass("no-transitions");
      });
    }
  };
  return EffecktDemos.init();
});
