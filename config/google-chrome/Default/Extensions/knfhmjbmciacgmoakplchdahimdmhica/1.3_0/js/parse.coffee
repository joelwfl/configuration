# setup sync
sync_object = 
  "GDrive":
    "key": "64840406425-l292ah0o3tt1idacjdru6lrib3ljdkl7.apps.googleusercontent.com"
    "scope": "https://www.googleapis.com/auth/drive"
    "app_name": "jellyreader"
  "Dropbox":
    "key": "q5yx30gr8mcvq4f"
    "secret": "qy64qphr70lwui5"
    "app_name": "jellyreader"
Nimbus.Auth.setup(sync_object)
###
  reader models
### 
FeedItem = Nimbus.Model.setup 'FeedItem', ['link', 'title', 'description', 'author', 'updated', 'feed', 'read', 'star', 'image', "content", "site"]
FeedSite = Nimbus.Model.setup 'FeedSite', ['title', 'link', 'type', 'description', 'updated', "icon"]

Nimbus.Auth.set_app_ready () ->
  console.log("app ready called")
  if Nimbus.Auth.authorized()
    $('.app_spinner').show();
    FeedItem.sync_all(()->
      FeedSite.sync_all(() ->
        $("#loading").addClass("loaded")
        $('.app_spinner').hide();
        angular.element(document.getElementById('app_body')).scope().load()
      )
    )
    return
###
  main reader class
