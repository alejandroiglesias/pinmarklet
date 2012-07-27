(function (window, document, config) {
  'use strict';

  var Pinmarklet = window[config.k] = {
  
    config: config,
    doc: {},
    hazAtLeastOneGoodThumb: 0,
    hazPinningNow: false,
    saveScrollTop: null,
    tag: [],


    /*
     * Gets the attribute of a element.
     *
     * @param el    Element.
     * @param attr  Attribute to retrieve.
     */
    get: function (el, attr) {
      return (typeof el[attr] === "string") ? el[attr] : el.getAttribute(attr);
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
      if (this.doc.head) {
        this.doc.head.removeChild(this.doc.styl);
      }
      if (this.doc.body) {
        this.doc.body.removeChild(this.doc.bg);
        this.doc.body.removeChild(this.doc.bd);
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
      var styles = this.template(this.config.templates.styles, { k: this.config.k });
      if (this.doc.head) {
        this.doc.head.innerHTML += styles;
      }
      else {
        this.doc.body.innerHTML += styles;
      }
      this.doc.styl = document.getElementById(this.config.k + '_style');
    },
    
    
    /*
     * Adds a element as selectable to pin.
     */
    thumb: function (opts) {
      if ( ! opts.src) {
        return;
      }
      document.getElementById(this.config.k + '_imgContainer').innerHTML += this.template(this.config.templates.elementMarkup, opts);
      this.hazAtLeastOneGoodThumb++;
    },
    
    
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
     *
     */
    hazTag: function (tag) {
      if (tag.height < this.config.minImgSize || tag.width < this.config.minImgSize) {
        return;
      }
      this.thumb({
        k: this.config.k,
        src: this.get(tag, 'src'),
        height: tag.height,
        width: tag.width,
        title: this.get(tag, 'title') || document.title,
        domain: window.location.hostname
      });
    },
    
    
    /*
     * Checks document tags for pinneable elements.
     */
    checkTags: function () {
      var tag;
      var tags;
      for (var i = 0; i < this.config.check.length; i++) {
        tags = document.getElementsByTagName(this.config.check[i]);
        for (var j = 0; j < tags.length; j++) {
          if ( ! this.get(tags[j], 'nopin') && tags[j].style.display !== 'none' && tags[j].style.visibility !== 'hidden') {
            this.tag.push(tags[j]);
          }
        }
      }
      for (var k = 0; k < this.tag.length; k++) {
        tag = this.tag[k];
        this.hazTag(tag);
      }
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
      this.doc.body.innerHTML += this.template(this.config.templates.bookmarkletMarkup, { k: this.config.k });
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
     * Checks if document is valid for pinning.
     * Only calls checkTags() for now.
     * Maybe more checks done by this method in the future or maybe will be removed.
     */
    checkPage: function () {
      this.checkTags();
      
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
      this.doc.head = document.getElementsByTagName('HEAD')[0];
      this.doc.body = document.getElementsByTagName('BODY')[0];
      
      // Checks the document is a valid page.
      if ( ! this.doc.body) {
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
      this.presentation();
      this.structure();
      if ( ! this.checkPage() || ! this.hazAtLeastOneGoodThumb || ! this.tag.length) {
        this.close(this.config.msg.notFound);
        return;
      }
      this.behavior();
    }

  };


  Pinmarklet.init();

}(window, document, {
  k: 'PIN_' + Date.now(),
  pin: 'http://google.com',
  minImgSize: 80,
  thumbCellSize: 200,
  check: ['img'],
  msg: {
    noPinIncompletePage: "Sorry, can't pin from non-HTML pages. If you're trying to upload an image, please visit pinterest.com.",
    notFound: "Sorry, couldn't find any pinnable images or video on this page."
  },
  pop: 'status=no,resizable=yes,scrollbars=yes,personalbar=no,directories=no,location=no,toolbar=no,menubar=no,width=632,height=270,left=0,top=0',
  templates: {
    styles: [
      '<style type="text/css" id="{{k}}_style">',
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
        '#{{k}}_bd span.{{k}}_pinContainer a.{{k}}_hideMe { background: rgba(128, 128, 128, .5); *background: #aaa; *filter:alpha(opacity=75); line-height: 200px; font-size: 10px; color: #fff; text-align: center; font-weight: normal!important; }',
      '</style>'
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
        '<cite><span class="{{k}}_mask"></span><span>{{width}} x {{height}}</span></cite>',
        '<a class="{{k}}_pinThis" rel="image" href="#" pindesc="{{title}}" pinimg="{{src}}"></a>',
      '</span>'
    ].join('')
  }
}));
