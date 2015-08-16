/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
/* 
Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt

This code is based on the Google Polymer "core-list" component
found here: https://github.com/Polymer/core-list
*/
/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/



(function (scope) {

	window.addEventListener("mousewheel", Function());

	function BoundReference () {
		this.location = 0;
		this.instance = null;
		this.element = null;
		this.value = null;
	}

	BoundReference.prototype = Object.create(null);

	function BoundValue () {
		this.model = null;
		this.scope = null;
	}

	BoundValue.prototype = Object.create(null);



	function ScrollbarInterface (itemRecycler) {
		this._itemRecycler = itemRecycler;
	}

	ScrollbarInterface.prototype.contentHeight = function () {
		return this._itemRecycler._listHeight;
	};

	ScrollbarInterface.prototype.viewportHeight = function () {
		return this._itemRecycler.$.sizeContainer.offsetHeight;
	};

	ScrollbarInterface.prototype.applyPositions = function () {
		return this._itemRecycler._applyPositions.apply(this._itemRecycler, arguments);
	};



	Polymer({
		is: 'mm-item-recycler',

		behaviors: [
			StrandTraits.WindowNotifier,
			StrandTraits.DomWatchable,
			StrandTraits.MouseWheelable,
		],

		_scrollTop: 0,
		extraItems: 5,

		properties: {
			ver: {
				type: String,
				value: "<<version>>"
			},
			data: {
				type: Array,
				value: null,
				notify: true,
				observer: "initialize"
			},
			scope: {
				type: Object,
				value: null,
				notify: true,
			},
			itemTemplate: {
				type: String,
				value: ""
			},
			index: {
				type: Number,
				value: 0,
				notify: true,
			},
			listHeight: {
				type: Number,
				value: 0,
				readOnly: true,
			},
			viewportWidth: {
				type: Number,
				value: 0,
				notify: true,
				observer: "viewportWidthChanged"
			},
			disabled: {
				type: Boolean,
				value: false,
				reflectToAttribute: true
			},
			scrollbarInterface: {
				type: Object,
				value: function () {
					return new ScrollbarInterface(this);
				},
			},
		},

		listeners: {
			"scroll": "scrollHandler",
			"mouseenter": "_onFocus",
		},

		_onWheel: function(e) {
			e.preventDefault();
			this.$.scrollbar.onWheel(e);
		},

		_updateScrollbarUI: function (time) {
			this.$.scrollbar.debounce("update-ui", this.$.scrollbar.updateUI, +time || 0);
		},

		_onFocus: function(e) {
			this._updateScrollbarUI(0);
		},

		initialized: false,
		itemHeight: 0,

		_recycler: null,

		ready: function () {
			this._recycler = new Recycler(
				this._getItemHeight.bind(this),
				this._getDataLength.bind(this),
				this._handleRecycling.bind(this));
		},

		initialize: function () {
			if (!this.data) {
				return;
			}

			if(!this.initialized) {
				this.initialized = true;

				this.initializeTemplateBind();

				if(!this.itemHeight) {
					this.getItemHeight(this.initializeRecycler.bind(this));
				} else {
					this.initializeRecycler();
				}
			} else {
				this.initializeRecycler();
			}
		},

		itemTemplateElement: null,

		initializeTemplateBind: function () {
			if(this.itemTemplate && typeof this.itemTemplate === "string") {
				this.itemTemplateElement = Polymer.dom(this).querySelector("#" + this.itemTemplate);
			}

			if(!this.itemTemplateElement) {
				throw new Error("mm-item-recycler: Item template does not exist!");
				return;
			}
		},

		getItemHeight: function(callback) {
			var template = this.itemTemplateElement,
				container = template.parentNode,
				frag = template.stamp({ model: this.data[0], scope: this.scope }).root,
				elem = Polymer.dom(frag).firstElementChild;

			this.onMutation(function() {
				var ipp = 0|this.itemsPerPanel || 1;
				this.itemHeight = elem.offsetHeight;
				this.defaultPanelHeight = this.itemHeight * ipp;
				Polymer.dom(container).removeChild(elem);
				callback();
			}, container);

			Polymer.dom(container).appendChild(frag);
		},

		_getItemHeight: function () {
			return this.itemHeight;
		},

		_getDataLength: function () {
			return 0|(this.data && this.data.length);
		},

		_transformBaseline: 0,

		_handleRecycling: function (id, young, old, recycler) {
			var index = id,
				bound = null,
				binds = this._binds(),
				count = binds.length,
				place = 0;

			if (old < 0) {
				while (count < index) {
					count = binds.push(null);
				}
				count = binds.push(bound = new BoundReference(null, null));
				bound.value = new BoundValue(null, this.scope);
				bound.value.scope = this.scope;
				bound.value.model = this.data[young];
				bound.instance = this.itemTemplateElement.stamp(bound.value);
				bound.element = Polymer.dom(bound.instance.root).querySelector("*");
				this.toggleClass("recycler-panel", true, bound.element);
				Polymer.dom(this.$.positionContainer).appendChild(bound.element);
			} else if (young < 0) {
				bound = binds[index];
				Polymer.dom(Polymer.dom(bound.element).parentNode).removeChild(bound.element);
				bound = binds[index] = null;
				while (!binds[--count]) {
					binds.pop();
				}
				count++;
			} else if (index < count) {
				bound = binds[index];
			}

			if (bound) {
				if (old !== young) {
					bound.instance.set("model", this.data[young]);
				}
				place = bound.location = recycler.getElevationAtIndex(young);

				if (place < 1 << 24) {
					this.translate3d(0, (place - this._transformBaseline) +"px", 0, bound.element);
					this.debounce("rebase-transform", this._rebaseTransform, 250);
				} else {
					this._rebaseTransform();
				}
			}
		},

		_rebaseTransform: function () {
			var binds = this._binds();
			var minimum = binds.reduce(this._minimumElevationReducer, this._someBoundLocation(binds));

			this._transformBaseline = minimum;
			binds.forEach(this._rebaseEachTransform, this);
			this._applyTransform();
		},

		_someBoundLocation: function (binds) {
			var count = binds.length;
			var index = 0;
			var bound = null;
			var result = 0;

			for (index; index < count; index++) {
				if (bound = binds[index]) {
					result = bound.location;
					break;
				}
			}

			return result;
		},

		_minimumElevationReducer: function (reduction, bound) {
			return !bound || reduction < bound.location ? reduction : bound.location;
		},

		_rebaseEachTransform: function (bound) {
			if (bound) {
				this.translate3d(0, (bound.location - this._transformBaseline) +"px", 0, bound.element);
			}
		},

		_bindingList: null,

		_binds: function () {
			if (!this._bindingList) {
				this._bindingList = [];
			}
			return this._bindingList;
		},

		initializeRecycler: function() {
			this._recycler.truncate(0);
			this.initializeViewport();
			this._updateScrollbarUI(0);
		},

		_listHeight: 0,

		initializeViewport: function() {
			var listHeight = this.itemHeight * this.data.length,
				viewportHeight = this.offsetHeight,
				ipp = 0|this.itemsPerPanel || 1;

			this._listHeight = listHeight;

			this._physicalCount = this.recalculateCounts(viewportHeight, ipp);
			this._physicalHeight = this.itemHeight * this._physicalCount;

			//Initialize scrollTop to supplied index
			this.scrollToIndex(this.index);

			this._inferDefaultHeight = false;

			this._viewportHeight = viewportHeight - this.$.positionContainer.offsetTop;

			this._recycler.resizeFrame(this._viewportHeight);
			this._recycler.repadFrame(0|this.itemHeight, 0|this.itemHeight);
		},

		recalculateCounts: function (viewportHeight, itemsPerPanel) {
			var visibleCount = Math.ceil(viewportHeight / this.itemHeight),
				physicalCount = this.disabled ? this.data.length : Math.min(visibleCount + this.extraItems, this.data.length);
			// constrain _physicalCount to a multiple of itemsPerPanel
			physicalCount = itemsPerPanel * (1 + (0|((physicalCount + itemsPerPanel - 1) / itemsPerPanel)));

			return physicalCount;
		},

		viewportWidthChanged: function() {
			this.$.positionContainer.style.width = this.viewportWidth + "px";
		},

		scrollHandler: function(e) {
			var delta = e.target.scrollTop - this._scrollTop;
			this._scrollTop = e.target.scrollTop;

			if (!this.disabled) {
				this._recycler.translateFrame(delta);
				this.index = this._recycler.getLowestIndex();
			}
		},

		scrollToIndex: function(value) {
			this.scrollTop = this._scrollTop = this._recycler.getElevationAtIndex(0|value);
		},

		_scrollPosition: 0,
		_contentPosition: 0,

		_applyPositions: function (scrollPosition, contentPosition) {
			this._scrollPosition = scrollPosition;
			this._contentPosition = contentPosition;

			if (!this.disabled) {
				this._recycler.repositionFrame(contentPosition);
				this.index = this._recycler.getLowestIndex();
			}

			this._applyTransform();
		},

		_applyTransform: function () {
			var content = this._contentPosition - this._transformBaseline;
			var scrollbar = this._scrollPosition + content;

			this.$.scrollbar.translate3d(0, scrollbar + "px" ,0);
			this.translate3d(0, -content + "px", 0, this.$.sizeContainer);
		},

	});

})(window.Strand = window.Strand || {});