###
Reader = 
  tasks : 0
  worker : null
  cache : {}
  spinner_opt : 
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
  spin : (text)->
    @spinner = iosOverlay(
      'text': text
      spinner : new Spinner(Reader.spinner_opt).spin()
    )
  refresh : (sites)->
    if @tasks
      console.log 'refresh in progress'
      return
    @spin('Updating')
    sites = FeedSite.all() if !sites
    @tasks = sites.length
    for site,i in sites
      @.get_feeds(site)

    return
  stop : ()->
    # hide spinner
    $('span.spinner').hide()
    angular.element(document.getElementById('app_body')).scope().app_loading = false
    angular.element(document.getElementById('app_body')).scope().$apply()
    @spinner.hide()

  get_rss : (url)->
    # get rss address from url
    @cache.url = url
    original_url = url
    is_rss_url = false
    rss_tag_present = false
    # ajax url test
    config = 
      'url' : url
      dataType : 'xml'
      async : false
      success : (data,status,xhr)->
        # save as url
        console.log 'ok'
        is_rss_url = true
      error : (req,msg,e)->
        # try parse content for rss tag
        console.log 'error'
        regexp = /<link.*type=['"]application\/rss\+xml['"].*\/*>/
        match = regexp.exec(req.responseText)
        if match 
          rss_tag_present = true
          link_exp = new RegExp('href=[\'\"][^\'^\"]+')
          link = link_exp.exec(match)[0].replace('href=','').replace('"','').replace("'",'')
          url = if link.indexOf('http') isnt -1 then link else url+link

        # retrive favico
        icon_reg = /<link.*rel="shortcut icon".*href=(\S*)\s*\/?>/
        icons = icon_reg.exec(req.responseText)
        if icons
          icon_exp = new RegExp('href=[\'\"][^\'^\"]+')
          Reader.cache.icon = icon_exp.exec(icons)[0].replace('href=','').replace('"','').replace("'",'')
    $.ajax config
    return url if is_rss_url
    # test rss tag
    _this = @
    if rss_tag_present
      # no more verification
      return url
    else
      is_feedburner_ok = false
      # test feed burner url instead
      config.url = @.feedburner_url(original_url)+'?format=xml'
      config.error = (req,msg,e)->
        console.log e
      $.ajax config
      return if is_rss_url then config.url.replace('?format=xml','') else is_rss_url
    
  get_icon : (url)->
    # get favicon from url 
    get_icon(site)
  get_feed_image : (feed)->
    # return a image link
    get_first_image(feed)

  feedburner_url : (url)->
    # generate feedburner url
    return url if url.indexOf("feedburner.com") != -1
    url = url.replace("http://", "").replace("https://", "").replace("www.", "")
    index = url.indexOf("/")
    url = url.substring(0, index) if index != -1
    url = 'http://feeds.feedburner.com/'+url
    url

  get_feeds :  (site)->
    # get feeds for site
    _this = @
    link = if site.link.indexOf('feeds.feedburner.com') isnt -1 then site.link+'?format=xml' else site.link
    $.ajax
      url : link
      dataType : 'xml'
      headers: 
        Accept : "text/xml; charset=UTF-8"
      success : (data)->
        log data
        json = $.xmlToJSON(data)
        if json.rss
          _this.save_feeds(json.rss,site)
        else
          _this.save_feeds(json.feed,site)
      error : (req,msg,e)->
        log msg
        _this.tasks-- if _this.tasks>0
        if !_this.tasks
          angular.element(document.getElementById('app_body')).scope().load()
          _this.stop()
      
    return
  save_feeds : (json,site)->
    _this = this
    
    worker = new Worker('js/feed_loader.js')
    worker.postMessage(JSON.stringify(json))
    # process data back
    worker.onmessage = (evt)->
      log(JSON.parse(evt.data))
      data = JSON.parse(evt.data)
      # save site data
      if data.site.title
        if !data.site.icon
          delete data.site.icon
        
        site.updateAttributes(data.site)
      
      # save feed data
      FeedItem.batch_mode = true
      FeedItem.on_batch_save = false

      for feed,i in data.items
        if i is data.items.length-1
          FeedItem.on_batch_save = true
        
        item = FeedItem.findByAttribute('link',feed.link)
        if !item
          item = FeedItem.create(feed)
        else
          item.save()
      # save batch
      FeedItem.batch_mode = FeedItem.on_batch_save = false

      _this.tasks-- if _this.tasks>0
      if !_this.tasks
        angular.element(document.getElementById('app_body')).scope().load()
        _this.stop()
      # terminate worker
      worker.terminate()
      return
  logout : ()->
      # logout
      Nimbus.Auth.logout()
      $("#loading").removeClass("loaded")
      return


window.CORS_PROXY = "http://192.241.167.76:9292/"
# window.CORS_PROXY = "http://cors-anywhere.herokuapp.com/"

create_sample_feed = () ->
  obj = 
    'link': "http://www.google.com"
    'title': "Test One Two Three five six seven"
    'description': "Short description"
    'author': "Jack Farnam"
    'updated': Date.now()
    'feed': "http://google.com" # host url
    'read': false
    'star': false
    'content': "<p>one two three asdf adf kadsf akdsfj kaldsfj akdfjalk sdfadskf alkdfjaldskf</p>"
    'site': "Techcrunch"
  feedItem = FeedItem.create(obj)  
  feedItem.save()

create_feed_array = (x) ->
  for y in [1..x]
    create_sample_feed()

save_model_test = (times)->
  for i in [1..times]
    FeedItem.saveLocal(true)
  return

load_rss_feed = (url)->
  # regular test first
  if url.indexOf('http://') is -1
    url = 'http://'+url
  Reader.cache = 
    'url' : url
    'icon' : ''

  if rss=Reader.get_rss(url)
    feedSite = FeedSite.findByAttribute('link', url)
    if feedSite    
      Reader.get_feeds(feedSite)
      return
    console.log 'create site'
    # find rss url first
    obj = 
      name: ""
      link: rss
      type: ""
      description: ""
      updated: ""
    feedSite = FeedSite.create(obj)
    get_icon(feedSite,url) 
    Reader.get_feeds(feedSite) 
  else
    console.log 'not valid'
    iosOverlay(
      icon : 'img/cross.png'
      text : 'Invalid Url'
      duration : 1500
    )
    $('span.spinner').hide()

get_first_image = (feedItem)->
  content = ""
  if feedItem.content?
    content = feedItem.content
  else
    content = feedItem.description
  
  content = decodeURIComponent(window.atob(content))
  
  regexp = /<img\s*[^>]*\s*src='?(\S+)'?[^>]*>/
  regexp.test(content)

  first = RegExp.$1
  first = first.replace('"', "").replace('"', "").replace("'", "").replace("'", "")
  return first

get_icon = (feedSite,url)->
  # check cache 
  if Reader.cache.icon and (Reader.cache.url is feedSite.link or url )
    feedSite.icon = Reader.cache.icon
    feedSite.save()
    console.log 'shortcut saved'
    return
  #url = feedItem.link
  icon = ""

  last = url.length-1
  if url[last] is "/"
    icon = url+"favicon.ico"
  else
    icon = url+"/favicon.ico"

  icon = icon.replace('feeds.feedburner.com/',"").replace('?format=xml',"")

  config = 
    'url': icon,  
    success: (data)->
      console.log("icon retrieved")
      feedSite.icon = icon
      feedSite.save()

    error: (data) ->
      console.log("THERE IS NO ICON AT DEFAULT LOCATION")
      config =
        'url': feedSite.link,  
        success: (data)->
          iframe = document.getElementById('parse-iframe')
          document.body.removeChild(iframe) if iframe        
          iframe = document.createElement("iframe");
          iframe.id = 'parse-iframe'
          iframe.style.display = 'none'
          document.body.appendChild(iframe)
          iframeDoc = document.getElementById('parse-iframe').contentWindow.document
          iframeDoc.body.innerHTML = data   
          nodeList = iframeDoc.getElementsByTagName("link")
          for node in nodeList
            if node.getAttribute("rel").toLowerCase() == "shortcut icon"
              found_icon = node.getAttribute("href")
              
              #attach address
              if found_icon[0..3] isnt "http"
                found_icon = feedSite.link + found_icon
          feedSite.icon = found_icon
          feedSite.save()
          angular.element(document.getElementById('app_body')).scope().$apply()
          
      $.ajax(config)

  $.ajax(config)

window.refresh = ->
  Reader.refresh()
  
$ ->
  if localStorage['state']
    $('.spinner').show()    

  if location.href.indexOf('chrome') is -1
    console.log("THIS IS NOT CHROME, USE CORS PROXY")
    $.ajaxPrefilter(( options, originalOptions, jqXHR )->
      options.url = options.url.replace('http://', "")
      options.url = CORS_PROXY+options.url
      console.log("option.url", options.url)
    )

  $("#login_dropbox").click( ()->
    console.log("Auth button clicked")
    Nimbus.Auth.authorize('Dropbox')
  )

  $("#login_gdrive").click( ()->
    console.log("Auth button clicked")
    Nimbus.Auth.authorize('GDrive')
  )  

  $("#logout").click( ()->
    Reader.logout()
  )

  $("#refresh").click( ()->
    refresh()
  )

  if document.URL[0..5] is "chrome"
    log("Chrome edition authentication")
    chrome.tabs.onUpdated.addListener( (tabId, changeInfo, tab) -> 
      if tab.title is "API Request Authorized - Dropbox"
        chrome.tabs.remove(tabId)
        Nimbus.Client.Dropbox.get_access_token( (data) -> 
          localStorage["state"] = "Working" 
          Nimbus.Auth.authorized_callback() if Nimbus.Auth.authorized_callback?
          
          Nimbus.Auth.app_ready_func()
          console.log("NimbusBase is working! Chrome edition.")
          Nimbus.track.registered_user()
        )
    )

  EffecktDemos = init: ->
    $(window).load ->
      $(".no-transitions").removeClass "no-transitions"
  
  EffecktDemos.init()
 