/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright (c) 2011 Mozilla Foundation

    Contributors: Andreas Gal 
                  Chris G Jones 
                  Shaon Barman
                  Vivien Nicolas 
                  Justin D'Arcangelo
                  Yury Delendik
                  Kalervo Kujala
                  Adil Allawi 
                  Jakob Miland 
                  Artur Adib
                  Brendan Dahl

    Permission is hereby granted, free of charge, to any person obtaining a
    copy of this software and associated documentation files (the "Software"),
    to deal in the Software without restriction, including without limitation
    the rights to use, copy, modify, merge, publish, distribute, sublicense,
    and/or sell copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
    THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
    DEALINGS IN THE SOFTWARE.
*/

'use strict';

var kDefaultURL = '';
var kDefaultScale = 'auto';
var kDefaultScaleDelta = 1.1;
var kUnknownScale = 0;
var kCacheSize = 20;
var kCssUnits = 96.0 / 72.0;
var kScrollbarPadding = 40;
var kMinScale = 0.25;
var kMaxScale = 4.0;
var kImageDirectory = './images/';
var kSettingsMemory = 20;

var Cache = function cacheCache(size) {
  var data = [];
  this.push = function cachePush(view) {
    var i = data.indexOf(view);
    if (i >= 0)
      data.splice(i);
    data.push(view);
    if (data.length > size)
      data.shift().update();
  };
};

var RenderingQueue = (function RenderingQueueClosure() {
  function RenderingQueue() {
    this.items = [];
  }

  RenderingQueue.prototype = {
    enqueueDraw: function RenderingQueueEnqueueDraw(item) {
      if (!item.drawingRequired())
        return; // as no redraw required, no need for queueing.

      if ('rendering' in item)
        return; // is already in the queue

      item.rendering = true;
      this.items.push(item);
      if (this.items.length > 1)
        return; // not first item

      item.draw(this.continueExecution.bind(this));
    },
    continueExecution: function RenderingQueueContinueExecution() {
      var item = this.items.shift();
      delete item.rendering;

      if (this.items.length == 0)
        return; // queue is empty

      item = this.items[0];
      item.draw(this.continueExecution.bind(this));
    }
  };

  return RenderingQueue;
})();

var FirefoxCom = (function FirefoxComClosure() {
  return {
    /**
     * Creates an event that hopefully the extension is listening for and will
     * synchronously respond to.
     * @param {String} action The action to trigger.
     * @param {String} data Optional data to send.
     * @return {*} The response.
     */
    request: function(action, data) {
      var request = document.createTextNode('');
      request.setUserData('action', action, null);
      request.setUserData('data', data, null);
      document.documentElement.appendChild(request);

      var sender = document.createEvent('Events');
      sender.initEvent('pdf.js.message', true, false);
      request.dispatchEvent(sender);
      var response = request.getUserData('response');
      document.documentElement.removeChild(request);
      return response;
    }
  };
})();

// Settings Manager - This is a utility for saving settings
// First we see if localStorage is available
// If not, we use FUEL in FF
var Settings = (function SettingsClosure() {
  var isLocalStorageEnabled = (function localStorageEnabledTest() {
    // Feature test as per http://diveintohtml5.info/storage.html
    // The additional localStorage call is to get around a FF quirk, see
    // bug #495747 in bugzilla
    try {
      return 'localStorage' in window && window['localStorage'] !== null &&
          localStorage;
    } catch (e) {
      return false;
    }
  })();

  var isFirefoxExtension = PDFJS.isFirefoxExtension;

  function Settings(fingerprint) {
    var database = null;
    var index;
    if (isFirefoxExtension)
      database = FirefoxCom.request('getDatabase', null);
    else if (isLocalStorageEnabled)
      database = localStorage.getItem('database') || '{}';
    else
      return false;

    database = JSON.parse(database);
    if (!('files' in database))
      database.files = [];
    if (database.files.length >= kSettingsMemory)
      database.files.shift();
    for (var i = 0, length = database.files.length; i < length; i++) {
      var branch = database.files[i];
      if (branch.fingerprint == fingerprint) {
        index = i;
        break;
      }
    }
    if (typeof index != 'number')
      index = database.files.push({fingerprint: fingerprint}) - 1;
    this.file = database.files[index];
    this.database = database;
    if (isLocalStorageEnabled)
      localStorage.setItem('database', JSON.stringify(database));
  }

  Settings.prototype = {
    set: function settingsSet(name, val) {
      if (!('file' in this))
        return false;

      var file = this.file;
      file[name] = val;
      var database = JSON.stringify(this.database);
      if (isFirefoxExtension)
        FirefoxCom.request('setDatabase', database);
      else if (isLocalStorageEnabled)
        localStorage.setItem('database', database);
    },

    get: function settingsGet(name, defaultValue) {
      if (!('file' in this))
        return defaultValue;

      return this.file[name] || defaultValue;
    }
  };

  return Settings;
})();

var cache = new Cache(kCacheSize);
var renderingQueue = new RenderingQueue();
var currentPageNumber = 1;

