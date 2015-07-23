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
		is: 'mm-scrollbar-y',

		behaviors: [
			StrandTraits.Stylable,
		],
		
		properties: {
			interop: Object,
			scrollBarSize: {
				type: Number,
				value: 0
			},
		},

		listeners: {
			"down" : "_onDown",
			"track" : "_onTrack",
		},

		MIN_BAR_SIZE: 50,

		_scrollRange: 0,
		_contentRange: 0,
		_scrollPosition: 0,
		_contentPosition: 0,
		_referencePosition: 0,

		attached: function() {
			this.addEventListener(support, this.onScroll);
			// Waiting on light DOM children is tricky...
			// this.async(function() {
			// 	this.debounce("update-ui", this.updateUI, 100);
			// });
		},
		
		detached: function() {
			this.removeEventListener(support, this.onScroll);
		},

		_updateScrollbarStyle: function(scrollBarSize) {
			var permit = scrollBarSize && this.interop && this.interop.viewportHeight;
			var d = permit && scrollBarSize < this.interop.viewportHeight() ? "block" : "none";
			return this.styleBlock({
				display: d,
				height: scrollBarSize + "px"
			});
		}, 

		updateUI: function() {
			if (this.interop &&
				this.interop.contentHeight &&
				this.interop.viewportHeight) {
				this._updateUI();
			}
		},

		_updateUI: function () {
			var contentHeight = this.interop.contentHeight();
			var viewportHeight = this.interop.viewportHeight();
			var barSize = viewportHeight * viewportHeight / contentHeight;

			this.scrollBarSize = barSize < this.MIN_BAR_SIZE ? this.MIN_BAR_SIZE : barSize;
			this._scrollRange = viewportHeight - this.scrollBarSize;
			this._contentRange = contentHeight - viewportHeight;

			this._clampToContentPosition();
			this._applyPositions();
		},

		onScroll: function(e) {
			e.preventDefault();
			this._contentPosition += e.deltaY;
			this._clampToContentPosition();
			this._applyPositions();
		},

		_clampToContentPosition: function () {
			if (this._contentPosition < 0) {
				this._contentPosition = 0;
			} else if (this._contentPosition > this._contentRange) {
				this._contentPosition = this._contentRange;
			}
			this._scrollPosition = this._contentPosition * this._scrollRange / this._contentRange;
		},

		_clampToScrollPosition: function () {
			if (this._scrollPosition < 0) {
				this._scrollPosition = 0;
			} else if (this._scrollPosition > this._scrollRange) {
				this._scrollPosition = this._scrollRange;
			}
			this._contentPosition = this._scrollPosition * this._contentRange / this._scrollRange;
		},

		_applyPositions: function(scrollTop) {
			if (this.interop &&
				this.interop.applyPositions) {
				this.interop.applyPositions(this._scrollPosition, this._contentPosition);
			} else {
				this.style.top = this._scrollPosition + "px";
			}
		},

		resetScroll: function(contentPosition) {
			this._contentPosition = 0|contentPosition;
			this._clampToContentPosition();
			this._applyPositions();
		},
		
		// Scrollbar Click-and-Drag Handlers
		_onDown: function(e) {
			e.preventDefault();
			this._referencePosition = this._scrollPosition;
		},

		_onTrack: function(e) {
			e.preventDefault();
			this._scrollPosition = this._referencePosition + e.detail.dy;
			this._clampToScrollPosition();
			this._applyPositions();
		},
	});

})(window.Strand = window.Strand || {});