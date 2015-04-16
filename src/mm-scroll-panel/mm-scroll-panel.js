/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt
*/
(function() {
	// Borrowed from MDN & modified - this is the only track pad normalization strategy which worked:
	// https://developer.mozilla.org/en-US/docs/Web/Events/wheel#Listening_to_this_event_across_browser
	var onwheel, 
		support = "onwheel" in document.createElement("div") ? "wheel" : // Modern browsers support "wheel"
			document.onmousewheel !== undefined ? "mousewheel" : // Webkit and IE support at least "mousewheel"
  			"DOMMouseScroll"; // let's assume that remaining browsers are older Firefox

	function addWheelListener(elem, callback, useCapture) {
		_addWheelListener(elem, support, callback, useCapture);

		// handle MozMousePixelScroll in older Firefox
		if(support === "DOMMouseScroll") {
			_addWheelListener(elem, "MozMousePixelScroll", callback, useCapture);
		}
	}

	function removeWheelListener(elem, callback, useCapture) {
		_removeWheelListener(elem, support, callback, useCapture);

		// handle MozMousePixelScroll in older Firefox
		if(support === "DOMMouseScroll") {
			_removeWheelListener(elem, "MozMousePixelScroll", callback, useCapture);
		}
	}

	function _addWheelListener(elem, eventName, callback, useCapture) {
		elem.addEventListener(eventName, support === "wheel" ? callback : function(originalEvent) {
			!originalEvent && (originalEvent = window.event);
			// create a normalized event object
			var event = {
				// keep a ref to the original event object
				originalEvent: originalEvent,
				target: originalEvent.target || originalEvent.srcElement,
				type: "wheel",
				deltaMode: originalEvent.type === "MozMousePixelScroll" ? 0 : 1,
				deltaX: 0,
				deltaZ: 0,
				preventDefault: function() {
					if(originalEvent.preventDefault) {
						originalEvent.preventDefault();
					} else {
						originalEvent.returnValue = false;
					}
				}
			};
			
			// calculate deltaY (and deltaX) according to the event
			if (support === "mousewheel") {
				event.deltaY = - 1/40 * originalEvent.wheelDelta;
				// Webkit also support wheelDeltaX
				originalEvent.wheelDeltaX && ( event.deltaX = - 1/40 * originalEvent.wheelDeltaX );
			} else {
				event.deltaY = originalEvent.detail;
			}

			// it's time to fire the callback
			return callback(event);

		}, useCapture || false);
	}

	function _removeWheelListener(elem, eventName, callback, useCapture) {
		elem.removeEventListener(eventName, callback, useCapture || false);
	}

	Polymer('mm-scroll-panel', {
		ver: "<<version>>",

		publish: {
			scrolling: false,
			scope: null
		},

		MIN_BAR_SIZE: 50,

		attached: function() {
			addWheelListener(this, this.onScroll.bind(this));
		},

		detached: function() {
			removeWheelListener(this, this.onScroll.bind(this));
		},

		ready: function() {
			if (!this.scope) {
				this.scope = this;
			}
		},
		
		domReady: function() {
			this.async(this.initialize);
		},

		itemChanged: function(e) {
			this.async(this.initialize);
		},

		initialize: function() {
			var barSize = this.viewportHeight * this.viewportHeight / this.contentHeight | 0;
			
			this.scrollBarSize = barSize < this.MIN_BAR_SIZE ? this.MIN_BAR_SIZE : barSize;
			this.scrollRange = this.viewportHeight - this.scrollBarSize;
			this.contentRange = this.contentHeight - this.viewportHeight;
			
			if(this.contentHeight > this.viewportHeight) {
				this.$.scrollbarY.style.height = this.scrollBarSize + "px";
				this.$.scrollbarY.style.display = "block";
			} else {
				this.$.scrollbarY.style.display = "none";
			}
			
			this.initContentHeight = this.contentHeight;
			this.updateScrollbar(this.$.viewport.scrollTop);
		},

		onScroll: function(e) {
			e.preventDefault();
			this.$.viewport.scrollTop += e.deltaY;
			this.updateScrollbar(this.$.viewport.scrollTop);
		},

		//Scrollbar Click-and-Drag Handlers
		onDown: function(e) {
			e.preventDefault();
			this.$.scrollbarY.classList.add("scrolling");
			this.currentY = this.$.scrollbarY.offsetTop;
		},

		onTrack: function(e) {
			e.preventDefault();
			this.updateViewport(e.dy);
			this.updateScrollbar(this.$.viewport.scrollTop);
		},

		onUp: function(e) {
			e.preventDefault();
			this.$.scrollbarY.classList.remove("scrolling");
		},

		updateScrollbar: function(scrollTop) {
			var scrollY = scrollTop * this.scrollRange / this.contentRange | 0;

			this.$.scrollbarY.style.top = scrollY + "px";
		},

		updateViewport: function (deltaY) {
			var newPos = this.currentY + deltaY;

			this.$.viewport.scrollTop = newPos * this.contentRange / this.scrollRange | 0;
		},

		resetScroll: function() {
			this.$.viewport.scrollTop = 0;
			this.updateScrollbar(this.$.viewport.scrollTop);
		},

		get contentHeight() {
			return this.$.viewport.scrollHeight;
		},

		get viewportHeight() {
			return this.$.viewport.offsetHeight;
		}
	});

})();