var PDFView = {
  pages: [],
  thumbnails: [],
  currentScale: kUnknownScale,
  currentScaleValue: null,
  initialBookmark: document.location.hash.substring(1),

  setScale: function pdfViewSetScale(val, resetAutoSettings) {
    if (val == this.currentScale)
      return;

    var pages = this.pages;
    for (var i = 0; i < pages.length; i++)
      pages[i].update(val * kCssUnits);

    if (this.currentScale != val)
      this.pages[this.page - 1].scrollIntoView();
    this.currentScale = val;

    var event = document.createEvent('UIEvents');
    event.initUIEvent('scalechange', false, false, window, 0);
    event.scale = val;
    event.resetAutoSettings = resetAutoSettings;
    window.dispatchEvent(event);
  },

  parseScale: function pdfViewParseScale(value, resetAutoSettings) {
    if ('custom' == value)
      return;

    var scale = parseFloat(value);
    this.currentScaleValue = value;
    if (scale) {
      this.setScale(scale, true);
      return;
    }

    var currentPage = this.pages[this.page - 1];
    var pageWidthScale = (window.innerWidth - kScrollbarPadding) /
                          currentPage.width / kCssUnits;
    var pageHeightScale = (window.innerHeight - kScrollbarPadding) /
                           currentPage.height / kCssUnits;
    if ('page-width' == value)
      this.setScale(pageWidthScale, resetAutoSettings);
    if ('page-height' == value)
      this.setScale(pageHeightScale, resetAutoSettings);
    if ('page-fit' == value) {
      this.setScale(
        Math.min(pageWidthScale, pageHeightScale), resetAutoSettings);
    }
    if ('auto' == value)
      this.setScale(Math.min(1.0, pageWidthScale), resetAutoSettings);

    selectScaleOption(value);
  },

  zoomIn: function pdfViewZoomIn() {
    var newScale = Math.min(kMaxScale, this.currentScale * kDefaultScaleDelta);
    this.parseScale(newScale, true);
  },

  zoomOut: function pdfViewZoomOut() {
    var newScale = Math.max(kMinScale, this.currentScale / kDefaultScaleDelta);
    this.parseScale(newScale, true);
  },

  set page(val) {
    var pages = this.pages;
    var input = document.getElementById('pageNumber');
    if (!(0 < val && val <= pages.length)) {
      var event = document.createEvent('UIEvents');
      event.initUIEvent('pagechange', false, false, window, 0);
      event.pageNumber = this.page;
      window.dispatchEvent(event);
      return;
    }

    currentPageNumber = val;
    var event = document.createEvent('UIEvents');
    event.initUIEvent('pagechange', false, false, window, 0);
    event.pageNumber = val;
    window.dispatchEvent(event);

    // checking if the this.page was called from the updateViewarea function:
    // avoiding the creation of two "set page" method (internal and public)
    if (updateViewarea.inProgress)
      return;

    // Avoid scrolling the first page during loading
    if (this.loading && val == 1)
      return;

    pages[val - 1].scrollIntoView();
  },

  get page() {
    return currentPageNumber;
  },

  open: function pdfViewOpen(url, scale) {
 //   document.title = this.url = url;

    var self = this;
    PDFJS.getPdf(
      {
        url: url,
        progress: function getPdfProgress(evt) {
          if (evt.lengthComputable)
            self.progress(evt.loaded / evt.total);
        },
        error: function getPdfError(e) {
          var loadingIndicator = document.getElementById('loading');
          loadingIndicator.textContent = 'Error';
          var moreInfo = {
            message: 'Unexpected server response of ' + e.target.status + '.'
          };
          self.error('An error occurred while loading the PDF.', moreInfo);
        }
      },
      function getPdfLoad(data) {
        self.loading = true;
        self.load(data, scale);
        self.loading = false;
      });
  },

  download: function pdfViewDownload() {
    var url = this.url.split('#')[0];
    if (PDFJS.isFirefoxExtension) {
      FirefoxCom.request('download', url);
    } else {
      url += '#pdfjs.action=download', '_parent';
      window.open(url, '_parent');
    }
  },

  navigateTo: function pdfViewNavigateTo(dest) {
    if (typeof dest === 'string')
      dest = this.destinations[dest];
    if (!(dest instanceof Array))
      return; // invalid destination
    // dest array looks like that: <page-ref> </XYZ|FitXXX> <args..>
    var destRef = dest[0];
    var pageNumber = destRef instanceof Object ?
      this.pagesRefMap[destRef.num + ' ' + destRef.gen + ' R'] : (destRef + 1);
    if (pageNumber) {
      this.page = pageNumber;
      var currentPage = this.pages[pageNumber - 1];
      currentPage.scrollIntoView(dest);
    }
  },

  getDestinationHash: function pdfViewGetDestinationHash(dest) {
    if (typeof dest === 'string')
      return PDFView.getAnchorUrl('#' + escape(dest));
    if (dest instanceof Array) {
      var destRef = dest[0]; // see navigateTo method for dest format
      var pageNumber = destRef instanceof Object ?
        this.pagesRefMap[destRef.num + ' ' + destRef.gen + ' R'] :
        (destRef + 1);
      if (pageNumber) {
        var pdfOpenParams = PDFView.getAnchorUrl('#page=' + pageNumber);
        var destKind = dest[1];
        if ('name' in destKind && destKind.name == 'XYZ') {
          var scale = (dest[4] || this.currentScale);
          pdfOpenParams += '&zoom=' + (scale * 100);
          if (dest[2] || dest[3]) {
            pdfOpenParams += ',' + (dest[2] || 0) + ',' + (dest[3] || 0);
          }
        }
        return pdfOpenParams;
      }
    }
    return '';
  },

  /**
   * For the firefox extension we prefix the full url on anchor links so they
   * don't come up as resource:// urls and so open in new tab/window works.
   * @param {String} anchor The anchor hash include the #.
   */
  getAnchorUrl: function getAnchorUrl(anchor) {
    if (PDFJS.isFirefoxExtension)
      return this.url.split('#')[0] + anchor;
    return anchor;
  },

  /**
   * Show the error box.
   * @param {String} message A message that is human readable.
   * @param {Object} moreInfo (optional) Further information about the error
   *                            that is more technical.  Should have a 'message'
   *                            and optionally a 'stack' property.
   */
  error: function pdfViewError(message, moreInfo) {
    var errorWrapper = document.getElementById('errorWrapper');
    errorWrapper.removeAttribute('hidden');

    var errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;

    var closeButton = document.getElementById('errorClose');
    closeButton.onclick = function() {
      errorWrapper.setAttribute('hidden', 'true');
    };

    var errorMoreInfo = document.getElementById('errorMoreInfo');
    var moreInfoButton = document.getElementById('errorShowMore');
    var lessInfoButton = document.getElementById('errorShowLess');
    moreInfoButton.onclick = function() {
      errorMoreInfo.removeAttribute('hidden');
      moreInfoButton.setAttribute('hidden', 'true');
      lessInfoButton.removeAttribute('hidden');
    };
    lessInfoButton.onclick = function() {
      errorMoreInfo.setAttribute('hidden', 'true');
      moreInfoButton.removeAttribute('hidden');
      lessInfoButton.setAttribute('hidden', 'true');
    };
    moreInfoButton.removeAttribute('hidden');
    lessInfoButton.setAttribute('hidden', 'true');
    errorMoreInfo.value = 'PDF.JS Build: ' + PDFJS.build + '\n';

    if (moreInfo) {
      errorMoreInfo.value += 'Message: ' + moreInfo.message;
      if (moreInfo.stack) {
        errorMoreInfo.value += '\n' + 'Stack: ' + moreInfo.stack;
      } else {
        if (moreInfo.filename)
          errorMoreInfo.value += '\n' + 'File: ' + moreInfo.filename;
        if (moreInfo.lineNumber)
          errorMoreInfo.value += '\n' + 'Line: ' + moreInfo.lineNumber;
      }
    }
    errorMoreInfo.rows = errorMoreInfo.value.split('\n').length - 1;
  },

  progress: function pdfViewProgress(level) {
    var percent = Math.round(level * 100);
    var loadingIndicator = document.getElementById('loading');
    loadingIndicator.textContent = 'Loading... ' + percent + '%';
  },

  load: function pdfViewLoad(data, scale) {
    function bindOnAfterDraw(pageView, thumbnailView) {
      // when page is painted, using the image as thumbnail base
      pageView.onAfterDraw = function pdfViewLoadOnAfterDraw() {
        thumbnailView.setImage(pageView.canvas);
        preDraw();
      };
    }

    var errorWrapper = document.getElementById('errorWrapper');
    errorWrapper.setAttribute('hidden', 'true');

    var loadingIndicator = document.getElementById('loading');
    loadingIndicator.setAttribute('hidden', 'true');

    var sidebar = document.getElementById('sidebarView');
    sidebar.parentNode.scrollTop = 0;

    while (sidebar.hasChildNodes())
      sidebar.removeChild(sidebar.lastChild);

    if ('_loadingInterval' in sidebar)
      clearInterval(sidebar._loadingInterval);

    var container = document.getElementById('viewer');
    while (container.hasChildNodes())
      container.removeChild(container.lastChild);

    var pdf;
    try {
    // 	Mihalya mod. Data should be an arraybuffer
  //    var datas = Aes.Ctr.decrypt(data,"password",256);
	//		datas = datas.replace(/^\s+/,"").replace(/\s+$/,"");
	//		var databin = Base64Binary.decodeArrayBuffer(datas);
	  // end Mihalya mod
	  		pdf = new PDFJS.PDFDoc(data);
    } catch (e) {
      this.error('An error occurred while reading the PDF.', e);
    }
    var pagesCount = pdf.numPages;
    var id = pdf.fingerprint;
    var storedHash = null;
    document.getElementById('numPages').textContent = pagesCount;
    document.getElementById('pageNumber').max = pagesCount;
    PDFView.documentFingerprint = id;
    var store = PDFView.store = new Settings(id);
    if (store.get('exists', false)) {
      var page = store.get('page', '1');
      var zoom = store.get('zoom', PDFView.currentScale);
      var left = store.get('scrollLeft', '0');
      var top = store.get('scrollTop', '0');

      storedHash = 'page=' + page + '&zoom=' + zoom + ',' + left + ',' + top;
    }

    var pages = this.pages = [];
    var pagesRefMap = {};
    var thumbnails = this.thumbnails = [];
    for (var i = 1; i <= pagesCount; i++) {
      var page = pdf.getPage(i);
      var pageView = new PageView(container, page, i, page.width, page.height,
                                  page.stats, this.navigateTo.bind(this));
      var thumbnailView = new ThumbnailView(sidebar, page, i,
                                            page.width / page.height);
      bindOnAfterDraw(pageView, thumbnailView);

      pages.push(pageView);
      thumbnails.push(thumbnailView);
      var pageRef = page.ref;
      pagesRefMap[pageRef.num + ' ' + pageRef.gen + ' R'] = i;
    }

    this.pagesRefMap = pagesRefMap;
    this.destinations = pdf.catalog.destinations;

    if (pdf.catalog.documentOutline) {
      this.outline = new DocumentOutlineView(pdf.catalog.documentOutline);
      var outlineSwitchButton = document.getElementById('outlineSwitch');
      outlineSwitchButton.removeAttribute('disabled');
      this.switchSidebarView('outline');
    }

    // Reset the current scale, as otherwise the page's scale might not get
    // updated if the zoom level stayed the same.
    this.currentScale = 0;
    this.currentScaleValue = null;
    if (this.initialBookmark) {
      this.setHash(this.initialBookmark);
      this.initialBookmark = null;
    }
    else if (storedHash)
      this.setHash(storedHash);
    else if (scale) {
      this.parseScale(scale, true);
      this.page = 1;
    }

    if (PDFView.currentScale === kUnknownScale) {
      // Scale was not initialized: invalid bookmark or scale was not specified.
      // Setting the default one.
      this.parseScale(kDefaultScale, true);
    }
  },

  setHash: function pdfViewSetHash(hash) {
    if (!hash)
      return;

    if (hash.indexOf('=') >= 0) {
      // parsing query string
      var paramsPairs = hash.split('&');
      var params = {};
      for (var i = 0; i < paramsPairs.length; ++i) {
        var paramPair = paramsPairs[i].split('=');
        params[paramPair[0]] = paramPair[1];
      }
      // borrowing syntax from "Parameters for Opening PDF Files"
      if ('nameddest' in params) {
        PDFView.navigateTo(params.nameddest);
        return;
      }
      if ('page' in params) {
        var pageNumber = (params.page | 0) || 1;
        this.page = pageNumber;
        if ('zoom' in params) {
          var zoomArgs = params.zoom.split(','); // scale,left,top
          // building destination array

          // If the zoom value, it has to get divided by 100. If it is a string,
          // it should stay as it is.
          var zoomArg = zoomArgs[0];
          var zoomArgNumber = parseFloat(zoomArg);
          if (zoomArgNumber)
            zoomArg = zoomArgNumber / 100;

          var dest = [null, {name: 'XYZ'}, (zoomArgs[1] | 0),
            (zoomArgs[2] | 0), zoomArg];
          var currentPage = this.pages[pageNumber - 1];
          currentPage.scrollIntoView(dest);
        } else
          this.page = params.page; // simple page
        return;
      }
    } else if (/^\d+$/.test(hash)) // page number
      this.page = hash;
    else // named destination
      PDFView.navigateTo(unescape(hash));
  },

  switchSidebarView: function pdfViewSwitchSidebarView(view) {
    var thumbsScrollView = document.getElementById('sidebarScrollView');
    var outlineScrollView = document.getElementById('outlineScrollView');
    var thumbsSwitchButton = document.getElementById('thumbsSwitch');
    var outlineSwitchButton = document.getElementById('outlineSwitch');
    switch (view) {
      case 'thumbs':
        thumbsScrollView.removeAttribute('hidden');
        outlineScrollView.setAttribute('hidden', 'true');
        thumbsSwitchButton.setAttribute('data-selected', true);
        outlineSwitchButton.removeAttribute('data-selected');
        updateThumbViewArea();
        break;
      case 'outline':
        thumbsScrollView.setAttribute('hidden', 'true');
        outlineScrollView.removeAttribute('hidden');
        thumbsSwitchButton.removeAttribute('data-selected');
        outlineSwitchButton.setAttribute('data-selected', true);
        break;
    }
  },

  getVisiblePages: function pdfViewGetVisiblePages() {
    var pages = this.pages;
    var kBottomMargin = 10;
    var visiblePages = [];

    var currentHeight = kBottomMargin;
    var windowTop = window.pageYOffset;
    for (var i = 1; i <= pages.length; ++i) {
      var page = pages[i - 1];
      var pageHeight = page.height * page.scale + kBottomMargin;
      if (currentHeight + pageHeight > windowTop)
        break;

      currentHeight += pageHeight;
    }

    var windowBottom = window.pageYOffset + window.innerHeight;
    for (; i <= pages.length && currentHeight < windowBottom; ++i) {
      var singlePage = pages[i - 1];
      visiblePages.push({ id: singlePage.id, y: currentHeight,
                          view: singlePage });
      currentHeight += singlePage.height * singlePage.scale + kBottomMargin;
    }
    return visiblePages;
  },

  getVisibleThumbs: function pdfViewGetVisibleThumbs() {
    var thumbs = this.thumbnails;
    var kBottomMargin = 5;
    var visibleThumbs = [];

    var view = document.getElementById('sidebarScrollView');
    var currentHeight = kBottomMargin;
    var top = view.scrollTop;
    for (var i = 1; i <= thumbs.length; ++i) {
      var thumb = thumbs[i - 1];
      var thumbHeight = thumb.height * thumb.scaleY + kBottomMargin;
      if (currentHeight + thumbHeight > top)
        break;

      currentHeight += thumbHeight;
    }

    var bottom = top + view.clientHeight;
    for (; i <= thumbs.length && currentHeight < bottom; ++i) {
      var singleThumb = thumbs[i - 1];
      visibleThumbs.push({ id: singleThumb.id, y: currentHeight,
                          view: singleThumb });
      currentHeight += singleThumb.height * singleThumb.scaleY + kBottomMargin;
    }

    return visibleThumbs;
  }
};

