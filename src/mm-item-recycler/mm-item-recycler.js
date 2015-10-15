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
		this.pendingResponse = 0|false;
	}

	BoundReference.prototype = Object.create(null);

	function BoundValue () {
		this.model = null;
		this.scope = null;
	}

	BoundValue.prototype = Object.create(null);

	function ResponderStore (itemRecycler) {
		this.scroll = null;
		this.pane = null;
		this.header = null;
		this.footer = null;
		this.boundMap = {};
	}



	Polymer({
		is: 'mm-item-recycler',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.StampBindable,
			StrandTraits.WindowNotifier,
			StrandTraits.SizeResponsible,
		],

		properties: {
			gpu: {
				type: String,
				value: "2d",
			},
			_gpuAssignedOnce: String,
			xScroll: {
				type: String,
				value: "all",
				reflectToAttribute: true,
			},
			scope: {
				type: Object,
				value: null,
				notify: true,
			},
			itemTemplate: {
				type: String,
				// value: ""
				value: false
			},
			itemTemplateElement: {
				type: Object,
				value: null,
			},
			_templatized: {
				type: Object,
				value: null,
				readOnly: true,
			},
			index: {
				type: Number,
				value: 0,
				notify: true,
			},
			_desiredIndex: {
				type: Number,
				value: -1,
			},
			_bindingList: {
				type: Array,
				value: function () {
					return [];
				},
			},
			_waiting: {
				type: Boolean,
				value: false,
			},
			_initializable: {
				type: Boolean,
				value: false,
			},
			_itemHeight: {
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
			_viewportHeight: {
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
					responders.scroll = this._scrollHandler.bind(this);
					responders.pane = this._paneResponse.bind(this);
					responders.header = this._headerResponse.bind(this);
					responders.footer = this._footerResponse.bind(this);
					responders.extent = this._extentResponse.bind(this);
					return responders;
				},
			},
			_recycler: {
				type: Object,
				value: function () {
					return new Recycler(
						this._getItemHeight.bind(this),
						this._getQueriableLength.bind(this),
						this._handleRecycling.bind(this));
				},
			},
			_measurements: {
				type: Object,
				value: function () {
					return new Continuum(this._getItemHeight.bind(this));
				},
			},
			data: {
				type: Array,
				value: null,
				notify: true,
			},
		},

		observers: [
			"_needsInitialization(data, itemTemplate, itemTemplateElement)",
			"_scopeChanged(scope.*)",
			"_dataChanged(data.*)",
		],

		_dataChanged: function (change) {
			var prefix = "data.";
			var offset = prefix.length;
			var path = change.path;
			var modelChanged = path.indexOf(prefix) === 0;
			var delimiter = path.indexOf(".", offset);
			var num = 0;
			var binds = this._bindingList;
			var count = 0|(binds && binds.length);
			var index = 0;
			var bound = null;

			if (modelChanged &&
				delimiter > offset) {
				num = Number(path.slice(offset, delimiter));
				if (!isNaN(num)) {
					for (index; index < count; index++) {
						bound = binds[index];

						if (bound &&
							bound.young === num) {
							bound.instance.notifyPath("model." + change.path.slice(delimiter + 1), change.value);
						}
					}
				}
			}
		},

		_scopeChanged: function (change) {
			var binds = this._bindingList;
			var count = 0|(binds && binds.length);
			var index = 0;
			var bound = null;

			for (index = 0; index < count; index++) {
				bound = binds[index];

				if (bound) {
					bound.instance.notifyPath(change.path, change.value);
				}
			}
		},

		attached: function () {
			this.$.pane.addEventListener("scroll", this._responders.scroll, true);
			this.addResizeListener(this._responders.pane, this.$.pane);
			this.addResizeListener(this._responders.header, this.$.header);
			this.addResizeListener(this._responders.footer, this.$.footer);
			this.addResizeListener(this._responders.extent, this.$.extent);
		},

		detached: function () {
			this.$.pane.removeEventListener("scroll", this._responders.scroll);
			this.removeResizeListener(this._responders.pane, this.$.pane);
			this.removeResizeListener(this._responders.header, this.$.header);
			this.removeResizeListener(this._responders.footer, this.$.footer);
			this.removeResizeListener(this._responders.extent, this.$.extent);
		},

		_settleDown: function () {
			this.fire("presentation-settled");
		},

		_extentResponse: function (e) {
			if (this._waiting &&
				this.$.extent.offsetHeight > 0) {
				this._waiting = false;
				this.initialize();
			}
		},

		_paneResponse: function (e) {
			var itemRecycler = this;
			var delta = +(itemRecycler.$.pane.offsetHeight - itemRecycler._viewportHeight) || 0;

			delta -= (this._headerHeight + this._footerHeight);

			if (delta) {
				itemRecycler._viewportHeight += delta;

				itemRecycler._recycler.resizeFrame(itemRecycler._viewportHeight);
				itemRecycler._repositionFooter();
				itemRecycler.debounce("settle-down", itemRecycler._settleDown, 1);
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
				itemRecycler.debounce("settle-down", itemRecycler._settleDown, 1);
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
				itemRecycler.debounce("settle-down", itemRecycler._settleDown, 1);
			}
		},

		_boundResponse: function (ev) {
			var bound = this;
			var height = bound.height;
			var delta = +(bound.element.offsetHeight - height) || 0;
			var itemRecycler = bound.itemRecycler;
			var change = 0;
			var initialization = true;

			bound.height += delta;
			itemRecycler._measurements.setHeight(bound.young, bound.height);

			if (delta) {
				if (bound.height) {
					if (!itemRecycler._itemHeight) {
						change = itemRecycler._accommodateGlobalHeightAdjustment(0|initialization, bound, delta);
						itemRecycler.async(itemRecycler._modifyPadding, 1);
						if (itemRecycler._desiredIndex > -1) {
							//Initialize scrollTop to supplied index
							itemRecycler.async(itemRecycler.scrollToIndex);
						}
					} else if (itemRecycler._itemHeight < 0) {
						change = itemRecycler._accommodateGlobalHeightAdjustment(0|!initialization, bound, delta);
						itemRecycler.async(itemRecycler._modifyPadding, 1);
					}
				}
				itemRecycler._changeOffsetsAfter(bound, delta);
				itemRecycler._deltaMiddleHeight(itemRecycler._recycler.setHeightAtIndex(bound.young, bound.height));
				itemRecycler._repositionHeader();
				itemRecycler._repositionFooter();
				if (delta + change) {
					itemRecycler._paneResponse(null);
				}
				itemRecycler.debounce("settle-down", itemRecycler._settleDown, 1);
			} else if (bound.pendingResponse) {
				itemRecycler.debounce("settle-down", itemRecycler._settleDown, 1);
			}

			if (itemRecycler._itemHeight < 0) {
				itemRecycler._itemHeight = -itemRecycler._itemHeight;
			}

			bound.pendingResponse = 0|false;
		},

		_accommodateGlobalHeightAdjustment: function (initialization, bound, delta) {
			var adjustment = 0|(bound.height + this._itemHeight);
			var change = 0;

			this._itemHeight = 0|bound.height;

			if (initialization) {
				change = (this._getDataLength() - 1) * adjustment;
				this._deltaMiddleHeight(change);
			} else {
				this._measurements.terminate(0);
				change = (this._getDataLength() * bound.height) - delta - this._middleHeight;
				this._deltaMiddleHeight(change);
				this._recycler.transactHeightMutations(this._reinitTxn, this, bound);
			}

			return change;
		},

		_reinitTxn: function (fn, itemRecycler, bound) {
			var transactor = this;
			var count = itemRecycler._getDataLength();
			var index = 0;

			for (index = 0; index < count; index++) {
				if (index !== bound.young) {
					transactor.assignHeightAtIndex(index, itemRecycler._itemHeight);
				}
			}
		},

		_modifyPadding: function () {
			var binds = this._bindingList;
			var count = 0|(binds && binds.length);
			var index = 0;
			var bound = null;
			var offset = 0;

			for (index = 0; index < count; index++) {
				bound = binds[index];
				if (bound &&
					bound.offset !== offset) {
					bound.offset = offset;
					this._repositionBound(bound);
				}
				offset += bound.height;
			}

			if (this._itemHeight > 0) {
				this._recycler.repadFrame(0|this._itemHeight, 0|this._itemHeight);
			}
		},

		_changeOffsetsAfter: function (reference, delta) {
			var binds = this._bindingList;
			var count = 0|(delta && binds && binds.length);
			var index = 0;
			var bound = null;

			for (index = 1 + (0|reference.id); index < count; index++) {
				bound = binds[index];

				if (bound) {
					bound.offset += delta;
					this._repositionBound(bound);
				}
			}
		},

		_needsInitialization: function () {
			this._initializable = false;
			this.initialize();
		},

		initialize: function () {
			if (!this.data) {
				return 0|false;
			} else if (!this.initializeTemplateBind()) {
				return 0|false;
			} else if (this.$.extent.offsetHeight < 1) {
				this._waiting = true;
				return 0|false;
			} else {
				this._waiting = false;
				this.debounce("initializeRecycler", this.initializeRecycler);
				return 0|true;
			}
		},

		initializeTemplateBind: function () {
			if (!this.itemTemplateElement &&
				this.itemTemplate &&
				typeof this.itemTemplate === "string") {
				this.itemTemplateElement = Polymer.dom(this).querySelector("template#" + this.itemTemplate);
			}

			if(!this.itemTemplateElement) {
				return 0|false;
			} else {
				if (this._templatized !== this.itemTemplateElement) {
					this._set_templatized(this.itemTemplateElement);
					this.templatize(this.itemTemplateElement);
				}
				return 0|true;
			}
		},

		initializeRecycler: function() {
			if (!this._initializable) {
				if (this._recycler.truncate(0)) {
					this._scrollTop = 0;
					this.$.pane.scrollTop = 0;
					this._itemHeight = 0;
				}

				this._recycler.setFrame(0, 0, 0, 0);

				this._measurements.terminate(0);

				this._initializeViewport();

				this._initializable = true;
				this._waiting = false;
				return 0|true;
			} else {
				return 0|false;
			}
		},

		_initializeViewport: function() {
			var viewportHeight = this.$.pane.offsetHeight;

			this._headerHeight = this.$.header.offsetHeight;
			this._footerHeight = this.$.footer.offsetHeight;
			this._extentHeight = this.$.extent.offsetHeight;

			viewportHeight -= (this._headerHeight + this._footerHeight);
			this._viewportHeight = viewportHeight;

			this._assignMiddleHeight(this._viewportHeight || 1);
			this._repositionHeader();
			this._repositionFooter();
			this._repositionMiddle();
			this._repositionExtent();

			this._recycler.setFrame(0, this._middleHeight, 0|this._itemHeight, 0|this._itemHeight);

			if (this._desiredIndex < 0) {
				this._desiredIndex = 0|this.index;
			}
		},

		scrollToIndex: function(value, force) {
			var direction = (+force || 0)
			var index = 0|(arguments.length ? value : this._desiredIndex);
			var count = 0|(this.data && this.data.length);
			var upper = 0;
			var lower = 0;
			var change = 0;

			this._desiredIndex = -1;

			if (index > -1 &&
				index < count) {
				if (index < this._getDataLength()) {
					lower = this._recycler.getElevationAtIndex(index);

					if (direction < 0 || (!direction && this._scrollTop >= lower)) {
						this.$.pane.scrollTop = lower;
						change = this._scrollTop - lower;
					} else {
						upper = this._recycler.getElevationAtIndex(index + 1);
						if (direction > 0 || this._scrollTop < upper - this._viewportHeight) {
							this.$.pane.scrollTop = upper - this._viewportHeight;
							change = this._scrollTop - (upper - this._viewportHeight);
						}
					}

					if (change) {
						this._desiredIndex = index;
					}

					return 0|true;
				} else {
					return 0|null;
				}
			} else {
				return 0|false;
			}
		},

		_determineIndex: function () {
			var value = this._scrollTop;
			var index = this._recycler.getLowestIndex() + 1;
			var limit = this._recycler.getHighestIndex() + 1;

			for (index; index < limit; index++) {
				if (this._recycler.getElevationAtIndex(index) > value) {
					break;
				}
			}

			this.index = index - 1;
		},

		scrollBy: function (amount) {
			var delta = +amount || 0;

			if (delta) {
				this._repositionHeader();
				this._repositionFooter();
				this._recycler.translateFrame(delta);
			}

			this._determineIndex();

			if (this._desiredIndex > -1 &&
				this.hasMeasuredAnItem()) {
				this.debounce("seek", this.scrollToIndex);
			}
		},

		_scrollResponse: function () {
			var delta = this.$.pane.scrollTop - this._scrollTop;
			var diff = this._middleHeight - this._viewportHeight;

			this._scrollTop = this.$.pane.scrollTop;

			if (diff < this._scrollTop &&
				diff > 0) {
				delta -= this._scrollTop - diff;
				this._scrollTop = diff;
				this.scrollBy(delta);
				this.$.pane.scrollTop = this._scrollTop;
			} else {
				this.scrollBy(delta);
			}
		},

		_scrollHandler: function(e) {
			if (e.target === this.$.pane) {
				e.stopImmediatePropagation();
				this.debounce("work", this._scrollResponse);
			}
		},

		inferOffviewHeightsAfterNextMutation: function () {
			if (this._itemHeight > 0) {
				this._itemHeight = -this._itemHeight;
				this._measurements.terminate(0);
			}
		},

		_getDataLength: function () {
			var count = 0|(this.data && this.data.length);
			if (!this._itemHeight) {
				return count ? 1 : 0;
			} else {
				return count;
			}
		},

		_getQueriableLength: function (preferredCount, minimumAffirmativeCount, recycler) {
			return this._getDataLength();
		},

		_getItemHeight: function (atIndex, recycler) {
			if (!this._itemHeight) {
				return this._viewportHeight || 1;
			} else if (this._itemHeight < 0) {
				return -this._itemHeight;
			} else {
				return this._itemHeight;
			}
		},

		_handleRecycling: function (id, young, old, recycler) {
			var index = 0|id;
			var bound = null;
			var binds = this._bindingList;
			var count = 0|(binds && binds.length);
			var place = 0;
			var height = 0;
			var content = null;
			var offset = this._calculateStaticPositionOffset(index, binds);

			if (old < 0) {
				while (count < index) {
					count = binds.push(null);
				}
				count = binds.push(bound = new BoundReference(this, id));
				bound.value = new BoundValue(null, this.scope);
				bound.instance = this.stamp(bound.value);

				// assigning to the bound.value pre-stamp() is not sufficient -- must use bound.instance.set()
				bound.instance.set("scope", this.scope);
				bound.instance.set("model", this.data[young]);

				content = Polymer.dom(bound.instance.root).querySelector("*");
				bound.element = document.createElement("DIV");
				this.toggleClass("recycler-panel", true, bound.element);
				Polymer.dom(bound.element).appendChild(content);
				Polymer.dom(this.$.middle).appendChild(bound.element);
				this._addBoundResponse(bound, id, index);
			} else if (young < 0) {
				bound = binds[index];
				this._removeBoundResponse(bound, id, index);
				Polymer.dom(Polymer.dom(bound.element).parentNode).removeChild(bound.element);
				bound = binds[index] = null;
				while (count > 0 && !binds[--count]) {
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

				if (this._measurements.isHeightKnown(young)) {
					height = this._measurements.getHeight(young);
				} else {
					height = recycler.getHeightAtIndex(young);
					bound.pendingResponse = 0|true;
					this.debounce(young, this._getBoundResponse(bound, id, index)); // defer validation of the height
				}

				if (this._measurements.isElevationKnown(young)) {
					place = bound.location = this._measurements.getElevation(young);
				} else {
					place = bound.location = recycler.getElevationAtIndex(young);
				}

				this._changeOffsetsAfter(bound, height - bound.height);
				bound.height = height;
				bound.offset = offset;
				bound.young = young;

				if (place < this._maxPixels) {
					this._repositionBound(bound);
					this.debounce("rebase-transform", this._rebaseTransform, 250);
				} else {
					this._rebaseTransform();
				}
			}

			this.debounce("settle-down", this._settleDown, 1);
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

		_getBoundResponse: function (bound, id, index) {
			return this._responders.boundMap[id];
		},

		_removeBoundResponse: function (bound, id, index) {
			var responder = this._responders.boundMap[id];
			this.removeResizeListener(responder, bound.element);
			this._responders.boundMap[id] = null;
		},

		_rebaseTransform: function () {
			var binds = this._bindingList;
			var minimum = binds ? binds.reduce(this._minimumElevationReducer, this._someBoundLocation(binds)) : 0;

			this._transformBaseline = minimum;
			binds && binds.forEach(this._rebaseEachTransform, this);
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

		_gpu: function () {
			if (!this._gpuAssignedOnce) {
				this._gpuAssignedOnce = String(this.gpu);
				switch (this._gpuAssignedOnce) {
					default: this._gpuAssignedOnce = "2d";
					case "3d":
					case "2d":
				}
			}

			return this._gpuAssignedOnce;
		},

		_setTranslation: function (value, target) {
			switch (this._gpu()) {
				case "3d": this.translate3d(0, value + "px", 0, target); break;
				case "2d": target.style.top = value + "px"; break;
			}
		},

		_repositionBound: function (bound) {
			var position = bound.location - bound.offset - this._transformBaseline;
			this._setTranslation(position, bound.element);
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
			this._setTranslation(position, this.$.extent);
		},

		_repositionMiddle: function () {
			var position = (this._headerHeight + this._transformBaseline);
			this._setTranslation(position, this.$.middle);
		},

		_repositionHeader: function () {
			var position = -(this._middleHeight - this._transformBaseline - this._scrollTop);
			this._setTranslation(position, this.$.header);
		},

		_repositionFooter: function () {
			var position = -(this._middleHeight - this._transformBaseline - this._scrollTop);
			position += this._viewportHeight;
			this._setTranslation(position, this.$.footer);
		},



		pathAtIndex: function (index) {
			return 0|index;
		},

		indexFromPath: function (first) {
			if (!Array.isArray(first)) {
				return 0|first;
			} else if (first.length === 1) {
				return 0|first[0];
			} else {
				return -1;
			}
		},

		hasMeasuredAnItem: function () {
			return 0|(this._itemHeight ? true : false);
		},

		getHeightAtIndex: function () {
			var recycled = null;
			if (this._itemHeight) {
				return this._recycler.getHeightAtIndex.apply(this._recycler, arguments);
			} else {
				// especially relevant when measurements are available before mutation observer fires
				recycled = Polymer.dom(this.$.middle).querySelector(".recycler-panel");
				return recycled && recycled.offsetHeight || null;
			}
		},

		getMaterializedIndices: function (use) {
			var indices = Array.isArray(use) ? use : [];
			var binds = this._bindingList;
			return binds && binds.reduce(this._assignYoungFromBoundReducer, indices);
		},

		_assignYoungFromBoundReducer: function (reduction, bound, index) {
			reduction[index] = bound ? bound.young : -1;
			return reduction;
		},

		_getMaterializedBoundAtIndex: function (index) {
			var young = 0|index;
			var bound = null;
			var binds = this._bindingList;
			var count = 0|(binds && binds.length);
			var index = 0;

			for (index = 0; index < count; index++) {
				bound = binds[index];
				if (bound &&
					bound.young === young) {
					return bound;
				}
			}

			return null;
		},

		hasMaterializedIndex: function (index) {
			if (this._getMaterializedBoundAtIndex(index)) {
				return 0|true;
			} else {
				return 0|false;
			}
		},

		querySelectorAtIndex: function (selector, index) {
			var bound = this._getMaterializedBoundAtIndex(index);

			if (bound &&
				bound.element) {
				return Polymer.dom(bound.element).querySelector(selector);
			} else {
				return null;
			}
		},

		querySelectorAllAtIndex: function (selector, index) {
			var bound = this._getMaterializedBoundAtIndex(index);

			if (bound &&
				bound.element) {
				return Polymer.dom(bound.element).querySelectorAll(selector);
			} else {
				return null;
			}
		},

		getBoundingClientRectAtIndex: function (index) {
			var bound = this._getMaterializedBoundAtIndex(index);

			if (bound &&
				bound.element) {
				return bound.element.getBoundingClientRect();
			} else {
				return null;
			}
		},

		querySelectorOfHeader: function (selector) {
			return Polymer.dom(this.$.header).querySelector(selector);
		},

		querySelectorAllOfHeader: function (selector) {
			return Polymer.dom(this.$.header).querySelectorAll(selector);
		},

		getBoundingClientRectOfHeader: function () {
			return this.$.header.getBoundingClientRect();
		},

		querySelectorOfFooter: function (selector) {
			return Polymer.dom(this.$.footer).querySelector(selector);
		},

		querySelectorAllOfFooter: function (selector) {
			return Polymer.dom(this.$.footer).querySelectorAll(selector);
		},

		getBoundingClientRectOfFooter: function () {
			return this.$.footer.getBoundingClientRect();
		},

	});

})(window.Strand = window.Strand || {});


