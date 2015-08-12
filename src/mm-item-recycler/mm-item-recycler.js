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



(function (scope) {

	window.addEventListener("mousewheel", Function());

	function BoundReference (itemRecycler, id) {
		this.itemRecycler = itemRecycler;
		this.id = id;
		this.young = -1;
		this.height = 0;
		this.offset = 0;
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

	function ResponderStore (itemRecycler) {
		this.pane = null;
		this.header = null;
		this.footer = null;
		this.boundMap = {};
	}



	Polymer({
		is: 'mm-item-recycler',

		behaviors: [
			StrandTraits.WindowNotifier,
			StrandTraits.DomWatchable,
			StrandTraits.SizeResponsible,
		],

		properties: {
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
			itemTemplateElement: {
				type: Object,
				value: null,
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
			},
			disabled: {
				type: Boolean,
				value: false,
				reflectToAttribute: true
			},
			_bindingList: {
				type: Array,
				value: function () {
					return [];
				},
			},
			_initialized: {
				type: Boolean,
				value: false,
			},
			itemHeight: {
				type: Number,
				value: 0,
			},
			_transformBaseline: {
				type: Number,
				value: 0,
			},
			_headerHeight: {
				type: Number,
				value: 0,
			},
			_footerHeight: {
				type: Number,
				value: 0,
			},
			_middleHeight: {
				type: Number,
				value: 0,
			},
			_extentHeight: {
				type: Number,
				value: 0,
			},
			_scrollTop: {
				type: Number,
				value: 0,
			},
			_maxPixels: {
				type: Number,
				value: 1 << 24,
			},
			_responders: {
				type: Object,
				value: function () {
					var responders = new ResponderStore(this);
					responders.pane = this._paneResponse.bind(this);
					responders.header = this._headerResponse.bind(this);
					responders.footer = this._footerResponse.bind(this);
					return responders;
				},
			},
			_recycler: {
				type: Object,
				value: function () {
					return new Recycler(
						this._getItemHeight.bind(this),
						this._getDataLength.bind(this),
						this._handleRecycling.bind(this));
				},
			},
		},

		listeners: {
			"pane.scroll": "scrollHandler",
		},

		attached: function () {
			this.addResizeListener(this._responders.pane, this.$.pane);
			this.addResizeListener(this._responders.header, this.$.header);
			this.addResizeListener(this._responders.footer, this.$.footer);
		},

		detached: function () {
			this.removeResizeListener(this._responders.pane, this.$.pane);
			this.removeResizeListener(this._responders.header, this.$.header);
			this.removeResizeListener(this._responders.footer, this.$.footer);
		},

		_paneResponse: function (e) {
			var itemRecycler = this;
			var delta = +(itemRecycler.$.pane.offsetHeight - itemRecycler._viewportHeight) || 0;

			delta -= (this._headerHeight + this._footerHeight);

			if (delta) {
				itemRecycler._viewportHeight += delta;

				itemRecycler._recycler.resizeFrame(itemRecycler._viewportHeight);
				itemRecycler._repositionFooter();
			}
		},

		_headerResponse: function (e) {
			var itemRecycler = this;
			var delta = +(itemRecycler.$.header.offsetHeight - itemRecycler._headerHeight) || 0;

			if (delta) {
				itemRecycler._headerHeight += delta;
				itemRecycler._viewportHeight -= delta;

				itemRecycler._recycler.resizeFrame(itemRecycler._viewportHeight);
				itemRecycler._repositionMiddle();
				itemRecycler._repositionFooter();
			}
		},

		_footerResponse: function (e) {
			var itemRecycler = this;
			var delta = +(itemRecycler.$.footer.offsetHeight - itemRecycler._footerHeight) || 0;

			if (delta) {
				itemRecycler._footerHeight += delta;
				itemRecycler._viewportHeight -= delta;

				itemRecycler._recycler.resizeFrame(itemRecycler._viewportHeight);
				itemRecycler._repositionFooter();
			}
		},

		_boundResponse: function (ev) {
			var bound = this;
			var height = bound.height;
			var delta = +(bound.element.offsetHeight - height) || 0;
			var itemRecycler = bound.itemRecycler;

			if (delta) {
				bound.height += delta;
				itemRecycler._recycler.setHeightAtIndex(bound.young, height + delta);
				itemRecycler._deltaMiddleHeight(delta);
				itemRecycler._repositionHeader();
				itemRecycler._repositionFooter();
			}
		},

		initialize: function () {
			if (!this.data) {
				return;
			}

			if(!this._initialized) {
				this._initialized = true;

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

		initializeTemplateBind: function () {
			if(this.itemTemplate && typeof this.itemTemplate === "string") {
				this.itemTemplateElement = Polymer.dom(this).querySelector("#" + this.itemTemplate);
			}

			if(!this.itemTemplateElement) {
				throw new Error("mm-item-recycler: Item template does not exist!");
				return;
			}
		},

		initializeRecycler: function() {
			this._recycler.truncate(0);
			this.initializeViewport();
		},

		initializeViewport: function() {
			var viewportHeight = this.$.pane.offsetHeight;

			this._headerHeight = this.$.header.offsetHeight;
			this._footerHeight = this.$.footer.offsetHeight;
			this._extentHeight = this.$.extent.offsetHeight;

			viewportHeight -= (this._headerHeight + this._footerHeight);
			this._viewportHeight = viewportHeight;

			this._assignMiddleHeight(this.itemHeight * this.data.length);
			this._repositionHeader();
			this._repositionFooter();
			this._repositionMiddle();
			this._repositionExtent();

			this._physicalCount = this.recalculateCounts(viewportHeight);
			this._physicalHeight = this.itemHeight * this._physicalCount;

			//Initialize scrollTop to supplied index
			this.scrollToIndex(0|this.index);

			this._recycler.resizeFrame(this._viewportHeight);
			this._recycler.repadFrame(0|this.itemHeight, 0|this.itemHeight);
		},

		recalculateCounts: function (viewportHeight) {
			var visibleCount = Math.ceil(viewportHeight / this.itemHeight),
				physicalCount = this.disabled ? this.data.length : Math.min(visibleCount, this.data.length);

			return physicalCount;
		},

		scrollToIndex: function(value) {
			this.scrollTop = this._scrollTop = this._recycler.getElevationAtIndex(0|value);
		},

		scrollHandler: function(e) {
			var delta = e.target.scrollTop - this._scrollTop;
			this._scrollTop = e.target.scrollTop;

			if (!this.disabled) {
				this._repositionHeader();
				this._repositionFooter();
				this._recycler.translateFrame(delta);
				this.index = this._recycler.getLowestIndex();
			}
		},

		getItemHeight: function(callback) {
			var template = this.itemTemplateElement,
				container = this.$.middle,
				frag = template.stamp({ model: this.data[0], scope: this.scope }).root,
				elem = Polymer.dom(frag).querySelector("*"),
				child = document.createElement("DIV");

			this.toggleClass("recycler-panel", true, child);

			this.onMutation(function() {
				this.itemHeight = child.offsetHeight;
				Polymer.dom(container).removeChild(child);
				callback();
			}, container);

			Polymer.dom(child).appendChild(elem);
			Polymer.dom(container).appendChild(child);
		},

		_getItemHeight: function () {
			return this.itemHeight || 1;
		},

		_getDataLength: function () {
			return 0|(this.data && this.data.length);
		},

		_handleRecycling: function (id, young, old, recycler) {
			var index = 0|id,
				bound = null,
				binds = this._bindingList,
				count = binds.length,
				place = 0,
				content = null,
				responder = this._responders.boundMap[id] || null,
				offset = this._calculateStaticPositionOffset(index, binds);

			if (old < 0) {
				while (count < index) {
					count = binds.push(null);
				}
				count = binds.push(bound = new BoundReference(this, id));
				bound.value = new BoundValue(null, this.scope);
				bound.value.scope = this.scope;
				bound.value.model = this.data[young];
				bound.instance = this.itemTemplateElement.stamp(bound.value);
				content = Polymer.dom(bound.instance.root).querySelector("*");
				bound.element = document.createElement("DIV");
				this.toggleClass("recycler-panel", true, bound.element);
				Polymer.dom(bound.element).appendChild(content);
				Polymer.dom(this.$.middle).appendChild(bound.element);
				responder = this._addBoundResponse(bound, id, index);
			} else if (young < 0) {
				bound = binds[index];
				this._removeBoundResponse(bound, id, index);
				responder = null;
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
				bound.height = recycler.getHeightAtIndex(young);
				bound.offset = offset;
				bound.young = young;

				if (place < this._maxPixels) {
					this._repositionBound(bound);
					this.debounce("rebase-transform", this._rebaseTransform, 250);
				} else {
					this._rebaseTransform();
				}

				if (responder) {
					this.async(responder); // defer validation of the height
				}
			}
		},

		_calculateStaticPositionOffset: function (place, binds) {
			var limit = 0|place;
			var index = 0;
			var bound = null;
			var offset = 0;

			for (index; index < limit; index++) {
				bound = binds[index];
				offset += bound.height;
			}

			return offset;
		},

		_addBoundResponse: function (bound, id, index) {
			var responder = this._boundResponse.bind(bound);
			this._responders.boundMap[id] = null;
			this._responders.boundMap[id] = responder;
			this.addResizeListener(responder, bound.element);
			return responder;
		},

		_removeBoundResponse: function (bound, id, index) {
			var responder = this._responders.boundMap[id];
			this.removeResizeListener(responder, bound.element);
			this._responders.boundMap[id] = null;
		},

		_rebaseTransform: function () {
			var binds = this._bindingList;
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
				this._repositionBound(bound);
			}
		},

		_repositionBound: function (bound) {
			var position = bound.location - bound.offset - this._transformBaseline;
			this.translate3d(0, (position) +"px", 0, bound.element);
		},

		_applyTransform: function () {
			this._restyleMiddleHeight();
			this._repositionHeader();
			this._repositionFooter();
			this._repositionMiddle();
			this._repositionExtent();
		},

		_restyleMiddleHeight: function () {
			var height = (this._middleHeight - this._transformBaseline);
			this.$.middle.style.height = (height) + "px";
		},

		_assignMiddleHeight: function (height) {
			this._middleHeight = +height || 0;
			this._restyleMiddleHeight();
		},

		_deltaMiddleHeight: function (delta) {
			var height = (+delta || 0) + this._middleHeight;
			this._assignMiddleHeight(height);
		},

		_repositionExtent: function () {
			var position = -this._extentHeight + this._transformBaseline;
			this.translate3d(0, (position) + "px", 0, this.$.extent);
		},

		_repositionMiddle: function () {
			var position = (this._headerHeight + this._transformBaseline);
			this.translate3d(0, (position) + "px", 0, this.$.middle);
		},

		_repositionHeader: function () {
			var position = -(this._middleHeight - this._transformBaseline - this._scrollTop);
			this.translate3d(0, (position) + "px", 0, this.$.header);
		},

		_repositionFooter: function () {
			var position = -(this._middleHeight - this._transformBaseline - this._scrollTop);
			position += this._viewportHeight;
			this.translate3d(0, (position) + "px", 0, this.$.footer);
		},

	});

})(window.Strand = window.Strand || {});