var PageView = function pageView(container, content, id, pageWidth, pageHeight,
                                 stats, navigateTo) {
  this.id = id;
  this.content = content;

  var view = this.content.view;
  this.x = view.x;
  this.y = view.y;
  this.width = view.width;
  this.height = view.height;

  var anchor = document.createElement('a');
  anchor.name = '' + this.id;

  var div = document.createElement('div');
  div.id = 'pageContainer' + this.id;
  div.className = 'page';

  container.appendChild(anchor);
  container.appendChild(div);

  this.update = function pageViewUpdate(scale) {
    this.scale = scale || this.scale;
    div.style.width = (this.width * this.scale) + 'px';
    div.style.height = (this.height * this.scale) + 'px';

    while (div.hasChildNodes())
      div.removeChild(div.lastChild);
    div.removeAttribute('data-loaded');

    delete this.canvas;

    this.loadingIconDiv = document.createElement('div');
    this.loadingIconDiv.className = 'loadingIcon';
    div.appendChild(this.loadingIconDiv);
  };

  function setupAnnotations(content, scale) {
    function bindLink(link, dest) {
      link.href = PDFView.getDestinationHash(dest);
      link.onclick = function pageViewSetupLinksOnclick() {
        if (dest)
          PDFView.navigateTo(dest);
        return false;
      };
    }
    function createElementWithStyle(tagName, item) {
      var element = document.createElement(tagName);
      element.style.left = (Math.floor(item.x - view.x) * scale) + 'px';
      element.style.top = (Math.floor(item.y - view.y) * scale) + 'px';
      element.style.width = Math.ceil(item.width * scale) + 'px';
      element.style.height = Math.ceil(item.height * scale) + 'px';
      return element;
    }
    function createCommentAnnotation(type, item) {
      var container = document.createElement('section');
      container.className = 'annotComment';

      var image = createElementWithStyle('img', item);
      image.src = kImageDirectory + type.toLowerCase() + '.svg';
      var content = document.createElement('div');
      content.setAttribute('hidden', true);
      var title = document.createElement('h1');
      var text = document.createElement('p');
      var offsetPos = Math.floor(item.x - view.x + item.width);
      content.style.left = (offsetPos * scale) + 'px';
      content.style.top = (Math.floor(item.y - view.y) * scale) + 'px';
      title.textContent = item.title;

      if (!item.content) {
        content.setAttribute('hidden', true);
      } else {
        var e = document.createElement('span');
        var lines = item.content.split('\n');
        for (var i = 0, ii = lines.length; i < ii; ++i) {
          var line = lines[i];
          e.appendChild(document.createTextNode(line));
          if (i < (ii - 1))
            e.appendChild(document.createElement('br'));
        }
        text.appendChild(e);
        image.addEventListener('mouseover', function annotationImageOver() {
           this.nextSibling.removeAttribute('hidden');
        }, false);

        image.addEventListener('mouseout', function annotationImageOut() {
           this.nextSibling.setAttribute('hidden', true);
        }, false);
      }

      content.appendChild(title);
      content.appendChild(text);
      container.appendChild(image);
      container.appendChild(content);

      return container;
    }

    var items = content.getAnnotations();
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      switch (item.type) {
        case 'Link':
          var link = createElementWithStyle('a', item);
          link.href = item.url || '';
          if (!item.url)
            bindLink(link, ('dest' in item) ? item.dest : null);
          div.appendChild(link);
          break;
        case 'Text':
          var comment = createCommentAnnotation(item.name, item);
          if (comment)
            div.appendChild(comment);
          break;
      }
    }
  }

  this.getPagePoint = function pageViewGetPagePoint(x, y) {
    var scale = PDFView.currentScale;
    return this.content.rotatePoint(x / scale, y / scale);
  };

  this.scrollIntoView = function pageViewScrollIntoView(dest) {
      if (!dest) {
        div.scrollIntoView(true);
        return;
      }

      var x = 0, y = 0;
      var width = 0, height = 0, widthScale, heightScale;
      var scale = 0;
      switch (dest[1].name) {
        case 'XYZ':
          x = dest[2];
          y = dest[3];
          scale = dest[4];
          break;
        case 'Fit':
        case 'FitB':
          scale = 'page-fit';
          break;
        case 'FitH':
        case 'FitBH':
          y = dest[2];
          scale = 'page-width';
          break;
        case 'FitV':
        case 'FitBV':
          x = dest[2];
          scale = 'page-height';
          break;
        case 'FitR':
          x = dest[2];
          y = dest[3];
          width = dest[4] - x;
          height = dest[5] - y;
          widthScale = (window.innerWidth - kScrollbarPadding) /
            width / kCssUnits;
          heightScale = (window.innerHeight - kScrollbarPadding) /
            height / kCssUnits;
          scale = Math.min(widthScale, heightScale);
          break;
        default:
          return;
      }

      var boundingRect = [
        this.content.rotatePoint(x, y),
        this.content.rotatePoint(x + width, y + height)
      ];

      if (scale && scale !== PDFView.currentScale)
        PDFView.parseScale(scale, true);
      else if (PDFView.currentScale === kUnknownScale)
        PDFView.parseScale(kDefaultScale, true);

      setTimeout(function pageViewScrollIntoViewRelayout() {
        // letting page to re-layout before scrolling
        var scale = PDFView.currentScale;
        var x = Math.min(boundingRect[0].x, boundingRect[1].x);
        var y = Math.min(boundingRect[0].y, boundingRect[1].y);
        var width = Math.abs(boundingRect[0].x - boundingRect[1].x);
        var height = Math.abs(boundingRect[0].y - boundingRect[1].y);

        // using temporary div to scroll it into view
        var tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = Math.floor(x * scale) + 'px';
        tempDiv.style.top = Math.floor(y * scale) + 'px';
        tempDiv.style.width = Math.ceil(width * scale) + 'px';
        tempDiv.style.height = Math.ceil(height * scale) + 'px';
        div.appendChild(tempDiv);
        tempDiv.scrollIntoView(true);
        div.removeChild(tempDiv);
      }, 0);
  };

  this.drawingRequired = function() {
    return !div.querySelector('canvas');
  };

  this.draw = function pageviewDraw(callback) {
    if (!this.drawingRequired()) {
      this.updateStats();
      callback();
      return;
    }

    var canvas = document.createElement('canvas');
    canvas.id = 'page' + this.id;
    canvas.mozOpaque = true;
    div.appendChild(canvas);
    this.canvas = canvas;

    var textLayerDiv = null;
    if (!PDFJS.disableTextLayer) {
      textLayerDiv = document.createElement('div');
      textLayerDiv.className = 'textLayer';
      div.appendChild(textLayerDiv);
    }
    var textLayer = textLayerDiv ? new TextLayerBuilder(textLayerDiv) : null;

    var scale = this.scale;
    canvas.width = pageWidth * scale;
    canvas.height = pageHeight * scale;

    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    ctx.translate(-this.x * scale, -this.y * scale);

    // Rendering area

    var self = this;
    stats.begin = Date.now();
    this.content.startRendering(ctx, function pageViewDrawCallback(error) {
      div.removeChild(self.loadingIconDiv);

      if (error)
        PDFView.error('An error occurred while rendering the page.', error);

      self.updateStats();
      if (self.onAfterDraw)
        self.onAfterDraw();

      cache.push(self);
      callback();
    }, textLayer);

    setupAnnotations(this.content, this.scale);
    div.setAttribute('data-loaded', true);
  };

  this.updateStats = function pageViewUpdateStats() {
    var t1 = stats.compile, t2 = stats.fonts, t3 = stats.render;
    var str = 'Time to compile/fonts/render: ' +
              (t1 - stats.begin) + '/' + (t2 - t1) + '/' + (t3 - t2) + ' ms';
    document.getElementById('info').textContent = str;
  };
};

