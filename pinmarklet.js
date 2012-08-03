(function (window, document, config) {
  'use strict';

  var Pinmarklet = window[config.k] = {
  
    config: config,
    doc: {},
    hazAtLeastOneGoodThumb: 0,
    hazCalledForInfo: {},
    hazCanonical: false,
    hazPinningNow: false,
    saveScrollTop: null,
    tag: [],
    thumbed: [],


    /**
     * Gets or sets the attribute of a element.
     *
     * @param el    Element.
     * @param attr  Attribute to retrieve or set.
     * @param val   [Optional] Value to set to the attribute.
     *              If null, current attribute value will be returned.
     */
    attribute: function (obj, attr, val) {
      // Get.
      if ( ! val) {
        return (typeof obj[attr] === "string") ? obj[attr] : obj.getAttribute(attr);
      }
      
      // Set.
      if (typeof obj[attr] === "string") {
        obj[attr] = val;
      }
      else {
        obj.setAttribute(attr, val);
      }
      
      return val;
    },
    
    
    /**
     * Searches an element in a array and returns its index.
     *
     * @param  array         Haystack array.
     * @param  searchElement Needle element.
     */
    indexOf: function (array, searchElement /*, fromIndex */ ) {
        if (array == null) {
            throw new TypeError();
        }
        var t = Object(array);
        var len = t.length >>> 0;
        if (len === 0) {
            return -1;
        }
        var n = 0;
        if (arguments.length > 0) {
            n = Number(arguments[1]);
            if (n != n) { // shortcut for verifying if it's NaN
                n = 0;
            } else if (n != 0 && n != Infinity && n != -Infinity) {
                n = (n > 0 || -1) * Math.floor(Math.abs(n));
            }
        }
        if (n >= len) {
            return -1;
        }
        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for (; k < len; k++) {
            if (k in t && t[k] === searchElement) {
                return k;
            }
        }
        
        return -1;
    },
    
    
    /**
     * Adds a event listener.
     *
     * @param el         Element to attach event to.
     * @param eventType  Event type.
     * @param callback   Event callback.
     */
    listen: function (element, eventType, callback) {
      // Standard
      if (window.addEventListener) {
        element.addEventListener(eventType, callback, false);
      }
      // IE
      else if (window.attachEvent) {
        element.attachEvent('on' + eventType, callback);
      }
    },
    
    
    unlisten: function (element, eventType, callback) {
      // Standard
      if (window.removeEventListener) {
        element.removeEventListener(eventType, callback, false)
      }
      // IE
      else if (window.detachEvent) {
        element.detachEvent('on' + eventType, callback)
      }
    },
    
    
    /**
     * Opens the pin popup for a element.
     *
     * @param el  Element to pin.
     */
    pin: function (el) {
      // TODO: Unfinished.
      console.log(el);
      window.open(Pinmarklet.config.pin, '_blank', Pinmarklet.config.pop);
    },
    
    
    /**
     * Closes the bookmarklet and cleans up the DOM.
     *
     * @param msg Optional message to show to user.
     */
    close: function (msg) {
      // Remove elements from DOM.
      if (document.head) {
        document.head.removeChild(Pinmarklet.doc.styl);
      }
      if (document.body) {
        document.body.removeChild(Pinmarklet.doc.main);
      }
      window.hazPinningNow = false;
      if (msg) {
        window.alert(msg);
      }
      
      // Detach event listeners.
      Pinmarklet.unlisten(document, 'click', Pinmarklet.click);
      Pinmarklet.unlisten(document, 'keydown', Pinmarklet.keydown);
      
      // Return original scroll.
      window.scroll(0, Pinmarklet.saveScrollTop);
    },
    
    
    /**
     * Event handler for clicks.
     */
    click: function (event) {
      var element;
      
      event = event || window.event;
      event.preventDefault ? event.preventDefault() : event.returnValue = false;
      element = event.target || event.srcElement;
      
      // Clicking the Cancel button closes the bookmarklet.
      if (element.id === Pinmarklet.config.k + '_x') {
        Pinmarklet.close();
      }
      if (element.className === Pinmarklet.config.k + '_pinThis') {
        Pinmarklet.pin(element);
        window.setTimeout(function () {
          Pinmarklet.close();
        }, 10);
      }
    },
    
    
    /**
     * Event handler for keydowns.
     */
    keydown: function (event) {
      // Pressing the Esc key closes the bookmarklet.
      if ((event || window.event).keyCode === 27) {
        Pinmarklet.close();
      }
    },
    
    
    /**
     * Adds event listeners to DOM.
     */
    behavior: function () {
      Pinmarklet.listen(document, 'click', Pinmarklet.click);
      Pinmarklet.listen(document, 'keydown', Pinmarklet.keydown);
    },
    
    
    /**
     * Adds styles to DOM.
     */
    presentation: function () {
      var style;
      var template;
      
      style = document.createElement('style');
      Pinmarklet.attribute(style, 'type', 'text/css');
      Pinmarklet.attribute(style, 'id', Pinmarklet.config.k + '_style');
      template = Pinmarklet.template(Pinmarklet.config.templates.styles, { k: Pinmarklet.config.k });
      if (style.styleSheet) {
        style.styleSheet.cssText = template;
      }
      else {
        style.innerHTML = template;
      }
      if (document.head) {
        document.head.appendChild(style);
      }
      else {
        Pinmarklet.doc.main.appendChild(style);
      }
      Pinmarklet.doc.styl = style;
    },
    
    
    /**
     * Adds a element as selectable to pin.
     *
     * @param opts Options for the element.
     */
    thumb: function (opts) {
      if ( ! opts.src || Pinmarklet.indexOf(Pinmarklet.thumbed, opts.src) !== -1) {
        return;
      }
      
      // Sets defaults for options.
      opts.domain = opts.domain || null;
      opts.specialClass = opts.provider ? '_' + opts.provider : null;
      opts.pinurl = opts.pinurl || null;
      opts.media = opts.media || null;
      
      document.getElementById(Pinmarklet.config.k + '_imgContainer').innerHTML += Pinmarklet.template(Pinmarklet.config.templates.elementMarkup, opts);
      Pinmarklet.hazAtLeastOneGoodThumb += 1;
      Pinmarklet.thumbed.push(opts.src);
    },
    
    
    /**
     * Utility method to make AJAX calls.
     *
     * @param url      URL to request.
     * @param callback Function to execute on response.
     */
    call: function (url, callback) {
      var format = 'json';
      var http = false;
      
      // OldIE cross-domain requests must be done with the XDomainRequest object.
      if (typeof XDomainRequest !== 'undefined') {
        // Creates a new XDR object.
        var http = new XDomainRequest();
        // The object is complete.
        http.onload = function () {
          var result = "";
          if (http.responseText) {
            result = http.responseText;
          }

          //If the return is in JSON format, eval the result before returning it.
          if (format.charAt(0) === "j") {
            //\n's in JSON string, when evaluated will create errors in IE
            result = result.replace(/[\n\r]/g,"");
            result = eval('('+result+')');
          }
          
          //Give the data to the callback function.
          if (callback) {
            callback(result);
          }
        };
        // Creates a connection with a domain's server.
        http.open("get", url);
        // Transmits a data string to the server.
        http.send();
        
        return;
      }

      // "Modern" browsers:
      // Use IE's ActiveX items to load the file.
      if (typeof ActiveXObject !== 'undefined') {
        try {http = new ActiveXObject("Msxml2.XMLHTTP");}
        catch (e) {
          try { http = new ActiveXObject("Microsoft.XMLHTTP"); }
          catch (e) { http = false; }
        }
      // If ActiveX is not available, use the XMLHttpRequest of Firefox/Mozilla etc. to load the document.
      }
      else if (window.XMLHttpRequest) {
        try { http = new XMLHttpRequest(); }
        catch (e) { http = false; }
      }

      if ( ! http || ! url) {
        return;
      }
      if (http.overrideMimeType) {
        http.overrideMimeType('text/xml');
      }

      //Kill the Cache problem in IE.
      var now = "uid=" + new Date().getTime();
      url += (Pinmarklet.indexOf(url, "?") + 1) ? "&" : "?";
      url += now;

      http.open("GET", url, true);
      http.onreadystatechange = function () { // Call a function when the state changes.
        if (http.readyState === 4) { // Ready State will be 4 when the document is loaded.
          if (http.status === 200) {
            var result = "";
            if (http.responseText) {
              result = http.responseText;
            }

            // If the return is in JSON format, eval the result before returning it.
            if (format.charAt(0) === "j") {
              // \n's in JSON string, when evaluated will create errors in IE
              result = result.replace(/[\n\r]/g,"");
              result = eval('('+result+')');
            }

            // Give the data to the callback function.
            if (callback) {
              callback(result);
            }
          }
        }
      };
      http.send(null);
    },
    
    
    /**
     * Gets more info about a pinnable element querying the API of the content provider. Currently works only with YouTube.
     * TODO: Make it independent from YouTube so more sites can be added easily.
     *
     * @param params   Parameters of the call.
     * @param callback Function to execute when receiving the response.
     */
    getExtendedInfo: function (params, callback) {
      var info;
      
      if (Pinmarklet.hazCalledForInfo[params]) {
        return;
      }
      Pinmarklet.hazCalledForInfo[params] = true;
      
      Pinmarklet.call(Pinmarklet.config.api[params.site].replace('{{id}}', params.id), function (response) {
        info = {
          title: response.entry.title.$t,
          url: response.entry.link[0].href,
          thumb: response.entry.media$group.media$thumbnail[2].url
        };
        callback(info);
      });
    },
    
    
    /**
     * Gets the id of the element. Currently it's only used to get the ID of a YouTube video.
     *
     * @param props Properties of the element (mainly has the URL of the video).
     */
    getId: function (props) {
      for (var id, j = props.u.split('?')[0].split('#')[0].split('/'); ! id;) {
        id = j.pop();
      }
      if (props.r) {
        id = parseInt(id, props.r);
      }
      
      return encodeURIComponent(id);
    },
    
    
    /**
     * Gets the canonical info of the current page.
     *
     * @param site Content provider ('youtube').
     */
    seekCanonical: function (site) {
      var canonical = {};
      var seeksite = Pinmarklet.config.seek[site];
      var meta = document.head.getElementsByTagName(seeksite.tagName);
      
      for (var i in seeksite.field) {
        for (var j = 0; j < meta.length; j += 1) {
          if (Pinmarklet.attribute(meta[j], seeksite.property) === i) {
            canonical[seeksite.field[i]] = Pinmarklet.attribute(meta[j], seeksite.content);
          }
        }
      }
      if (Object.keys(canonical).length) {
        Pinmarklet.hazCanonical = true;
      }
      
      Pinmarklet.thumb({
        k: Pinmarklet.config.k,
        media: seeksite.media,
        provider: site,
        src: canonical.pImg,
        title: canonical.pTitle,
        height: canonical.pHeight,
        width: canonical.pWidth
      });
      
      return canonical;
    },
    
    
    /**
     * Looks if page URL matches any of the content providers like YouTube.
     * If it does, looks for canonical info.
     */
    hazUrl: {
      own: function () {
        Pinmarklet.close(Pinmarklet.config.msg.installed);
      },
      youtube: function () {
        Pinmarklet.seekCanonical('youtube');
      }
    },
    
    
    /**
     * Callback executed when the pinnable image is loaded to adjust its size.
     */
    imgLoaded: function (event) {
      var element;

      event = event || window.event;
      element = event.target || event.srcElement;
      
      // Adjusts image size and position.
      if (element.width === element.height) {
        element.width = element.height = Pinmarklet.config.thumbCellSize;
      }
      if (element.height > element.width) {
        element.width = Pinmarklet.config.thumbCellSize;
        element.height = Pinmarklet.config.thumbCellSize * (element.height / element.width);
        element.style.marginTop = 0 - (element.height - Pinmarklet.config.thumbCellSize) / 2 + 'px';
      }
      if (element.height < element.width) {
        element.height = Pinmarklet.config.thumbCellSize;
        element.width  = Pinmarklet.config.thumbCellSize * (element.width / element.height);
        element.style.marginLeft = 0 - (element.width - Pinmarklet.config.thumbCellSize) / 2 + 'px';
      }
      
      // Shows image.
      document.getElementById(Pinmarklet.config.k + '_thumb_' + Pinmarklet.attribute(element, 'src')).className += ' visible';
    },
    
    
    /**
     * These methods are called when a pinnable element is detected on the page.
     */
    hazTag: {
      img: function (tag) {
        if (tag.height < Pinmarklet.config.minImgSize || tag.width < Pinmarklet.config.minImgSize) {
          return;
        }
        
        Pinmarklet.thumb({
          k: Pinmarklet.config.k,
          tag: tag,
          media: 'img',
          src: Pinmarklet.attribute(tag, 'src'),
          height: tag.height,
          width: tag.width,
          title: Pinmarklet.attribute(tag, 'title') || document.title,
          domain: window.location.hostname
        });
      },
      iframe: function (tag) {
        var id;
        for (var site in Pinmarklet.config.tag.iframe) {
          for (var j = 0; j < Pinmarklet.config.tag.iframe[site].match.length; j += 1) {
            if (tag[Pinmarklet.config.tag.iframe[site].att].match(Pinmarklet.config.tag.iframe[site].match[j])) {
              id = Pinmarklet.getId({ u: tag.src });
              Pinmarklet.getExtendedInfo({ site: site, id: id }, function (info) {
                Pinmarklet.thumb({
                  k: Pinmarklet.config.k,
                  tag: tag,
                  media: 'video',
                  src: info.thumb,
                  pinurl: info.url,
                  provider: site,
                  height: tag.height,
                  width: tag.width,
                  title: info.title || document.title
                });
              });
                
              return;
            }
          }
        }
      }
    },
    
    
    /**
     * Checks document tags for pinneable elements.
     */
    checkTags: function () {
      var tag;
      var tags;
      var tagName;
      
      for (var i = 0; i < Pinmarklet.config.check.length; i++) {
        tags = document.getElementsByTagName(Pinmarklet.config.check[i]);
        for (var j = 0; j < tags.length; j++) {
          if ( ! Pinmarklet.attribute(tags[j], 'nopin') && tags[j].style.display !== 'none' && tags[j].style.visibility !== 'hidden') {
            Pinmarklet.tag.push(tags[j]);
          }
        }
      }
      for (var k = 0; k < Pinmarklet.tag.length; k++) {
        tag = Pinmarklet.tag[k];
        tagName = tag.tagName.toLowerCase();
        if (Pinmarklet.hazTag[tagName]) {
          Pinmarklet.hazTag[tagName](tag);
        }
      }
      
      return Boolean(Pinmarklet.tag.length);
    },
        
    
    /**
     * Gets the max height of the document.
     */
    getHeight: function () {
      return Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.body.clientHeight
      );
    },
    
    
    /**
     * Adds markup to DOM.
     */
    structure: function () {
      var height;
      var mainContainer;
      
      // Creating a wrapper this way avoids reflow.
      mainContainer = document.createElement('div');
      Pinmarklet.attribute(mainContainer, 'id', Pinmarklet.config.k + '_mainContainer');
      mainContainer.innerHTML = Pinmarklet.template(Pinmarklet.config.templates.bookmarkletMarkup, { k: Pinmarklet.config.k });
      document.body.appendChild(mainContainer);
      
      Pinmarklet.doc.main = mainContainer;
      Pinmarklet.doc.shim = document.getElementById(Pinmarklet.config.k + '_shim');
      Pinmarklet.doc.bg = document.getElementById(Pinmarklet.config.k + '_bg');
      Pinmarklet.doc.bd = document.getElementById(Pinmarklet.config.k + '_bd');
      
      height = Pinmarklet.getHeight();
      if (Pinmarklet.doc.bd.offsetHeight < height) {
        Pinmarklet.doc.shim.style.height = height + 'px';
        Pinmarklet.doc.bd.style.height = height + 'px';
        Pinmarklet.doc.bg.style.height = height + 'px';
      }
      
      window.scroll(0, 0);
    },
    
    
    /**
     * Checks if the page is one of the special URL. If so, special thumbs are generated.
     */
    checkUrl: function () {
      var i;
      var found = false;
      
      for (i in Pinmarklet.config.url) {
        if (document.URL.match(Pinmarklet.config.url[i])) {
          Pinmarklet.hazUrl[i]();
          found = true;
        }
      }
      
      return found;
    },
    
    
    /**
     * Checks if document is valid for pinning.
     */
    checkPage: function () {
      if ( ! Pinmarklet.checkUrl()) {
        Pinmarklet.checkTags();
      }
      
      return true;
    },
    

    /**
     * Renders a template.
     * Uses Tim, a tiny, secure JavaScript micro-templating script.
     * https://github.com/premasagar/tim
     *
     * @param template Template as a string.
     * @param data     Data to replace in the template.
     */
    template: (function(){
        var start   = "{{",
            end     = "}}",
            path    = "[a-z0-9_][\\.a-z0-9_]*", // e.g. config.person.name
            pattern = new RegExp(start + "\\s*("+ path +")\\s*" + end, "gi"),
            undef;
        
        return function(template, data){
            // Merge data into the template string
            return template.replace(pattern, function(tag, token){
                var path = token.split("."),
                    len = path.length,
                    lookup = data,
                    i = 0;
    
                for (; i < len; i++){
                    lookup = lookup[path[i]];
                    
                    // Property not found
                    if (lookup === undef){
                        throw "tim: '" + path[i] + "' not found in " + tag;
                    }
                    
                    // Return the required value
                    if (i === len - 1){
                        return lookup;
                    }
                }
            });
        };
    }()),
    
    
    /**
     * Bootstraps the bookmarklet.
     */
    init: function () {
      // document.head / document.body shim.
      try {
        document.head = document.head || document.getElementsByTagName('HEAD')[0];
        document.body = document.body || document.getElementsByTagName('BODY')[0];
      }
      catch (e) {}
      
      // Checks the document is a valid page.
      if ( ! document.body) {
        Pinmarklet.close(Pinmarklet.config.msg.noPinIncompletePage);
        
        return;
      }
      
      // Checks bookmarklet is not currently shown.
      if (window.hazPinningNow === true) {
        return;
      }
      window.hazPinningNow = true;
      Pinmarklet.saveScrollTop = window.pageYOffset;

      // Renders the UI.
      Pinmarklet.structure();
      Pinmarklet.presentation();
      Pinmarklet.checkPage();
      if ( ! Pinmarklet.hazCanonical && ( ! Pinmarklet.hazAtLeastOneGoodThumb || ! Pinmarklet.tag.length)) {
        Pinmarklet.close(Pinmarklet.config.msg.notFound);
        return;
      }
      Pinmarklet.behavior();
    }

  };

  
  Pinmarklet.init();

}(window, document, {
  k: 'PIN_' + Date.now(),
  domain: 'mysite.com',
  pin: '//google.com',
  minImgSize: 80,
  thumbCellSize: 200,
  check: ['img', 'iframe'],
  url: {
    own: /^https?:\/\/(www\.)?mysite\.com\//,
    youtube: /^https?:\/\/www\.youtube\.com\/watch\?/
  },
  api: {
    youtube: 'http://gdata.youtube.com/feeds/api/videos/{{id}}?v=2&alt=json'
  },
  seek: {
    youtube: {
      media: 'video',
      tagName: "meta",
      property: "property",
      content: "content",
      field: {
        "og:title": "pTitle",
        "og:url": "pUrl",
        "og:image": "pImg",
        'og:video:width': 'pWidth',
        'og:video:height': 'pHeight'
      }
    }
  },
  tag: {
    iframe: {
      youtube: {
        att: 'src',
        match: [/^http:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9\-_]+)/]
      }
    }
  },
  msg: {
    noPinIncompletePage: "Sorry, can't pin from non-HTML pages. If you're trying to upload an image, please visit pinterest.com.",
    notFound: "Sorry, couldn't find any pinnable images or video on this page.",
    installed: "The bookmarklet is installed! Now you can click your Crunch It button to pin images as you browse sites around the web."
  },
  pop: 'status=no,resizable=yes,scrollbars=yes,personalbar=no,directories=no,location=no,toolbar=no,menubar=no,width=632,height=270,left=0,top=0',
  templates: {
    styles: [
      '#{{k}}_shim {z-index:2147483640; position: absolute; background: transparent; top:0; right:0; bottom:0; left:0; width: 100%; border: 0;}',
      '#{{k}}_bg {z-index:2147483641; position: absolute; top:0; right:0; bottom:0; left:0; background-color:#f2f2f2; opacity:.95; width: 100%; }',
      '#{{k}}_bd {z-index:2147483642; position: absolute; text-align: center; width: 100%; top: 0; left: 0; right: 0; font:16px hevetica neue,arial,san-serif; }',
      '#{{k}}_bd #{{k}}_hd { z-index:2147483643; -moz-box-shadow: 0 1px 2px #aaa; -webkit-box-shadow: 0 1px 2px #aaa; box-shadow: 0 1px 2px #aaa; position: fixed; *position:absolute; width:100%; top: 0; left: 0; right: 0; height: 45px; line-height: 45px; font-size: 14px; font-weight: bold; display: block; margin: 0; background: #fbf7f7; border-bottom: 1px solid #aaa; }',
      '#{{k}}_bd #{{k}}_hd a#{{k}}_x { display: inline-block; cursor: pointer; color: #524D4D; line-height: 45px; text-shadow: 0 1px #fff; float: right; text-align: center; width: 100px; border-left: 1px solid #aaa; }',
      '#{{k}}_bd #{{k}}_hd a#{{k}}_x:hover { color: #524D4D; background: #e1dfdf; text-decoration: none; }',
      '#{{k}}_bd #{{k}}_hd a#{{k}}_x:active { color: #fff; background: #cb2027; text-decoration: none; text-shadow:none;}',
      '#{{k}}_bd #{{k}}_hd #{{k}}_logo {height: 43px; width: 100px; display: inline-block; margin-right: -100px; background: transparent url(http://passets-cdn.pinterest.com/images/LogoRed.png) 50% 50% no-repeat; border: none;}',
      '@media only screen and (-webkit-min-device-pixel-ratio: 2) { #{{k}}_bd #{{k}}_hd #{{k}}_logo {background-size: 100px 26px; background-image: url(http://passets-cdn.pinterest.com/images/LogoRed.2x.png); } }',
      '#{{k}}_bd #{{k}}_spacer { display: block; height: 50px; }',
      '#{{k}}_bd span.{{k}}_pinContainer { height:200px; width:200px; visibility:hidden; display:inline-block; background:#fff; position:relative; -moz-box-shadow:0 0  2px #555; -webkit-box-shadow: 0 0  2px #555; box-shadow: 0 0  2px #555; margin: 10px; }',
      '#{{k}}_bd span.{{k}}_pinContainer.visible { visibility:visible }',
      '#{{k}}_bd span.{{k}}_pinContainer { zoom:1; *border: 1px solid #aaa; }',
      '#{{k}}_bd span.{{k}}_pinContainer img { margin:0; padding:0; border:none; }',
      '#{{k}}_bd span.{{k}}_pinContainer span.img, #{{k}}_bd span.{{k}}_pinContainer span.{{k}}_play { position: absolute; top: 0; left: 0; height:200px; width:200px; overflow:hidden; }',
      '#{{k}}_bd span.{{k}}_pinContainer span.{{k}}_play { background: transparent url(http://passets-cdn.pinterest.com/images/bm/play.png) 50% 50% no-repeat; }',
      '#{{k}}_bd span.{{k}}_pinContainer cite, #{{k}}_bd span.{{k}}_pinContainer cite span { position: absolute; bottom: 0; left: 0; right: 0; width: 200px; color: #000; height: 22px; line-height: 24px; font-size: 10px; font-style: normal; text-align: center; overflow: hidden; }',
      '#{{k}}_bd span.{{k}}_pinContainer cite span.{{k}}_mask { background:#eee; opacity:.75; *filter:alpha(opacity=75); }',
      '#{{k}}_bd span.{{k}}_pinContainer cite span.{{k}}_youtube { background: transparent url(http://passets-cdn.pinterest.com/images/attrib/youtube.png) 180px 3px no-repeat; }',
      '#{{k}}_bd span.{{k}}_pinContainer a { text-decoration:none; background:transparent url(http://passets-cdn.pinterest.com/images/bm/button.png) 60px 300px no-repeat; cursor:pointer; position:absolute; top:0; left:0; height:200px; width:200px; }',
      '#{{k}}_bd span.{{k}}_pinContainer a { -moz-transition-property: background-color; -moz-transition-duration: .25s; -webkit-transition-property: background-color; -webkit-transition-duration: .25s; transition-property: background-color; transition-duration: .25s; }',
      '#{{k}}_bd span.{{k}}_pinContainer a:hover { background-position: 60px 80px; background-color:rgba(0, 0, 0, 0.5); }',
      '#{{k}}_bd span.{{k}}_pinContainer a.{{k}}_hideMe { background: rgba(128, 128, 128, .5); *background: #aaa; *filter:alpha(opacity=75); line-height: 200px; font-size: 10px; color: #fff; text-align: center; font-weight: normal!important; }'
    ].join(''),
    bookmarkletMarkup: [
      '<iframe width="100%" height="100%" id="{{k}}_shim" nopin="nopin"></iframe>',
      '<div id="{{k}}_bg"></div>',
      '<div id="{{k}}_bd">',
        '<div id="{{k}}_spacer"></div>',
        '<div id="{{k}}_hd">',
          '<a id="{{k}}_x">Cancel</a>',
          '<span id="{{k}}_logo"></span>',
        '</div>',
        '<span id="{{k}}_embedContainer"></span>',
        '<span id="{{k}}_imgContainer"></span>',
      '</div>'
    ].join(''),
    elementMarkup: [
      '<span class="{{k}}_pinContainer" id="{{k}}_thumb_{{src}}" domain="{{domain}}">',
        '<span class="img"><img nopin="nopin" src="{{src}}" onload="window.{{k}}.imgLoaded(event)"></span>',
        '<cite><span class="{{k}}_mask"></span><span class="{{k}}{{specialClass}}">{{width}} x {{height}}</span></cite>',
        '<a class="{{k}}_pinThis" rel="{{media}}" href="#" pindesc="{{title}}" pinimg="{{src}}" pinurl="{{pinurl}}"></a>',
      '</span>'
    ].join('')
  }
}));
