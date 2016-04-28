/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	Polymer({
		is: 'strand-scrollbar-y',

		behaviors: [
			StrandTraits.Stylable,
			StrandTraits.MouseWheelable,
			StrandTraits.Refable
		],
		
		properties: {
			interface: Object,
			scrollBarSize: {
				type: Number,
				value: 0
			},
			initContentHeight: {
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

		_updateScrollbarStyle: function(scrollBarSize) {
			var permit = scrollBarSize && this.interface && this.interface.viewportHeight;
			var d = permit && scrollBarSize < this.interface.viewportHeight() ? "block" : "none";
			return this.styleBlock({
				display: d,
				height: scrollBarSize + "px"
			});
		}, 

		updateUI: function() {
			if (this.interface &&
				this.interface.contentHeight &&
				this.interface.viewportHeight) {
				this._updateUI();
			}
		},

		_updateUI: function () {
			var contentHeight = this.interface.contentHeight();
			var viewportHeight = this.interface.viewportHeight();
			var barSize = viewportHeight * viewportHeight / contentHeight;

			this.scrollBarSize = barSize < this.MIN_BAR_SIZE ? this.MIN_BAR_SIZE : barSize;
			this.initContentHeight = contentHeight;

			this._scrollRange = viewportHeight - this.scrollBarSize;
			this._contentRange = contentHeight - viewportHeight;

			this._clampToContentPosition();
			this._applyPositions();
		},

		onWheel: function (e) {
			return this._onWheel.apply(this, arguments);
		},

		_onWheel: function(e) {
			e.preventDefault();
			this.updateViewport(e.deltaY);
		},

		updateViewport: function (delta) {
			this._contentPosition += delta;
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

		_applyPositions: function() {
			if (this.interface &&
				this.interface.applyPositions) {
				this.interface.applyPositions(this._scrollPosition, this._contentPosition);
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