/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {
	// see: https://developer.mozilla.org/en-US/docs/Web/Events/wheel#Listening_to_this_event_across_browser
	var support = "onwheel" in document.createElement("div") ? "wheel" : 
		document.onmousewheel !== undefined ? "mousewheel" : "DOMMouseScroll";

	function Adapter (scrollPanel) {
		this._scrollPanel = scrollPanel;
	}

	Adapter.prototype.contentHeight = function () {
		return this._scrollPanel.contentHeight;
	};

	Adapter.prototype.viewportHeight = function () {
		return this._scrollPanel.viewportHeight;
	};

	Adapter.prototype.applyPositions = function () {
		return this._scrollPanel._applyPositions.apply(this._scrollPanel, arguments);
	};

	Polymer({
		is: 'mm-scroll-panel',

		behaviors: [
			StrandTraits.DomMutable
		],
		
		properties: {
			tabIndex: {
				type: Number,
				value: 0
			},
			resizeTarget: {
				value: function() { return this.$.holder }
			},
			mutationTarget: {
				value: function() { return this.$.holder }
			},
			scrollInterop: {
				type: Object,
				value: function () {
					return new Adapter(this);
				},
			},
		},

		listeners: {
			"added" : "_onAdded",
			"removed" : "_onRemoved",
			"mouseenter" : "_onFocus"
		},

		attached: function() {
			this.addEventListener(support, this._onScroll);
			// Waiting on light DOM children is tricky...
			// this.async(function() {
			// 	this._updateScrollbarUI(100);
			// });
		},
		
		detached: function() {
			this.removeEventListener(support, this._onScroll);
		},

		_updateScrollbarUI: function (time) {
			this.$.scrollbar.debounce("update-ui", this.$.scrollbar.updateUI, +time || 0);
		},

		_onAdded: function(e) {
			this._updateScrollbarUI(0);
		},

		_onRemoved: function(e) {
			this._updateScrollbarUI(0);
		},

		_onFocus: function(e) {
			this._updateScrollbarUI(0);
		},

		_onScroll: function(e) {
			e.preventDefault();
			this.$.scrollbar.onScroll(e);
		},

		_applyPositions: function(scrollPosition, contentPosition) {
			this.$.scrollbar.style.top = scrollPosition + "px";
			this.$.viewport.scrollTop = contentPosition;
		},

		resetScroll: function() {
			this.$.scrollbar.resetScroll();
		},

		get contentHeight () {
			return this.$.holder.offsetHeight;
		},

		get viewportHeight () {
			return this.$.viewport.offsetHeight;
		}
	});

})(window.Strand = window.Strand || {});