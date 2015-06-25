/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {
	// see: https://developer.mozilla.org/en-US/docs/Web/Events/wheel#Listening_to_this_event_across_browser
	var support = "onwheel" in document.createElement("div") ? "wheel" : 
		document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll";

	Polymer({
		is: 'mm-scroll-panel',

		behaviors: [
			StrandTraits.Stylable,
			// StrandTraits.Resizable,
			StrandTraits.DomMutable
		],
		
		properties: {
			scrollBarSize: {
				type: Number,
				value: false
			},
			resizeTarget: {
				value: function() { return this.$.holder }
			},
			mutationTarget: {
				value: function() { return this.$.holder }
			},
			contentRange: Number,
			scrollRange: Number,
			initContentHeight: Number,
			currentY: Number
		},

		listeners: {
			"added" : "_onAdded",
			"removed" : "_onRemoved"
		},

		MIN_BAR_SIZE: 50,

		attached: function() {
			this.addEventListener(support, this._onScroll);
			// Waiting on light DOM children is tricky...
			this.async(function() {
				this.debounce("update-ui", this._updateUI, 100);
			});
		},
		
		detached: function() {
			this.removeEventListener(support, this._onScroll);
		},

		_onAdded: function(e) {
			this.debounce("update-ui", this._updateUI, 0);
		},

		_onRemoved: function(e) {
			this.debounce("update-ui", this._updateUI, 0);
		},

		// elementResize: function(e) {
		// 	this.debounce("update-ui", this._updateUI, 0);
		// },

		_updateUI: function() {
			var barSize = this.viewportHeight * this.viewportHeight / this.contentHeight;

			this.scrollBarSize = barSize < this.MIN_BAR_SIZE ? this.MIN_BAR_SIZE : barSize;
			this.scrollRange = this.viewportHeight - this.scrollBarSize;
			this.contentRange = this.contentHeight - this.viewportHeight;
			
			this.initContentHeight = this.contentHeight;
			this._updateScrollbar(this.$.viewport.scrollTop);
		},

		_updateScrollbarStyle: function(scrollBarSize) {
			var d = this.contentHeight > this.viewportHeight ? "block" : "none";
			return this.styleBlock({
				display: d,
				height: scrollBarSize + "px"
			});
		}, 

		_onScroll: function(e) {
			e.preventDefault();
			this.$.viewport.scrollTop += e.deltaY;
			this._updateScrollbar(this.$.viewport.scrollTop);
		},

		_updateScrollbar: function(scrollTop) {
			var scrollY = scrollTop * this.scrollRange / this.contentRange;
			this.$.scrollbarY.style.top = scrollY + "px";
		},

		_updateViewport: function (deltaY) {
			var newPos = this.currentY + deltaY;
			this.$.viewport.scrollTop = newPos * this.contentRange / this.scrollRange;
		},

		resetScroll: function() {
			this.$.viewport.scrollTop = 0;
			this._updateScrollbar(this.$.viewport.scrollTop);
		},
		
		// Scrollbar Click-and-Drag Handlers
		_onDown: function(e) {
			e.preventDefault();
			this.currentY = this.$.scrollbarY.offsetTop;
		},

		_onTrack: function(e) {
			e.preventDefault();
			this._updateViewport(e.detail.dy);
			this._updateScrollbar(this.$.viewport.scrollTop);
		},

		get contentHeight() {
			return this.$.holder.offsetHeight;
		},

		get viewportHeight() {
			return this.$.viewport.offsetHeight;
		}
	});

})(window.Strand = window.Strand || {});