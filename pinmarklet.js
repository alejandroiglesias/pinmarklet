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


    /*
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
    
    
    /*
    * Adds a event listener.
    *
    * @param el         Element to attach event to.
    * @param eventType  Event type.
    * @param callback   Event callback.
    */
    listen: function (el, eventType, callback) {
      if (el.addEventListener) {
        el.addEventListener(eventType, callback, false);
      }
      else if (el.attachEvent) {
        el.attachEvent('on' + eventType, callback);
      }
    },
    
    
    /*
    * Opens the pin popup for a element.
    *
    * @param el  Element to pin.
    */
    pin: function (el) {
      console.log(el);
      window.open(this.config.pin, '_blank', this.config.pop);
    },
    
    
    /*
    * Closes the bookmarklet and cleans up the DOM.
    */
    close: function (msg) {
      if (document.head) {
        document.head.removeChild(this.doc.styl);
      }
      if (document.body) {
        document.body.removeChild(this.doc.main);
      }
      window.hazPinningNow = false;
      if (msg) {
        window.alert(msg);
      }
      window.scroll(0, this.saveScrollTop);
    },
    
    
    /*
    * Adds event listeners to DOM.
    */
    behavior: function () {
      var that = this;
      
      // Click events.
      this.listen(document, 'click', function (event) {
        event = event || window.event;
        
        // Clicking the Cancel button closes bookmarklet.
        if (event.target.id === that.config.k + '_x') {
          that.close();
        }
        if (event.target.className === that.config.k + '_pinThis') {
          that.pin(event.target);
          window.setTimeout(function () {
            that.close();
          }, 10);
        }
      });
      
      // Pressing the Esc key closes bookmarklet.
      this.listen(document, 'keydown', function (event) {
        if ((event || window.event).keyCode === 27) {
          that.close();
        }
      });
    },
    
    
    /*
    * Adds styles to DOM.
    */
    presentation: function () {
      var style = document.createElement('style');
      
      this.attribute(style, 'type', 'text/css');
      this.attribute(style, 'id', this.config.k + '_style');
      style.innerHTML = this.template(this.config.templates.styles, { k: this.config.k });
      if (document.head) {
        document.head.appendChild(style);
      }
      else {
        this.doc.main.appendChild(style);
      }
      this.doc.styl = style;
    },
    
    
    /*
    * Adds a element as selectable to pin.
    */
    thumb: function (opts) {
      if ( ! opts.src || this.thumbed.indexOf(opts.src) !== -1) {
        return;
      }
      opts.domain = opts.domain || null;
      opts.specialClass = opts.provider ? '_' + opts.provider : null;
      opts.pinurl = opts.pinurl || null;
      document.getElementById(this.config.k + '_imgContainer').innerHTML += this.template(this.config.templates.elementMarkup, opts);
      this.hazAtLeastOneGoodThumb += 1;
      this.thumbed.push(opts.src);
    },
    
    
//    call: function (url, callback) {
//      var format = 'json';
//      var http = false;
//
      //Use IE's ActiveX items to load the file.
//      if (typeof ActiveXObject !== 'undefined') {
//        try {http = new ActiveXObject("Msxml2.XMLHTTP");}
//        catch (e) {
//          try { http = new ActiveXObject("Microsoft.XMLHTTP"); }
//          catch (e) { http = false; }
//        }
      //If ActiveX is not available, use the XMLHttpRequest of Firefox/Mozilla etc. to load the document.
//      }
//      else if (window.XMLHttpRequest) {
//        try { http = new XMLHttpRequest(); }
//        catch (e) { http = false; }
//      }
//
//      if ( ! http || ! url) {
//        return;
//      }
//      if (http.overrideMimeType) {
//        http.overrideMimeType('text/xml');
//      }
//
      //Kill the Cache problem in IE.