var ThumbnailView = function thumbnailView(container, page, id, pageRatio) {
  var anchor = document.createElement('a');
  anchor.href = PDFView.getAnchorUrl('#page=' + id);
  anchor.onclick = function stopNivigation() {
    PDFView.page = id;
    return false;
  };

  var view = page.view;
  this.width = view.width;
  this.height = view.height;
  this.id = id;

  var maxThumbSize = 134;
  var canvasWidth = pageRatio >= 1 ? maxThumbSize :
    maxThumbSize * pageRatio;
  var canvasHeight = pageRatio <= 1 ? maxThumbSize :
    maxThumbSize / pageRatio;
  var scaleX = this.scaleX = (canvasWidth / this.width);
  var scaleY = this.scaleY = (canvasHeight / this.height);

  var div = document.createElement('div');
  div.id = 'thumbnailContainer' + id;
  div.className = 'thumbnail';

  anchor.appendChild(div);
  container.appendChild(anchor);

  this.hasImage = false;

  function getPageDrawContext() {
    var canvas = document.createElement('canvas');
    canvas.id = 'thumbnail' + id;
    canvas.mozOpaque = true;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    div.setAttribute('data-loaded', true);
    div.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    ctx.save();
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    var view = page.view;
    ctx.translate(-view.x * scaleX, -view.y * scaleY);
    div.style.width = (view.width * scaleX) + 'px';
    div.style.height = (view.height * scaleY) + 'px';
    div.style.lineHeight = (view.height * scaleY) + 'px';

    return ctx;
  }

  this.drawingRequired = function thumbnailViewDrawingRequired() {
    return !this.hasImage;
  };

  this.draw = function thumbnailViewDraw(callback) {
    if (this.hasImage) {
      callback();
      return;
    }

    var ctx = getPageDrawContext();
    page.startRendering(ctx, function thumbnailViewDrawStartRendering() {
      callback();
    });

    this.hasImage = true;
  };

  this.setImage = function thumbnailViewSetImage(img) {
    if (this.hasImage)
      return;

    var ctx = getPageDrawContext();
    ctx.drawImage(img, 0, 0, img.width, img.height,
                  0, 0, ctx.canvas.width, ctx.canvas.height);

    this.hasImage = true;
  };
};

var DocumentOutlineView = function documentOutlineView(outline) {
  var outlineView = document.getElementById('outlineView');

  function bindItemLink(domObj, item) {
    domObj.href = PDFView.getDestinationHash(item.dest);
    domObj.onclick = function documentOutlineViewOnclick(e) {
      PDFView.navigateTo(item.dest);
      return false;
    };
  }

  var queue = [{parent: outlineView, items: outline}];
  while (queue.length > 0) {
    var levelData = queue.shift();
    var i, n = levelData.items.length;
    for (i = 0; i < n; i++) {
      var item = levelData.items[i];
      var div = document.createElement('div');
      div.className = 'outlineItem';
      var a = document.createElement('a');
      bindItemLink(a, item);
      a.textContent = item.title;
      div.appendChild(a);

      if (item.items.length > 0) {
        var itemsDiv = document.createElement('div');
        itemsDiv.className = 'outlineItems';
        div.appendChild(itemsDiv);
        queue.push({parent: itemsDiv, items: item.items});
      }

      levelData.parent.appendChild(div);
    }
  }
};

