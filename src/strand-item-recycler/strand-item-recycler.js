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

	function _identity (value) {
		return value;
	}

	function _orderBindsByDOM (less, more) {
		return less.nthDOM - more.nthDOM;
	}

	function _boundResponse (ev) {
		var bound = this;
		var height = bound.height;
		var delta = +(elementHeight(bound.element) - height) || 0;
		var itemRecycler = bound.itemRecycler;
		var change = 0;
		var initialization = true;

		if (!itemRecycler) {
			return;
		} else if (delta > 0 ||
			itemRecycler._itemHeight <= 0 ||
			itemRecycler._itemHeight && delta < 0) {
			bound.height += delta;
			itemRecycler._measurements.setHeight(bound.young, bound.height);

			if (bound.height) {
				if (!itemRecycler._itemHeight) {
					if (!height) {
						// resulted from an initializing splice
						itemRecycler._deltaMiddleHeight(-itemRecycler._viewportHeight);
					}
					change = itemRecycler._accommodateGlobalHeightAdjustment(0|initialization, bound, delta);
					itemRecycler.async(itemRecycler._modifyPadding, 1);
					if (itemRecycler._desiredIndex > -1) {
						//Initialize scrollTop to supplied index
						itemRecycler.async(itemRecycler._scrollToIndex);
					}
					if (itemRecycler._initialized) {
						itemRecycler._setMeasuring(false);
					}
				} else if (itemRecycler._itemHeight < 0) {
					change = itemRecycler._accommodateGlobalHeightAdjustment(0|!initialization, bound, delta);
					itemRecycler.async(itemRecycler._modifyPadding, 1);
				}
			}
			itemRecycler._changeOffsetsAfter(bound.nthDOM, delta);
			itemRecycler._deltaMiddleHeight(itemRecycler._recycler.setHeightAtIndex(bound.young, bound.height));
			itemRecycler._repositionHeader();
			itemRecycler._repositionFooter();
			if (delta + change) {
				itemRecycler._paneResponse(null);
			}
			itemRecycler.debounce("settle-down", itemRecycler._settleDown, 1);
		} else if (bound.pendingResponse) {
			itemRecycler._measurements.setHeight(bound.young, bound.height);
			itemRecycler.debounce("settle-down", itemRecycler._settleDown, 1);
		}

		if (itemRecycler._itemHeight < 0) {
			itemRecycler._itemHeight = -itemRecycler._itemHeight;
		}

		bound.pendingResponse = 0|false;
	};

	function BoundReference (itemRecycler, nthBind) {
		this.itemRecycler = itemRecycler;
		this.nthBind = nthBind; // deprecated
		this.nthDOM = -1;
		this.young = -1;
		this.height = 0;
		this.offset = 0;
		this.location = 0;
		this.instance = null;
		this.element = null;
		this.value = null;
		this.pendingResponse = 0|false;
		this.responder = _boundResponse.bind(this);
	}

	BoundReference.prototype = Object.create(null);

	function BoundValue (model, scope) {
		var count = arguments.length;
		this.model = count > 0 ? model : null;
		this.scope = count > 1 ? scope : null;
	}

	BoundValue.prototype = Object.create(null);

	function ResponderStore (itemRecycler) {
		this.scroll = null;
		this.pane = null;
		this.header = null;
		this.footer = null;
	}



	function elementHeight (element) {
		return element.getBoundingClientRect().height; // Firefox uses doubles
		// return element.offsetHeight; // only provides integers
	}

	function roundMaybe (value) {
		return value;
		//return 0|value; // somewhat related to elementHeight() above
	}



	Polymer({
		is: 'strand-item-recycler',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.WindowNotifier,
			StrandTraits.MixinFindable,
			StrandTraits.TemplateFindable,
			StrandTraits.TemplateComponentizable,
			StrandTraits.SizeResponsible,
			StrandTraits.Refable,
			StrandTraits.PoolUsable,
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
				value: function () {
					return this;
				},
				notify: true,
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
			_initialized: {
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
			measuring: {
				type: Boolean,
				value: false,
				notify: true,
				readOnly: true,
				reflectToAttribute: true,
			},
			data: {
				type: Array,
				value: null,
				notify: true,
			},
		},

		observers: [
			"_needsInitialization(data, _templateFound)",
			"_scopeChanged(scope.*)",
			"_dataChanged(data.*)",
			"_dataSpliced(data.splices)",
		],

		_spliceTxn: function (fn, itemRecycler, splices) {
			var transactor = this;
			var count = 0|(splices && splices.length);
			var index = 0;
			var mutation = null;
			var added = 0;
			var removed = 0;
			var deltaHeight = 0;
			var knownHeights = 0;

			for (index; index < count; index++) {
				mutation = splices[index];
				if (removed = 0|mutation.removed.length) {
					knownHeights = itemRecycler._measurements.areHeightsKnown(mutation.index, removed);
					deltaHeight -= itemRecycler._getItemHeight() * (removed - knownHeights);
					deltaHeight -= itemRecycler._measurements.removeHeights(mutation.index, removed);

					transactor.removeHeightsAtIndex(mutation.index, removed);
				}
				if (added = 0|mutation.addedCount) {
					itemRecycler._measurements.addHeights(mutation.index, added);
					// height initialization array required to keep _middleHeight accurate
					if (itemRecycler._itemHeight) {
						deltaHeight += itemRecycler._getItemHeight() * added;
					}
					transactor.addHeightsAtIndex(mutation.index, added, itemRecycler._spliceHeights(added));
				}
			}

			itemRecycler._deltaMiddleHeight(deltaHeight);
			itemRecycler._applyTransform();
		},

		_spliceHeights: function (amount) {
			var count = 0|amount;
			var index = 0;
			var list = new Array(count);
			var size = this._itemHeight ? this._getItemHeight() : 0;

			for (index; index < count; index++) {
				list[index] = size;
			}

			return list;
		},

		_dataSpliced: function(record) {
			var binds = this._bindingList;
			var young = -1;
			var splices = record ? record.indexSplices : null;
			var count = 0|(splices && splices.length);
			var index = 0;
			var delta = 0;
			var lower = this._getDataLength();
			var upper = -1;
			var added = 0;
			var at = 0;

			if (!count) {
				return;
			}

			for (index; index < count; index++) {
				at = splices[index].index;
				added = splices[index].addedCount;
				delta += added - splices[index].removed.length;

				if (lower > at) {
					lower = at;
				}

				if (upper < at + added) {
					upper = at + added - 1;
				}
			}

			if (delta) {
				if (this.data.length - delta === 0) {
					this._setMeasuring(true);
				}
				this._recycler.transactHeightMutations(this._spliceTxn, this, splices);
				this.async(this.cull);
			}

			at = this._recycler.getLowestIndex();

			if (at > -1 &&
				lower > at) {
				lower = at;
			}

			at = this._recycler.getHighestIndex();

			if (at > -1 &&
				upper < at) {
				upper = at;
			}

			if (upper < lower) {
				return;
			}

			added = upper - lower + 1 + delta;
			count = binds.length;
			index = 0;
			for (index; index < count; index++) {
				young = binds[index].young;

				if (young < lower ||
					young > upper) {
					continue;
				}

				binds[index].instance.notifyPath("model", this.data[young]);
				binds[index].instance.notifyPath("index", young);

				if (2 > added--) {
					break;
				}
			}
		},

		_dataChanged: function (change) {
			var prefix = "data.";
			var offset = prefix.length;
			var path = change.path;
			var modelChanged = path.indexOf(prefix) === 0;
			var delimiter = path.indexOf(".", offset);
			var num = NaN;
			var binds = this._bindingList;
			var count = 0|(binds && binds.length);
			var index = 0;
			var bound = null;
			var convert = 0|false;
			var model = null;

			if (modelChanged) {
				if (path.charCodeAt(offset) === "#".charCodeAt(0)) {
					offset += 1;
					convert = 0|true;
				}

				if (delimiter < offset) {
					delimiter = path.length;
				}

				if (delimiter > offset) {
					num = Number(path.slice(offset, delimiter));
				}

				if (!isNaN(num)) {
					if (convert) {
						model = Polymer.Collection.get(this.data).getItem("#"+num);
						for (index; index < count; index++) {
							bound = binds[index];

							if (bound &&
								bound.value &&
								this.data[bound.young] === model) {
								bound.value.model = model;
								bound.instance.notifyPath("model" + change.path.slice(delimiter), change.value);
							}
						}
					} else {
						for (index; index < count; index++) {
							bound = binds[index];

							if (bound &&
								bound.young === num) {
								bound.value.model = this.data[num];
								bound.instance.notifyPath("model" + change.path.slice(delimiter), change.value);
							}
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
		},

		detached: function () {
			this.$.pane.removeEventListener("scroll", this._responders.scroll);
			this.removeResizeListener(this._responders.pane, this.$.pane);
			this.removeResizeListener(this._responders.header, this.$.header);
			this.removeResizeListener(this._responders.footer, this.$.footer);
		},

		_settleDown: function () {
			this.fire("presentation-settled");
		},

		_paneResponse: function (e) {
			var itemRecycler = this;
			var delta = +(elementHeight(itemRecycler.$.quad) - itemRecycler._viewportHeight) || 0;

			delta -= (this._headerHeight + this._footerHeight);

			if (delta) {
				itemRecycler._viewportHeight += delta;

				if (itemRecycler._initialized) {
					itemRecycler._recycler.resizeFrame(itemRecycler._viewportHeight);
				}
				itemRecycler._repositionFooter();
				itemRecycler.debounce("settle-down", itemRecycler._settleDown, 1);
			}
		},

		_headerResponse: function (e) {
			var itemRecycler = this;
			var delta = +(elementHeight(itemRecycler.$.header) - itemRecycler._headerHeight) || 0;

			if (delta) {
				itemRecycler._headerHeight += delta;
				itemRecycler._viewportHeight -= delta;

				if (itemRecycler._initialized) {
					itemRecycler._recycler.resizeFrame(itemRecycler._viewportHeight);
				}
				itemRecycler._repositionMiddle();
				itemRecycler._repositionFooter();
				itemRecycler.debounce("settle-down", itemRecycler._settleDown, 1);
			}
		},

		_footerResponse: function (e) {
			var itemRecycler = this;
			var delta = +(elementHeight(itemRecycler.$.footer) - itemRecycler._footerHeight) || 0;

			if (delta) {
				itemRecycler._footerHeight += delta;
				itemRecycler._viewportHeight -= delta;

				if (itemRecycler._initialized) {
					itemRecycler._recycler.resizeFrame(itemRecycler._viewportHeight);
				}
				itemRecycler._repositionFooter();
				itemRecycler.debounce("settle-down", itemRecycler._settleDown, 1);
			}
		},

		_accommodateGlobalHeightAdjustment: function (initialization, bound, delta) {
			var adjustment = roundMaybe(bound.height + this._itemHeight);
			var change = 0;

			this._itemHeight = roundMaybe(bound.height);

			if (initialization) {
				change = (this._getDataLength() - this._measurements.getDiscreteCount()) * adjustment;
				if (this._viewportHeight <= 0) {
					change -= 1; // accounting for enforced minimum from _initializeViewport()
				}
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
			var sorted = binds;
			var count = 0;
			var index = 0;
			var bound = null;
			var offset = 0;

			if (this._itemHeight > 0) {
				this._provideMarginOfError();
				this._denyMarginOfError();
			}

			sorted = !binds ? null : binds.filter(_identity).sort(_orderBindsByDOM);
			count = 0|(sorted && sorted.length);

			for (index = 0; index < count; index++) {
				bound = sorted[index];
				if (bound &&
					bound.offset !== offset) {
					bound.offset = offset;
					this._repositionBound(bound);
				}
				offset += bound.height;
			}
		},

		_provideMarginOfError: function () {
			var height = roundMaybe(this._itemHeight);
			var extra = 3 * height;
			this._recycler.repadFrame(height + extra, height + extra);
		},

		_denyMarginOfError: function () {
			var height = roundMaybe(this._itemHeight);
			this._recycler.repadFrame(height, height);
		},

		cull: function () {
			this._provideMarginOfError();
			this._recycler.cull();
			this._denyMarginOfError();

			this.async(this._modifyPadding, 1);
		},

		_changeOffsetsAfter: function (nthDOM, delta) {
			var binds = this._bindingList;
			var count = 0|(delta && binds && binds.length);
			var index = 0;
			var bound = null;

			for (index; index < count; index++) {
				bound = binds[index];

				if (bound &&
					bound.nthDOM > nthDOM) {
					bound.offset += delta;
					this._repositionBound(bound);
				}
			}
		},

		_needsInitialization: function (data, _templateFound) {
			this._initializable = true;
			this._initialized = false;
			this.initialize();
		},

		initialize: function () {
			if (!this.data) {
				return 0|false;
			} else if (!this.hasTemplate()) {
				return 0|false;
			} else {
				this._setMeasuring(true);
				this.debounce("initializeRecycler", this.initializeRecycler, 1);
				return 0|true;
			}
		},

		initializeRecycler: function() {
			if (this._initializable) {
				if (this._recycler.truncate(0)) {
					this._scrollTop = 0;
					this.$.pane.scrollTop = 0;
					this._itemHeight = 0;
				}

				this._recycler.setFrame(0, 0, 0, 0);

				this._measurements.terminate(0);

				this._initializeViewport();

				this._initializable = false;
				this._initialized = true;

				if (!this.data ||
					!this.data.length) {
					this._setMeasuring(false);
				}

				return 0|true;
			} else {
				return 0|false;
			}
		},

		_initializeViewport: function() {
			var viewportHeight = elementHeight(this.$.quad);

			this._headerHeight = elementHeight(this.$.header);
			this._footerHeight = elementHeight(this.$.footer);

			viewportHeight -= (this._headerHeight + this._footerHeight);
			this._viewportHeight = viewportHeight;

			if (this._viewportHeight > 0) {
				this._assignMiddleHeight(this._viewportHeight);
			} else {
				this._assignMiddleHeight(1); // accounted for in _accommodateGlobalHeightAdjustment()
			}
			this._repositionHeader();
			this._repositionFooter();
			this._repositionMiddle();

			var index = 0|this.index;
			var padding = roundMaybe(this._itemHeight);

			this.index = 0;
			this._recycler.setFrame(0, this._middleHeight, padding, padding);

			if (this._desiredIndex < 0) {
				this._desiredIndex = index;
			}
		},

		_scrollToIndex: function () {
			this.scrollToIndex(this._desiredIndex, -1);
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
						change = this._scrollTop - this.$.pane.scrollTop;
					} else {
						upper = this._recycler.getElevationAtIndex(index + 1);
						if (direction > 0 || this._scrollTop < upper - this._viewportHeight) {
							this.$.pane.scrollTop = upper - this._viewportHeight;
							change = this._scrollTop - this.$.pane.scrollTop;
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

			//this._recycler.repositionFrame(this._scrollTop);

			this._determineIndex();

			if (this._desiredIndex > -1 &&
				this.hasMeasuredAnItem()) {
				this.debounce("seek", this._scrollToIndex);
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

		_handleRecycling: function (clustered, young, old, recycler) {
			var index = 0|(clustered);
			var spliced = 0|(0|index < 0);
			var bound = null;
			var binds = this._bindingList;
			var count = 0|(binds && binds.length);
			var place = 0;
			var height = 0;
			var useLightDom = 0|true;

			if (spliced) {
				if (old < 0) {
					bound = this._includeBoundAtIndex(-1 - index, young, spliced, useLightDom);
					count++;
				} else if (young < 0) {
					this.debounce("offset-removal", this._modifyPadding);
					bound = this._excludeBoundAtIndex(-1 - index, old, spliced);
					bound = null;
					while (count-- > 0 && !binds[count]) {
						binds.pop();
					}
					count++;
				} else {
					return;
				}
			} else if (old < 0) {
				if (count !== index) {
					throw new Error("Recycler constraints broken -- count !== index: "+ count + " / " + index);
				}
				bound = this._includeBoundAtIndex(index, young, spliced, useLightDom);
				count++;
			} else if (young < 0) {
				this.debounce("offset-removal", this._modifyPadding);
				bound = this._excludeBoundAtIndex(index, old, spliced);
				bound = null;
				while (count-- > 0 && !binds[count]) {
					binds.pop();
				}
				count++;
			} else if (index < count) {
				bound = binds[index];
			}

			if (bound) {
				if (old !== young || spliced) {
					bound.value.model = this.data[young];
					bound.instance.set("model", bound.value.model);
					bound.instance.set("index", young);
				}

				if (this._measurements.isHeightKnown(young)) {
					height = this._measurements.getHeight(young);
					// note: necessary because of bound-pooling's effect on size-responsible
					this.debounce(young, this._getBoundResponse(bound));
				} else {
					height = recycler.getHeightAtIndex(young);
					bound.pendingResponse = 0|true;
					// defer validation of the height
					this.debounce(young, this._getBoundResponse(bound), 0|!(this._itemHeight > 0));
				}

				if (this._measurements.isElevationKnown(young)) {
					place = bound.location = this._measurements.getElevation(young);
				} else {
					place = bound.location = recycler.getElevationAtIndex(young);
				}

				bound.young = young;
				this._changeOffsetsAfter(bound.nthDOM, height - bound.height);
				bound.height = height;
				bound.offset = this._calculateStaticPositionOffset(bound.nthDOM);

				if (place < this._maxPixels) {
					this._repositionBound(bound);
					this.debounce("rebase-transform", this._rebaseTransform, 250);
				} else {
					this._rebaseTransform();
				}
			} else if (spliced) {
				this.async(this._applyTransform);
			}

			this.debounce("settle-down", this._settleDown, 1);
		},

		_retrofitBound: function (bound, nthDOM, young, useLightDom) {
				bound.nthDOM = nthDOM;
				bound.value = new BoundValue(this.data[young], this.scope);

				bound.instance = this.instantiateTemplate(this._templateFound, 0|!useLightDom, this);
				bound.instance.set("scope", this.scope);
				bound.instance.set("model", bound.value.model);
				bound.instance.set("index", young);
		},

		_demandBound: function () {
			var bound = this.poolDemand(null) || new BoundReference(this, -1);

			if (!bound.element) {
				bound.element = document.createElement("DIV");
				this.toggleClass("recycler-panel", true, bound.element);
				this._addBoundResponse(bound);
			}

			bound.itemRecycler = this;

			return bound;
		},

		_supplyBound: function (bound) {
			var parent = bound.element;
			var child = parent.lastChild;
			if (child) do {
				if (child.localName === "div" &&
					/^strand-gen-comp-/.test(child.is)) {
					parent.removeChild(child);
				}
			} while (child = child.previousElementSibling)

			this.value = null;
			bound.offset = 0;
			bound.position = 0;
			this._setTranslation(0, bound.element);
			this.poolSupply(bound);
		},

		_adjustNthDOM: function (limit, delta) {
			var binds = this._bindingList;
			var count = binds.length;
			var index = 0;
			var bound = null;
			var amount = 0|delta;
			var nthDOM = 0|limit;

			for (index = 0; index < count; index++) {
				bound = binds[index];
				if (bound &&
					bound.nthDOM > nthDOM) {
					bound.nthDOM += amount;
				}
			}
		},

		_calculateStaticPositionOffset: function (nthDOM) {
			var binds = this._bindingList;
			var count = binds.length;
			var index = 0;
			var bound = null;
			var offset = 0;

			for (index; index < count; index++) {
				bound = binds[index];
				if (bound &&
					bound.nthDOM < nthDOM) {
					offset += bound.height;
				}
			}

			return offset;
		},

		_includeBoundAtIndex: function (nthBind, young, spliced, useLightDom) {
			var index = 0|nthBind;
			var binds = this._bindingList;
			var count = binds.length;
			var bound = this._demandBound();
			var included = bound;
			var replaced = included;
			var limit = young - 1;

			if (spliced) {
				for (index = 0; index < count; index++) {
					bound = binds[index];
					if (bound &&
						bound.young > limit) {
						if (young === bound.young++) {
							replaced = bound;
						}
					}
				}
			} else {
				for (index = 0; index < count; index++) {
					bound = binds[index];
					if (bound) {
						if (replaced.young > bound.young ||
							replaced === included) {
							replaced = bound;
						}
					}
				}

				if (replaced.nthDOM === 0) {
					replaced = included;
				}
			}

			if (replaced === included) {
				replaced = null;
				limit = count;
			} else {
				limit = replaced.nthDOM;
			}

			this._adjustNthDOM(limit - 1, 1);

			bound = included;
			index = 0|nthBind;

			if (count !== index) {
				throw new Error("Internal recycling inconsistency due to splicing");
			}

			binds[index] = bound;

			this._retrofitBound(bound, limit, young, useLightDom);

			Polymer.dom(bound.element).appendChild(bound.instance);
			if (replaced) {
				Polymer.dom(this.$.middle).insertBefore(bound.element, replaced.element);
			} else {
				Polymer.dom(this.$.middle).appendChild(bound.element);
			}

			return bound;
		},

		_excludeBoundAtIndex: function (nthBind, old, spliced) {
			var index = 0|nthBind;
			var binds = this._bindingList;
			var count = binds.length;
			var bound = binds[index];
			var excluded = bound;
			var limit = count - 1;

			bound = binds[index];
			binds[index] = binds[limit];
			binds[limit] = bound;

			binds[index].nthBind = index;
			binds[limit].nthBind = limit;

			if (spliced) {
				limit = old - 1;

				for (index = 0; index < count; index++) {
					bound = binds[index];
					if (bound &&
						bound.young > limit) {
						bound.young--;
					}
				}
			}

			this._adjustNthDOM(excluded.nthDOM, -1);

			bound = excluded;
			index = 0|--count;

			bound.nthDOM = -1;
			bound.itemRecycler = null;
			//this._removeBoundResponse(bound);
			Polymer.dom(Polymer.dom(bound.element).parentNode).removeChild(bound.element);
			this._supplyBound(bound);

			binds[count] = null;

			return bound;
		},

		_addBoundResponse: function (bound) {
			var nthBind = bound.nthBind;
			var responder = bound.responder;
			this.addResizeListener(responder, bound.element);
			return responder;
		},

		_getBoundResponse: function (bound) {
			return bound.responder;
		},

		_removeBoundResponse: function (bound) {
			var nthBind = bound.nthBind;
			var responder = bound.responder;
			this.removeResizeListener(responder, bound.element);
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
				return recycled && elementHeight(recycled) || null;
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

		getPaneScrollTop: function () {
			return this.$.pane.scrollTop;
		},

		getPaneScrollLeft: function () {
			return this.$.pane.scrollLeft;
		},

		getPaneScrollWidth: function () {
			return this.$.pane.scrollWidth;
		},

		getPaneScrollHeight: function () {
			return this.$.pane.scrollHeight;
		},

	});

})(window.Strand = window.Strand || {});