//      var now = "uid=" + new Date().getTime();
//      url += (url.indexOf("?")+1) ? "&" : "?";
//      url += now;
//
//      http.open("GET", url, true);
//
//      http.onreadystatechange = function () {//Call a function when the state changes.
//        if (http.readyState === 4) {//Ready State will be 4 when the document is loaded.
//          if (http.status === 200) {
//            var result = "";
//            if (http.responseText) {
//              result = http.responseText;
//            }
//
            //If the return is in JSON format, eval the result before returning it.
//            if (format.charAt(0) === "j") {
              //\n's in JSON string, when evaluated will create errors in IE
//              result = result.replace(/[\n\r]/g,"");
//              result = eval('('+result+')');
//            }
//
            //Give the data to the callback function.
//            if (callback) {
//              callback(result);
//            }
//          }
//        }
//      };
//      http.send(null);
//    },
    
    
//    getExtendedInfo: function (params) {
//      if ( ! this.hazCalledForInfo[params]) {
//        this.call(this.config.embed + params, function (asdf) {
//          console.log('call', asdf);
//        });
//      }
//    },
    
    
    seekCanonical: function (site) {
      var canonical = {};
      var seeksite = this.config.seek[site];
      var meta = document.head.getElementsByTagName(seeksite.tagName);
      
      for (var i in seeksite.field) {
        for (var j = 0; j < meta.length; j += 1) {
          if (this.attribute(meta[j], seeksite.property) === i) {
            canonical[seeksite.field[i]] = this.attribute(meta[j], seeksite.content);
          }
        }
      }
      if (Object.keys(canonical).length) {
        this.hazCanonical = true;
      }
      this.thumb({
        k: this.config.k,
        media: seeksite.media,
        provider: site,
        src: canonical.pImg,
        title: canonical.pTitle,
        height: canonical.pHeight,
        width: canonical.pWidth
      });
      
      return canonical;
    },
    
    
    hazUrl: {
      youtube: function () {
        Pinmarklet.seekCanonical('youtube');
      }
    },
    
    
    hazSite: {
      youtube: {
        img: function (z) {
        
        },
        iframe: function (z) {
        
        },
        video: function (z) {
        
        },
        embed: function (z) {
          var id;
          var props;
          props = this.attribute(z, 'flashvars');
          if (props) {
            id = props.split('video_id='[1]);
            if (id) {
              id = id.split('&')[0];
            }
          }
          else {
            id = this.getId({ u: z.src });
          }
          console.log(id);
        },
        object: function (z) {
        
        }
      }
    },
    
    
    /*
    * Callback executed when the pinnable image is loaded to adjust its size.
    */
    imgLoaded: function (event) {
      var el = event.target;
      var w = event.target.width;
      var h = event.target.height;
      
      if (el.width === el.height) {
        el.width = el.height = this.config.thumbCellSize;
      }
      if (el.height > el.width) {
        el.width = this.config.thumbCellSize;
        el.height = this.config.thumbCellSize * (el.height / el.width);
        el.style.marginTop = 0 - (el.height - this.config.thumbCellSize) / 2 + 'px';
      }
      if (el.height < el.width) {
        el.height = this.config.thumbCellSize;
        el.width  = this.config.thumbCellSize * (el.width / el.height);
        el.style.marginLeft = 0 - (el.width - this.config.thumbCellSize) / 2 + 'px';
      }
    },
    
    
    /*
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
      }
    },
    
    
    /*
    * Checks document tags for pinneable elements.
    */
    checkTags: function () {
      var tag;
      var tags;
      var tagName;
      
      for (var i = 0; i < this.config.check.length; i++) {
        tags = document.getElementsByTagName(this.config.check[i]);
        for (var j = 0; j < tags.length; j++) {
          if ( ! this.attribute(tags[j], 'nopin') && tags[j].style.display !== 'none' && tags[j].style.visibility !== 'hidden') {
            this.tag.push(tags[j]);
          }
        }
      }
      for (var k = 0; k < this.tag.length; k++) {
        tag = this.tag[k];
        tagName = tag.tagName.toLowerCase();
        if (this.hazTag[tagName]) {
          this.hazTag[tagName](tag);
        }
      }
      
      return Boolean(this.tag.length);
    },
        
    
    /*
    * Gets the max height of the document.
    */
    getHeight: function () {
      return Math.max(
        Math.max(document.body.scrollHeight),
        Math.max(document.body.offsetHeight),
        Math.max(document.body.clientHeight)
      );
    },
    
    
    /*
    * Adds markup to DOM.
    */
    structure: function () {
      var height;
      var mainContainer;
      
      // Creating a wrapper this way avoids reflow.
      mainContainer = document.createElement('div');
      this.attribute(mainContainer, 'id', this.config.k + '_mainContainer');
      mainContainer.innerHTML = this.template(this.config.templates.bookmarkletMarkup, { k: this.config.k });
      document.body.appendChild(mainContainer);
      this.doc.main = mainContainer;
      this.doc.bg = document.getElementById(this.config.k + '_bg');
      this.doc.bd = document.getElementById(this.config.k + '_bd');
      height = this.getHeight();
      if (this.doc.bd.offsetHeight < height) {
        this.doc.bd.style.height = height + 'px';
        this.doc.bg.style.height = height + 'px';
      }
      window.scroll(0, 0);
    },
    
    
    /*
    * Checks if the page is one of the special URL. If so, special thumbs are generated.
    */
    checkUrl: function () {
      var i;
      var found = false;
      
      for (i in this.config.url) {
        if (document.URL.match(this.config.url[i])) {
          this.hazUrl[i]();
          found = true;
        }
      }
      
      return found;
    },
    
    
    /*
    * Checks if document is valid for pinning.
    * Only calls checkTags() for now.
    * Maybe more checks done by this method in the future or maybe will be removed.
    */
    checkPage: function () {
      if ( ! this.checkUrl()) {
        this.checkTags();
      }
      
      return true;
    },
    

    /*
    * Renders a template.
    * Uses Tim, a tiny, secure JavaScript micro-templating script.
    * https://github.com/premasagar/tim
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
    
    
    /*
    * Bootstraps the bookmarklet.
    *
    * @param config  Config object with setting used through the code.
    */
    init: function () {
      // Checks the document is a valid page.
      if ( ! document.body) {
        this.close(this.config.msg.noPinIncompletePage);
        return;
      }
      
      // Checks bookmarklet is not currently shown.
      if (window.hazPinningNow === true) {
        return;
      }
      window.hazPinningNow = true;
      this.saveScrollTop = window.pageYOffset;

      // Renders the UI.
      this.structure();
      this.presentation();
      this.checkPage();
      if ( ! this.hazCanonical && ( ! this.hazAtLeastOneGoodThumb || ! this.tag.length)) {
        this.close(this.config.msg.notFound);
        return;
      }
      this.behavior();
    }

  };


  Pinmarklet.init();

}(window, document, {
  k: 'PIN_' + Date.now(),
  embed: '//clients.vulsai.com/vulsai/pinterest/bookmarklet/webservice.php?',
  pin: '//google.com',
  minImgSize: 80,
  thumbCellSize: 200,
  check: ['img', 'embed', 'iframe'],
  url: {
    youtube: /^https?:\/\/www\.youtube\.com\/watch\?/
  },
  seek: {
    youtube: {
      media: 'video',
      tagName: "meta",
      property: "property",
      content: "content",
      field: {
        "og:title": "pTitle",
//        "og:type": "pId",
        "og:url": "pUrl",
        "og:image": "pImg",
        'og:video:width': 'pWidth',
        'og:video:height': 'pHeight'
      }
    }
  },
  msg: {
    noPinIncompletePage: "Sorry, can't pin from non-HTML pages. If you're trying to upload an image, please visit pinterest.com.",
    notFound: "Sorry, couldn't find any pinnable images or video on this page."
  },
  pop: 'status=no,resizable=yes,scrollbars=yes,personalbar=no,directories=no,location=no,toolbar=no,menubar=no,width=632,height=270,left=0,top=0',
  templates: {
    styles: [
      //'#{{k}}_shim {z-index:2147483640; position: absolute; background: transparent; top:0; right:0; bottom:0; left:0; width: 100%; border: 0;}',
      '#{{k}}_bg {z-index:2147483641; position: absolute; top:0; right:0; bottom:0; left:0; background-color:#f2f2f2; opacity:.95; width: 100%; }',
      '#{{k}}_bd {z-index:2147483642; position: absolute; text-align: center; width: 100%; top: 0; left: 0; right: 0; font:16px hevetica neue,arial,san-serif; }',
      '#{{k}}_bd #{{k}}_hd { z-index:2147483643; -moz-box-shadow: 0 1px 2px #aaa; -webkit-box-shadow: 0 1px 2px #aaa; box-shadow: 0 1px 2px #aaa; position: fixed; *position:absolute; width:100%; top: 0; left: 0; right: 0; height: 45px; line-height: 45px; font-size: 14px; font-weight: bold; display: block; margin: 0; background: #fbf7f7; border-bottom: 1px solid #aaa; }',
      '#{{k}}_bd #{{k}}_hd a#{{k}}_x { display: inline-block; cursor: pointer; color: #524D4D; line-height: 45px; text-shadow: 0 1px #fff; float: right; text-align: center; width: 100px; border-left: 1px solid #aaa; }',
      '#{{k}}_bd #{{k}}_hd a#{{k}}_x:hover { color: #524D4D; background: #e1dfdf; text-decoration: none; }',
      '#{{k}}_bd #{{k}}_hd a#{{k}}_x:active { color: #fff; background: #cb2027; text-decoration: none; text-shadow:none;}',
      '#{{k}}_bd #{{k}}_hd #{{k}}_logo {height: 43px; width: 100px; display: inline-block; margin-right: -100px; background: transparent url(http://passets-cdn.pinterest.com/images/LogoRed.png) 50% 50% no-repeat; border: none;}',
      '@media only screen and (-webkit-min-device-pixel-ratio: 2) { #{{k}}_bd #{{k}}_hd #{{k}}_logo {background-size: 100px 26px; background-image: url(http://passets-cdn.pinterest.com/images/LogoRed.2x.png); } }',
      '#{{k}}_bd #{{k}}_spacer { display: block; height: 50px; }',
      '#{{k}}_bd span.{{k}}_pinContainer { height:200px; width:200px; display:inline-block; background:#fff; position:relative; -moz-box-shadow:0 0  2px #555; -webkit-box-shadow: 0 0  2px #555; box-shadow: 0 0  2px #555; margin: 10px; }',
      '#{{k}}_bd span.{{k}}_pinContainer { zoom:1; *border: 1px solid #aaa; }',
      '#{{k}}_bd span.{{k}}_pinContainer img { margin:0; padding:0; border:none; }',
      '#{{k}}_bd span.{{k}}_pinContainer span.img, #{{k}}_bd span.{{k}}_pinContainer span.{{k}}_play { position: absolute; top: 0; left: 0; height:200px; width:200px; overflow:hidden; }',
      '#{{k}}_bd span.{{k}}_pinContainer span.{{k}}_play { background: transparent url(http://passets-cdn.pinterest.com/images/bm/play.png) 50% 50% no-repeat; }',
      '#{{k}}_bd span.{{k}}_pinContainer cite, #{{k}}_bd span.{{k}}_pinContainer cite span { position: absolute; bottom: 0; left: 0; right: 0; width: 200px; color: #000; height: 22px; line-height: 24px; font-size: 10px; font-style: normal; text-align: center; overflow: hidden; }',
      '#{{k}}_bd span.{{k}}_pinContainer cite span.{{k}}_mask { background:#eee; opacity:.75; *filter:alpha(opacity=75); }',
      //'#{{k}}_bd span.{{k}}_pinContainer cite span.{{k}}_behance { background: transparent url(http://passets-cdn.pinterest.com/images/attrib/behance.png) 180px 3px no-repeat; }',
      //'#{{k}}_bd span.{{k}}_pinContainer cite span.{{k}}_flickr { background: transparent url(http://passets-cdn.pinterest.com/images/attrib/flickr.png) 182px 3px no-repeat; }',
      //'#{{k}}_bd span.{{k}}_pinContainer cite span.{{k}}_fivehundredpx { background: transparent url(http://passets-cdn.pinterest.com/images/attrib/fivehundredpx.png) 180px 3px no-repeat; }',
      //'#{{k}}_bd span.{{k}}_pinContainer cite span.{{k}}_kickstarter { background: transparent url(http://passets-cdn.pinterest.com/images/attrib/kickstarter.png) 182px 3px no-repeat; }',
      //'#{{k}}_bd span.{{k}}_pinContainer cite span.{{k}}_slideshare { background: transparent url(http://passets-cdn.pinterest.com/images/attrib/slideshare.png) 182px 3px no-repeat; }',
      //'#{{k}}_bd span.{{k}}_pinContainer cite span.{{k}}_soundcloud { background: transparent url(http://passets-cdn.pinterest.com/images/attrib/soundcloud.png) 182px 3px no-repeat; }',
      //'#{{k}}_bd span.{{k}}_pinContainer cite span.{{k}}_vimeo { background: transparent url(http://passets-cdn.pinterest.com/images/attrib/vimeo.png) 180px 3px no-repeat; }',
      //'#{{k}}_bd span.{{k}}_pinContainer cite span.{{k}}_vimeo_s { background: transparent url(http://passets-cdn.pinterest.com/images/attrib/vimeo.png) 180px 3px no-repeat; }',
      '#{{k}}_bd span.{{k}}_pinContainer cite span.{{k}}_youtube { background: transparent url(http://passets-cdn.pinterest.com/images/attrib/youtube.png) 180px 3px no-repeat; }',
      '#{{k}}_bd span.{{k}}_pinContainer a { text-decoration:none; background:transparent url(http://passets-cdn.pinterest.com/images/bm/button.png) 60px 300px no-repeat; cursor:pointer; position:absolute; top:0; left:0; height:200px; width:200px; }',
      '#{{k}}_bd span.{{k}}_pinContainer a { -moz-transition-property: background-color; -moz-transition-duration: .25s; -webkit-transition-property: background-color; -webkit-transition-duration: .25s; transition-property: background-color; transition-duration: .25s; }',
      '#{{k}}_bd span.{{k}}_pinContainer a:hover { background-position: 60px 80px; background-color:rgba(0, 0, 0, 0.5); }',
      '#{{k}}_bd span.{{k}}_pinContainer a.{{k}}_hideMe { background: rgba(128, 128, 128, .5); *background: #aaa; *filter:alpha(opacity=75); line-height: 200px; font-size: 10px; color: #fff; text-align: center; font-weight: normal!important; }'
    ].join(''),
    bookmarkletMarkup: [
      '<div id="{{k}}_bg" style="height: 1453px; "></div>',
      '<div id="{{k}}_bd" style="height: 1453px; ">',
        '<div id="{{k}}_spacer"></div>',
        '<div id="{{k}}_hd">',
          '<span id="{{k}}_logo"></span>',
          '<a id="{{k}}_x">Cancel</a>',
        '</div>',
        '<span id="{{k}}_embedContainer"></span>',
        '<span id="{{k}}_imgContainer"></span>',
      '</div>'
    ].join(''),
    elementMarkup: [
      '<span class="{{k}}_pinContainer" id="{{k}}_thumb_{{src}}" domain="{{domain}}">',
        '<span class="img"><img nopin="nopin" style="margin-left: -26.5px;" src="{{src}}" onload="window.{{k}}.imgLoaded(event)"></span>',
//        '<span class="{{k}}_play"></span>',
        '<cite><span class="{{k}}_mask"></span><span class="{{k}}{{specialClass}}">{{width}} x {{height}}</span></cite>',
        '<a class="{{k}}_pinThis" rel="{{media}}" href="#" pindesc="{{title}}" pinimg="{{src}}" pinurl="{{pinurl}}"></a>',
      '</span>'
    ].join('')
  }
}));