var TextLayerBuilder = function textLayerBuilder(textLayerDiv) {
  this.textLayerDiv = textLayerDiv;

  this.beginLayout = function textLayerBuilderBeginLayout() {
    this.textDivs = [];
    this.textLayerQueue = [];
  };

  this.endLayout = function textLayerBuilderEndLayout() {
    var self = this;
    var textDivs = this.textDivs;
    var textLayerDiv = this.textLayerDiv;
    var renderTimer = null;
    var renderingDone = false;
    var renderInterval = 0;
    var resumeInterval = 500; // in ms

    // Render the text layer, one div at a time
    function renderTextLayer() {
      if (textDivs.length === 0) {
        clearInterval(renderTimer);
        renderingDone = true;
        return;
      }
      var textDiv = textDivs.shift();
      if (textDiv.dataset.textLength > 0) {
        textLayerDiv.appendChild(textDiv);

        if (textDiv.dataset.textLength > 1) { // avoid div by zero
          // Adjust div width (via letterSpacing) to match canvas text
          // Due to the .offsetWidth calls, this is slow
          // This needs to come after appending to the DOM
          textDiv.style.letterSpacing =
            ((textDiv.dataset.canvasWidth - textDiv.offsetWidth) /
              (textDiv.dataset.textLength - 1)) + 'px';
        }
      } // textLength > 0
    }
    renderTimer = setInterval(renderTextLayer, renderInterval);

    // Stop rendering when user scrolls. Resume after XXX milliseconds
    // of no scroll events
    var scrollTimer = null;
    function textLayerOnScroll() {
      if (renderingDone) {
        window.removeEventListener('scroll', textLayerOnScroll, false);
        return;
      }

      // Immediately pause rendering
      clearInterval(renderTimer);

      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function textLayerScrollTimer() {
        // Resume rendering
        renderTimer = setInterval(renderTextLayer, renderInterval);
      }, resumeInterval);
    }; // textLayerOnScroll

    window.addEventListener('scroll', textLayerOnScroll, false);
  }; // endLayout

  this.appendText = function textLayerBuilderAppendText(text,
                                                        fontName, fontSize) {
    var textDiv = document.createElement('div');

    // vScale and hScale already contain the scaling to pixel units
    var fontHeight = fontSize * text.geom.vScale;
    textDiv.dataset.canvasWidth = text.canvasWidth * text.geom.hScale;

    textDiv.style.fontSize = fontHeight + 'px';
    textDiv.style.fontFamily = fontName || 'sans-serif';
    textDiv.style.left = text.geom.x + 'px';
    textDiv.style.top = (text.geom.y - fontHeight) + 'px';
    textDiv.textContent = text.str;
    textDiv.dataset.textLength = text.length;
    this.textDivs.push(textDiv);
  };
};

window.addEventListener('load', function webViewerLoad(evt) {
  var params = document.location.search.substring(1).split('&');
  for (var i = 0; i < params.length; i++) {
    var param = params[i].split('=');
    params[unescape(param[0])] = unescape(param[1]);
  }

  var scale = ('scale' in params) ? params.scale : 0;
  var file = PDFJS.isFirefoxExtension ?
              window.location.toString() : params.file || kDefaultURL;
  PDFView.open(file, parseFloat(scale));

  if (PDFJS.isFirefoxExtension || !window.File || !window.FileReader ||
      !window.FileList || !window.Blob) {
    document.getElementById('fileInput').setAttribute('hidden', 'true');
    document.getElementById('fileInputSeperator')
                              .setAttribute('hidden', 'true');
  } else {
    document.getElementById('fileInput').value = null;
  }

  if ('disableWorker' in params)
    PDFJS.disableWorker = (params['disableWorker'] === 'true');

  if ('disableTextLayer' in params)
    PDFJS.disableTextLayer = (params['disableTextLayer'] === 'true');

  var sidebarScrollView = document.getElementById('sidebarScrollView');
  sidebarScrollView.addEventListener('scroll', updateThumbViewArea, true);
}, true);

window.addEventListener('unload', function webViewerUnload(evt) {
  window.scrollTo(0, 0);
}, true);

/**
 * Render the next not yet visible page already such that it is
 * hopefully ready once the user scrolls to it.
 */
function preDraw() {
  var pages = PDFView.pages;
  var visible = PDFView.getVisiblePages();
  var last = visible[visible.length - 1];
  // PageView.id is the actual page number, which is + 1 compared
  // to the index in `pages`. That means, pages[last.id] is the next
  // PageView instance.
  if (pages[last.id] && pages[last.id].drawingRequired()) {
    renderingQueue.enqueueDraw(pages[last.id]);
    return;
  }
  // If there is nothing to draw on the next page, maybe the user
  // is scrolling up, so, let's try to render the next page *before*
  // the first visible page
  if (pages[visible[0].id - 2]) {
    renderingQueue.enqueueDraw(pages[visible[0].id - 2]);
  }
}

function updateViewarea() {
  var visiblePages = PDFView.getVisiblePages();
  var pageToDraw;
  for (var i = 0; i < visiblePages.length; i++) {
    var page = visiblePages[i];
    var pageObj = PDFView.pages[page.id - 1];

    pageToDraw |= pageObj.drawingRequired();
    renderingQueue.enqueueDraw(pageObj);
  }

  if (!visiblePages.length)
    return;

  // If there is no need to draw a page that is currenlty visible, preDraw the
  // next page the user might scroll to.
  if (!pageToDraw) {
    preDraw();
  }

  updateViewarea.inProgress = true; // used in "set page"
  var currentId = PDFView.page;
  var firstPage = visiblePages[0];
  PDFView.page = firstPage.id;
  updateViewarea.inProgress = false;

  var currentScale = PDFView.currentScale;
  var currentScaleValue = PDFView.currentScaleValue;
  var normalizedScaleValue = currentScaleValue == currentScale ?
    currentScale * 100 : currentScaleValue;

  var kViewerTopMargin = 52;
  var pageNumber = firstPage.id;
  var pdfOpenParams = '#page=' + pageNumber;
  pdfOpenParams += '&zoom=' + normalizedScaleValue;
  var currentPage = PDFView.pages[pageNumber - 1];
  var topLeft = currentPage.getPagePoint(window.pageXOffset,
    window.pageYOffset - firstPage.y - kViewerTopMargin);
  pdfOpenParams += ',' + Math.round(topLeft.x) + ',' + Math.round(topLeft.y);

  var store = PDFView.store;
  store.set('exists', true);
  store.set('page', pageNumber);
  store.set('zoom', normalizedScaleValue);
  store.set('scrollLeft', Math.round(topLeft.x));
  store.set('scrollTop', Math.round(topLeft.y));
  var href = PDFView.getAnchorUrl(pdfOpenParams);
  document.getElementById('viewBookmark').href = href;
}

window.addEventListener('scroll', function webViewerScroll(evt) {
  updateViewarea();
}, true);


var thumbnailTimer;

function updateThumbViewArea() {
  // Only render thumbs after pausing scrolling for this amount of time
  // (makes UI more responsive)
  var delay = 50; // in ms

  if (thumbnailTimer)
    clearTimeout(thumbnailTimer);

  thumbnailTimer = setTimeout(function() {
    var visibleThumbs = PDFView.getVisibleThumbs();
    for (var i = 0; i < visibleThumbs.length; i++) {
      var thumb = visibleThumbs[i];
      renderingQueue.enqueueDraw(PDFView.thumbnails[thumb.id - 1]);
    }
  }, delay);
}

window.addEventListener('transitionend', updateThumbViewArea, true);
window.addEventListener('webkitTransitionEnd', updateThumbViewArea, true);

