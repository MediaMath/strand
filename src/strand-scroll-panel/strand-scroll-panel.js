/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	function ScrollbarInterface (scrollPanel) {
		this._scrollPanel = scrollPanel;
	}

	ScrollbarInterface.prototype.contentHeight = function () {
		return this._scrollPanel.contentHeight;
	};

	ScrollbarInterface.prototype.viewportHeight = function () {
		return this._scrollPanel.viewportHeight;
	};

	ScrollbarInterface.prototype.applyPositions = function () {
		return this._scrollPanel._applyPositions.apply(this._scrollPanel, arguments);
	};

	scope.ScrollPanel = Polymer({
		is: 'strand-scroll-panel',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.DomMutable,
			StrandTraits.MouseWheelable,
			StrandTraits.Refable
		],
		
		properties: {
			mutationTarget: {
				value: function() { return this.$.holder }
			},
			_scrollbarInterface: {
				type: Object,
				value: function () {
					return new ScrollbarInterface(this);
				},
			},
		},

		listeners: {
			"added" : "_onAdded",
			"removed" : "_onRemoved",
			"mouseenter" : "_onFocus"
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

		_onWheel: function(e) {
			e.preventDefault();
			this.$.scrollbar.onWheel(e);
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