window.addEventListener('resize', function webViewerResize(evt) {
  if (document.getElementById('pageWidthOption').selected ||
      document.getElementById('pageFitOption').selected ||
      document.getElementById('pageAutoOption').selected)
      PDFView.parseScale(document.getElementById('scaleSelect').value);
  updateViewarea();
});

window.addEventListener('hashchange', function webViewerHashchange(evt) {
  PDFView.setHash(document.location.hash.substring(1));
});

window.addEventListener('change', function webViewerChange(evt) {
  var files = evt.target.files;
  if (!files || files.length == 0)
    return;

  // Read the local file into a Uint8Array.
  var fileReader = new FileReader();
  fileReader.onload = function webViewerChangeFileReaderOnload(evt) {
    var data = evt.target.result;
    var buffer = new ArrayBuffer(data.length);
    var uint8Array = new Uint8Array(buffer);

    for (var i = 0; i < data.length; i++)
      uint8Array[i] = data.charCodeAt(i);
    PDFView.load(uint8Array);
  };

  // Read as a binary string since "readAsArrayBuffer" is not yet
  // implemented in Firefox.
  var file = files[0];
  fileReader.readAsBinaryString(file);
  document.title = file.name;

  // URL does not reflect proper document location - hiding some icons.
  document.getElementById('viewBookmark').setAttribute('hidden', 'true');
  document.getElementById('download').setAttribute('hidden', 'true');
}, true);

function selectScaleOption(value) {
  var options = document.getElementById('scaleSelect').options;
  var predefinedValueFound = false;
  for (var i = 0; i < options.length; i++) {
    var option = options[i];
    if (option.value != value) {
      option.selected = false;
      continue;
    }
    option.selected = true;
    predefinedValueFound = true;
  }
  return predefinedValueFound;
}

window.addEventListener('scalechange', function scalechange(evt) {
  var customScaleOption = document.getElementById('customScaleOption');
  customScaleOption.selected = false;

  if (!evt.resetAutoSettings &&
       (document.getElementById('pageWidthOption').selected ||
        document.getElementById('pageFitOption').selected ||
        document.getElementById('pageAutoOption').selected)) {
      updateViewarea();
      return;
  }

  var predefinedValueFound = selectScaleOption('' + evt.scale);
  if (!predefinedValueFound) {
    customScaleOption.textContent = Math.round(evt.scale * 10000) / 100 + '%';
    customScaleOption.selected = true;
  }

  updateViewarea();
}, true);

window.addEventListener('pagechange', function pagechange(evt) {
  var page = evt.pageNumber;
  if (document.getElementById('pageNumber').value != page)
    document.getElementById('pageNumber').value = page;
  document.getElementById('previous').disabled = (page <= 1);
  document.getElementById('next').disabled = (page >= PDFView.pages.length);
}, true);

window.addEventListener('keydown', function keydown(evt) {
  if (evt.ctrlKey || evt.altKey || evt.shiftKey || evt.metaKey)
    return;
  var curElement = document.activeElement;
  if (curElement && curElement.tagName == 'INPUT')
    return;
  var controlsElement = document.getElementById('controls');
  while (curElement) {
    if (curElement === controlsElement)
      return; // ignoring if the 'controls' element is focused
    curElement = curElement.parentNode;
  }
  var handled = false;
  switch (evt.keyCode) {
    case 61: // FF/Mac '='
    case 107: // FF '+' and '='
    case 187: // Chrome '+'
      PDFView.zoomIn();
      handled = true;
      break;
    case 109: // FF '-'
    case 189: // Chrome '-'
      PDFView.zoomOut();
      handled = true;
      break;
    case 48: // '0'
      PDFView.parseScale(kDefaultScale, true);
      handled = true;
      break;
    case 37: // left arrow
    case 75: // 'k'
    case 80: // 'p'
      PDFView.page--;
      handled = true;
      break;
    case 39: // right arrow
    case 74: // 'j'
    case 78: // 'n'
      PDFView.page++;
      handled = true;
      break;
  }

  if (handled) {
    evt.preventDefault();
  }
});


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  AES implementation in JavaScript (c) Chris Veness 2005-2011                                   */ 
/*   - see http://csrc.nist.gov/publications/PubsFIPS.html#197   
- http://www.movable-type.co.uk/scripts/aes.html*/
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Aes = {};  // Aes namespace

/**
 * AES Cipher function: encrypt 'input' state with Rijndael algorithm
 *   applies Nr rounds (10/12/14) using key schedule w for 'add round key' stage
 *
 * @param {Number[]} input 16-byte (128-bit) input state array
 * @param {Number[][]} w   Key schedule as 2D byte-array (Nr+1 x Nb bytes)
 * @returns {Number[]}     Encrypted output state array
 */
Aes.cipher = function(input, w) {    // main Cipher function [§5.1]
  var Nb = 4;               // block size (in words): no of columns in state (fixed at 4 for AES)
  var Nr = w.length/Nb - 1; // no of rounds: 10/12/14 for 128/192/256-bit keys

  var state = [[],[],[],[]];  // initialise 4xNb byte-array 'state' with input [§3.4]
  for (var i=0; i<4*Nb; i++) state[i%4][Math.floor(i/4)] = input[i];

  state = Aes.addRoundKey(state, w, 0, Nb);

  for (var round=1; round<Nr; round++) {
    state = Aes.subBytes(state, Nb);
    state = Aes.shiftRows(state, Nb);
    state = Aes.mixColumns(state, Nb);
    state = Aes.addRoundKey(state, w, round, Nb);
  }

  state = Aes.subBytes(state, Nb);
  state = Aes.shiftRows(state, Nb);
  state = Aes.addRoundKey(state, w, Nr, Nb);

  var output = new Array(4*Nb);  // convert state to 1-d array before returning [§3.4]
  for (var i=0; i<4*Nb; i++) output[i] = state[i%4][Math.floor(i/4)];
  return output;
}

/**
 * Perform Key Expansion to generate a Key Schedule
 *
 * @param {Number[]} key Key as 16/24/32-byte array
 * @returns {Number[][]} Expanded key schedule as 2D byte-array (Nr+1 x Nb bytes)
 */
Aes.keyExpansion = function(key) {  // generate Key Schedule (byte-array Nr+1 x Nb) from Key [§5.2]
  var Nb = 4;            // block size (in words): no of columns in state (fixed at 4 for AES)
  var Nk = key.length/4  // key length (in words): 4/6/8 for 128/192/256-bit keys
  var Nr = Nk + 6;       // no of rounds: 10/12/14 for 128/192/256-bit keys

  var w = new Array(Nb*(Nr+1));
  var temp = new Array(4);

  for (var i=0; i<Nk; i++) {
    var r = [key[4*i], key[4*i+1], key[4*i+2], key[4*i+3]];
    w[i] = r;
  }

  for (var i=Nk; i<(Nb*(Nr+1)); i++) {
    w[i] = new Array(4);
    for (var t=0; t<4; t++) temp[t] = w[i-1][t];
    if (i % Nk == 0) {
      temp = Aes.subWord(Aes.rotWord(temp));
      for (var t=0; t<4; t++) temp[t] ^= Aes.rCon[i/Nk][t];
    } else if (Nk > 6 && i%Nk == 4) {
      temp = Aes.subWord(temp);
    }
    for (var t=0; t<4; t++) w[i][t] = w[i-Nk][t] ^ temp[t];
  }

  return w;
}

/*
 * ---- remaining routines are private, not called externally ----
 */
 
Aes.subBytes = function(s, Nb) {    // apply SBox to state S [§5.1.1]
  for (var r=0; r<4; r++) {
    for (var c=0; c<Nb; c++) s[r][c] = Aes.sBox[s[r][c]];
  }
  return s;
}

Aes.shiftRows = function(s, Nb) {    // shift row r of state S left by r bytes [§5.1.2]
  var t = new Array(4);
  for (var r=1; r<4; r++) {
    for (var c=0; c<4; c++) t[c] = s[r][(c+r)%Nb];  // shift into temp copy
    for (var c=0; c<4; c++) s[r][c] = t[c];         // and copy back
  }          // note that this will work for Nb=4,5,6, but not 7,8 (always 4 for AES):
  return s;  // see asmaes.sourceforge.net/rijndael/rijndaelImplementation.pdf
}

Aes.mixColumns = function(s, Nb) {   // combine bytes of each col of state S [§5.1.3]
  for (var c=0; c<4; c++) {
    var a = new Array(4);  // 'a' is a copy of the current column from 's'
    var b = new Array(4);  // 'b' is a•{02} in GF(2^8)
    for (var i=0; i<4; i++) {
      a[i] = s[i][c];
      b[i] = s[i][c]&0x80 ? s[i][c]<<1 ^ 0x011b : s[i][c]<<1;

    }
    // a[n] ^ b[n] is a•{03} in GF(2^8)
    s[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3]; // 2*a0 + 3*a1 + a2 + a3
    s[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3]; // a0 * 2*a1 + 3*a2 + a3
    s[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3]; // a0 + a1 + 2*a2 + 3*a3
    s[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3]; // 3*a0 + a1 + a2 + 2*a3
  }
  return s;
}

Aes.addRoundKey = function(state, w, rnd, Nb) {  // xor Round Key into state S [§5.1.4]
  for (var r=0; r<4; r++) {
    for (var c=0; c<Nb; c++) state[r][c] ^= w[rnd*4+c][r];
  }
  return state;
}

Aes.subWord = function(w) {    // apply SBox to 4-byte word w
  for (var i=0; i<4; i++) w[i] = Aes.sBox[w[i]];
  return w;
}

Aes.rotWord = function(w) {    // rotate 4-byte word w left by one byte
  var tmp = w[0];
  for (var i=0; i<3; i++) w[i] = w[i+1];
  w[3] = tmp;
  return w;
}

// sBox is pre-computed multiplicative inverse in GF(2^8) used in subBytes and keyExpansion [§5.1.1]
Aes.sBox =  [0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
             0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
             0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
             0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
             0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
             0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
             0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
             0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
             0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
             0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
             0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
             0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
             0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
             0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
             0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
             0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16];

// rCon is Round Constant used for the Key Expansion [1st col is 2^(r-1) in GF(2^8)] [§5.2]
Aes.rCon = [ [0x00, 0x00, 0x00, 0x00],
             [0x01, 0x00, 0x00, 0x00],
             [0x02, 0x00, 0x00, 0x00],
             [0x04, 0x00, 0x00, 0x00],
             [0x08, 0x00, 0x00, 0x00],
             [0x10, 0x00, 0x00, 0x00],
             [0x20, 0x00, 0x00, 0x00],
             [0x40, 0x00, 0x00, 0x00],
             [0x80, 0x00, 0x00, 0x00],
             [0x1b, 0x00, 0x00, 0x00],
             [0x36, 0x00, 0x00, 0x00] ]; 


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  AES Counter-mode implementation in JavaScript (c) Chris Veness 2005-2011                      */
/*   - see http://csrc.nist.gov/publications/nistpubs/800-38a/sp800-38a.pdf                       */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

Aes.Ctr = {};  // Aes.Ctr namespace: a subclass or extension of Aes

/** 
 * Encrypt a text using AES encryption in Counter mode of operation
 *
 * Unicode multi-byte character safe
 *
 * @param {String} plaintext Source text to be encrypted
 * @param {String} password  The password to use to generate a key
 * @param {Number} nBits     Number of bits to be used in the key (128, 192, or 256)
 * @returns {string}         Encrypted text
 */
Aes.Ctr.encrypt = function(plaintext, password, nBits, mynonce) {
  var blockSize = 16;  // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
  if (!(nBits==128 || nBits==192 || nBits==256)) return '';  // standard allows 128/192/256 bit keys
  plaintext = Utf8.encode(plaintext);
  password = Utf8.encode(password);
  //var t = new Date();  // timer
        
  // use AES itself to encrypt password to get cipher key (using plain password as source for key 
  // expansion) - gives us well encrypted key (though hashed key might be preferred for prod'n use)
  var nBytes = nBits/8;  // no bytes in key (16/24/32)
  var pwBytes = new Array(nBytes);
  for (var i=0; i<nBytes; i++) {  // use 1st 16/24/32 chars of password for key
    pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
  }
  var key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));  // gives us 16-byte key
  key = key.concat(key.slice(0, nBytes-16));  // expand key to 16/24/32 bytes long

  // initialise 1st 8 bytes of counter block with nonce (NIST SP800-38A §B.2): [0-1] = millisec, 
  // [2-3] = random, [4-7] = seconds, together giving full sub-millisec uniqueness up to Feb 2106
  var counterBlock = new Array(blockSize);
  
  var nonce = (new Date()).getTime();  // timestamp: milliseconds since 1-Jan-1970
  var nonceMs = nonce%1000;
  var nonceSec = Math.floor(nonce/1000);
  var nonceRnd = Math.floor(Math.random()*0xffff);
  
  for (var i=0; i<2; i++) counterBlock[i]   = (nonceMs  >>> i*8) & 0xff;
  for (var i=0; i<2; i++) counterBlock[i+2] = (nonceRnd >>> i*8) & 0xff;
  for (var i=0; i<4; i++) counterBlock[i+4] = (nonceSec >>> i*8) & 0xff;
  
  if (mynonce) for (var i=0;i<8;i++) counterBlock[i] = mynonce.charCodeAt(i);
  
  // and convert it to a string to go on the front of the ciphertext
  var ctrTxt = '';
  for (var i=0; i<8; i++) ctrTxt += String.fromCharCode(counterBlock[i]);

  // generate key schedule - an expansion of the key into distinct Key Rounds for each round
  var keySchedule = Aes.keyExpansion(key);
  
  var blockCount = Math.ceil(plaintext.length/blockSize);
  var ciphertxt = new Array(blockCount);  // ciphertext as array of strings
  
  for (var b=0; b<blockCount; b++) {
    // set counter (block #) in last 8 bytes of counter block (leaving nonce in 1st 8 bytes)
    // done in two stages for 32-bit ops: using two words allows us to go past 2^32 blocks (68GB)
    for (var c=0; c<4; c++) counterBlock[15-c] = (b >>> c*8) & 0xff;
    for (var c=0; c<4; c++) counterBlock[15-c-4] = (b/0x100000000 >>> c*8)

    var cipherCntr = Aes.cipher(counterBlock, keySchedule);  // -- encrypt counter block --
    
    // block size is reduced on final block
    var blockLength = b<blockCount-1 ? blockSize : (plaintext.length-1)%blockSize+1;
    var cipherChar = new Array(blockLength);
    
    for (var i=0; i<blockLength; i++) {  // -- xor plaintext with ciphered counter char-by-char --
      cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b*blockSize+i);
      cipherChar[i] = String.fromCharCode(cipherChar[i]);
    }
    ciphertxt[b] = cipherChar.join(''); 
  }

  // Array.join is more efficient than repeated string concatenation in IE
  var ciphertext = ctrTxt + ciphertxt.join('');
  ciphertext = Base64.encode(ciphertext);  // encode in base64
  
  //alert((new Date()) - t);
  return ciphertext;
}

/** 
 * Decrypt a text encrypted by AES in counter mode of operation
 *
 * @param {String} ciphertext Source text to be encrypted
 * @param {String} password   The password to use to generate a key
 * @param {Number} nBits      Number of bits to be used in the key (128, 192, or 256)
 * @returns {String}          Decrypted text
 */
Aes.Ctr.decrypt = function(ciphertext, password, nBits) {
  var blockSize = 16;  // block size fixed at 16 bytes / 128 bits (Nb=4) for AES
  if (!(nBits==128 || nBits==192 || nBits==256)) return '';  // standard allows 128/192/256 bit keys
  ciphertext = Base64.decode(ciphertext);
  password = Utf8.encode(password);
  //var t = new Date();  // timer
  
  // use AES to encrypt password (mirroring encrypt routine)
  var nBytes = nBits/8;  // no bytes in key
  var pwBytes = new Array(nBytes);
  for (var i=0; i<nBytes; i++) {
    pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
  }
  var key = Aes.cipher(pwBytes, Aes.keyExpansion(pwBytes));
  key = key.concat(key.slice(0, nBytes-16));  // expand key to 16/24/32 bytes long

  // recover nonce from 1st 8 bytes of ciphertext
  var counterBlock = new Array(8);
  var ctrTxt = ciphertext.slice(0, 8);
  for (var i=0; i<8; i++) counterBlock[i] = ctrTxt.charCodeAt(i);
  
  // generate key schedule
  var keySchedule = Aes.keyExpansion(key);

  // separate ciphertext into blocks (skipping past initial 8 bytes)
  var nBlocks = Math.ceil((ciphertext.length-8) / blockSize);
  var ct = new Array(nBlocks);
  for (var b=0; b<nBlocks; b++) ct[b] = ciphertext.slice(8+b*blockSize, 8+b*blockSize+blockSize);
  ciphertext = ct;  // ciphertext is now array of block-length strings

  // plaintext will get generated block-by-block into array of block-length strings
  var plaintxt = new Array(ciphertext.length);

  for (var b=0; b<nBlocks; b++) {
    // set counter (block #) in last 8 bytes of counter block (leaving nonce in 1st 8 bytes)
    for (var c=0; c<4; c++) counterBlock[15-c] = ((b) >>> c*8) & 0xff;
    for (var c=0; c<4; c++) counterBlock[15-c-4] = (((b+1)/0x100000000-1) >>> c*8) & 0xff;

    var cipherCntr = Aes.cipher(counterBlock, keySchedule);  // encrypt counter block

    var plaintxtByte = new Array(ciphertext[b].length);
    for (var i=0; i<ciphertext[b].length; i++) {
      // -- xor plaintxt with ciphered counter byte-by-byte --
      plaintxtByte[i] = cipherCntr[i] ^ ciphertext[b].charCodeAt(i);
      plaintxtByte[i] = String.fromCharCode(plaintxtByte[i]);
    }
    plaintxt[b] = plaintxtByte.join('');
  }

  // join array of blocks into single plaintext string
  var plaintext = plaintxt.join('');
  plaintext = Utf8.decode(plaintext);  // decode from UTF8 back to Unicode multi-byte chars
  
  //alert((new Date()) - t);
  return plaintext;
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Base64 class: Base 64 encoding / decoding (c) Chris Veness 2002-2011                          */
/*    note: depends on Utf8 class                                                                 */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Base64 = {};  // Base64 namespace

Base64.code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

/**
 * Encode string into Base64, as defined by RFC 4648 [http://tools.ietf.org/html/rfc4648]
 * (instance method extending String object). As per RFC 4648, no newlines are added.
 *
 * @param {String} str The string to be encoded as base-64
 * @param {Boolean} [utf8encode=false] Flag to indicate whether str is Unicode string to be encoded 
 *   to UTF8 before conversion to base64; otherwise string is assumed to be 8-bit characters
 * @returns {String} Base64-encoded string
 */ 
Base64.encode = function(str, utf8encode) {  // http://tools.ietf.org/html/rfc4648
  utf8encode =  (typeof utf8encode == 'undefined') ? false : utf8encode;
  var o1, o2, o3, bits, h1, h2, h3, h4, e=[], pad = '', c, plain, coded;
  var b64 = Base64.code;
   
  plain = utf8encode ? str.encodeUTF8() : str;
  
  c = plain.length % 3;  // pad string to length of multiple of 3
  if (c > 0) { while (c++ < 3) { pad += '='; plain += '\0'; } }
  // note: doing padding here saves us doing special-case packing for trailing 1 or 2 chars
   
  for (c=0; c<plain.length; c+=3) {  // pack three octets into four hexets
    o1 = plain.charCodeAt(c);
    o2 = plain.charCodeAt(c+1);
    o3 = plain.charCodeAt(c+2);
      
    bits = o1<<16 | o2<<8 | o3;
      
    h1 = bits>>18 & 0x3f;
    h2 = bits>>12 & 0x3f;
    h3 = bits>>6 & 0x3f;
    h4 = bits & 0x3f;

    // use hextets to index into code string
    e[c/3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
  }
  coded = e.join('');  // join() is far faster than repeated string concatenation in IE
  
  // replace 'A's from padded nulls with '='s
  coded = coded.slice(0, coded.length-pad.length) + pad;
   
  return coded;
}

/**
 * Decode string from Base64, as defined by RFC 4648 [http://tools.ietf.org/html/rfc4648]
 * (instance method extending String object). As per RFC 4648, newlines are not catered for.
 *
 * @param {String} str The string to be decoded from base-64
 * @param {Boolean} [utf8decode=false] Flag to indicate whether str is Unicode string to be decoded 
 *   from UTF8 after conversion from base64
 * @returns {String} decoded string
 */ 
Base64.decode = function(str, utf8decode) {
  utf8decode =  (typeof utf8decode == 'undefined') ? false : utf8decode;
  var o1, o2, o3, h1, h2, h3, h4, bits, d=[], plain, coded;
  var b64 = Base64.code;

  coded = utf8decode ? str.decodeUTF8() : str;
  
  
  for (var c=0; c<coded.length; c+=4) {  // unpack four hexets into three octets
    h1 = b64.indexOf(coded.charAt(c));
    h2 = b64.indexOf(coded.charAt(c+1));
    h3 = b64.indexOf(coded.charAt(c+2));
    h4 = b64.indexOf(coded.charAt(c+3));
      
    bits = h1<<18 | h2<<12 | h3<<6 | h4;
      
    o1 = bits>>>16 & 0xff;
    o2 = bits>>>8 & 0xff;
    o3 = bits & 0xff;
    
    d[c/4] = String.fromCharCode(o1, o2, o3);
    // check for padding
    if (h4 == 0x40) d[c/4] = String.fromCharCode(o1, o2);
    if (h3 == 0x40) d[c/4] = String.fromCharCode(o1);
  }
  plain = d.join('');  // join() is far faster than repeated string concatenation in IE
   
  return utf8decode ? plain.decodeUTF8() : plain; 
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Utf8 class: encode / decode between multi-byte Unicode characters and UTF-8 multiple          */
/*              single-byte character encoding (c) Chris Veness 2002-2011                         */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

var Utf8 = {};  // Utf8 namespace

/**
 * Encode multi-byte Unicode string into utf-8 multiple single-byte characters 
 * (BMP / basic multilingual plane only)
 *
 * Chars in range U+0080 - U+07FF are encoded in 2 chars, U+0800 - U+FFFF in 3 chars
 *
 * @param {String} strUni Unicode string to be encoded as UTF-8
 * @returns {String} encoded string
 */
Utf8.encode = function(strUni) {
  // use regular expressions & String.replace callback function for better efficiency 
  // than procedural approaches
  var strUtf = strUni.replace(
      /[\u0080-\u07ff]/g,  // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
      function(c) { 
        var cc = c.charCodeAt(0);
        return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f); }
    );
  strUtf = strUtf.replace(
      /[\u0800-\uffff]/g,  // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
      function(c) { 
        var cc = c.charCodeAt(0); 
        return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f); }
    );
  return strUtf;
}

/**
 * Decode utf-8 encoded string back into multi-byte Unicode characters
 *
 * @param {String} strUtf UTF-8 string to be decoded back to Unicode
 * @returns {String} decoded string
 */
Utf8.decode = function(strUtf) {
  // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
  var strUni = strUtf.replace(
      /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
      function(c) {  // (note parentheses for precence)
        var cc = ((c.charCodeAt(0)&0x0f)<<12) | ((c.charCodeAt(1)&0x3f)<<6) | ( c.charCodeAt(2)&0x3f); 
        return String.fromCharCode(cc); }
    );
  strUni = strUni.replace(
      /[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
      function(c) {  // (note parentheses for precence)
        var cc = (c.charCodeAt(0)&0x1f)<<6 | c.charCodeAt(1)&0x3f;
        return String.fromCharCode(cc); }
    );
  return strUni;
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

-->

