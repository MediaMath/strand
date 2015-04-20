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

(function() {
	// determine proper transform:
	if (document.documentElement.style.transform !== undefined) {
		function _setTransform(element, string) {
			element.style.transform = string;
		}
	} else {
		function _setTransform(element, string) {
			element.style.webkitTransform = string;
		}
	}

	Polymer('mm-item-recycler', {
		ver:"<<version>>",

		publish: {
			data: null,
			scope: null,
			index: 0,
			itemTemplate: null,
			itemHeight: 0,
			itemsPerPanel: 5,
			viewportWidth: 0,
			disabled: false
		},

		_scrollTop: 0,
		extraItems: 5,

		observe: {
			'data': 'initialize'
		},

		attached: function() {
			window.onresize = this.resizeViewport.bind(this);
		},

		detached: function() {
			window.onresize = null;
		},

		resizeViewport: function() {
			var viewportHeight = this.offsetHeight,
				ipp = 0|this.itemsPerPanel || 1,
				physicalCount = this.recalculateCounts(viewportHeight, ipp),
				amount = 0,
				tail = this._physicalTail,
				head = tail,
				meta = null,
				virtualDataIndex = 0,
				panelCount = 0,
				panelIndex = 0,
				panels = null,
				presentation = this._presentationMeta,
				presentationCount = presentation.length,
				presentationIndex = 0,
				data = null,
				reused = 0,
				unusable = 0,
				restore = new Array();

			this._viewportHeight = viewportHeight - this.$.list.offsetTop;

			for (presentationIndex = 0; presentationIndex < presentationCount; presentationIndex++) {
				restore.push(presentation[presentationIndex].custom);
				presentation[presentationIndex].custom = false;
			}

			this.simulatePanelResizeEvents(null);

			for (presentationIndex = 0; presentationIndex < presentationCount; presentationIndex++) {
				if (!presentation[presentationIndex].custom) {
					presentation[presentationIndex].custom = restore[presentationIndex];
				}
			}

			if (this._physicalCount < physicalCount) {
				virtualDataIndex = (tail._virtualPanelIndex + 1) * ipp;
				amount = physicalCount - this._physicalCount;
				this._physicalCount = physicalCount;

				this.expandData(amount, virtualDataIndex);

				panelCount = amount / ipp;

				if (panelCount) {
					data = this._physicalData.slice(-amount);
					panels = new Array(panelCount);
					panelIndex = tail._virtualPanelIndex + 1;
					presentation = this._presentationMeta.slice(panelIndex, panelIndex + panelCount);
					reused = presentation.length;

					meta = this._lazyMetadata(tail._virtualPanelIndex, tail._physicalPanelIndex);

					this.expandItemsBefore(
						tail.panel.nextElementSibling,
						panels,
						presentation,
						data,
						ipp,
						meta.position + meta.height,
						this.data.length - (panelIndex * ipp));

					for (panelIndex = 0; panelIndex < panelCount; panelIndex++) {
						panels[panelIndex]._physicalPanelIndex += this._physicalPanels.length;
						panels[panelIndex]._virtualPanelIndex += tail._virtualPanelIndex + 1;
						if (panels[panelIndex]._virtualPanelIndex * ipp >= this.data.length) {
							unusable++;
						}
					}

					this._physicalTail = panels[panels.length -1];
					head = panels[0];

					tail.next = head;
					head.prev = tail;

					tail = this._physicalTail;
					head = this._physicalHead;

					while (unusable-- > 0) {
						if (head._virtualPanelIndex < 1) {
							break;
						}

						presentation.pop();

						tail._virtualPanelIndex = head._virtualPanelIndex - 1;
						head.prev = tail;
						tail.next = head;
						head = tail;
						tail = head.prev;
						head.prev = null;
						tail.next = null;
					}

					this._physicalTail = tail;
					this._physicalHead = head;

					this._physicalPanels.push.apply(this._physicalPanels, panels);
					this._presentationMeta.push.apply(this._presentationMeta, presentation.slice(reused));

				}

				this.refresh(true, 0);
			}
		},

		initialize: function() {
			if (!this.data) {
				return;
			}

			if(this.dataLength == this.data.length) {
				this.refresh(true, 0);
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

			this.dataLength = this.data.length;
		},

		initializeTemplateBind: function() {
			if(typeof this.itemTemplate === "string") {
				this.itemTemplate = this.querySelector("#" + this.itemTemplate);
			}
			
			if(!this.itemTemplate) {
				throw new Error("mm-item-recycler: Item template does not exist!");
				return;
			}
			
			//Add polymer bindings if not present
			if(!this.itemTemplate.bindingDelegate) {
				this.itemTemplate.bindingDelegate = new PolymerExpressions;
			}
		},

		getItemHeight: function(callback) {
			var template = this.itemTemplate,
				container = template.parentNode,
				frag = template.createInstance({ model: this.data[0], scope: this.scope }),
				elem = frag.firstElementChild;

			this.onMutation(container, function() {
				var ipp = 0|this.itemsPerPanel || 1;
				this.itemHeight = elem.offsetHeight;
				this.defaultPanelHeight = this.itemHeight * ipp;
				container.removeChild(elem);
				callback();
			});

			container.appendChild(frag);
		},

		initializeRecycler: function() {
			this.initializeViewport();
			this.initalizeData();
			this.initializeItems();
		},

		initializeViewport: function() {
			var listHeight = this.itemHeight * this.data.length,
				viewportHeight = this.offsetHeight,
				ipp = 0|this.itemsPerPanel || 1;

			this._listHeight = listHeight;
			this.$.list.style.height = (0|this._listHeight) + "px";

			this._physicalCount = this.recalculateCounts(viewportHeight, ipp);
			this._physicalHeight = this.itemHeight * this._physicalCount;

			//Initialize scrollTop to supplied index
			this.scrollToIndex(this.index);

			this._inferDefaultHeight = false;

			this._viewportHeight = viewportHeight - this.$.list.offsetTop;
		},

		recalculateCounts: function (viewportHeight, itemsPerPanel) {
			var physicalCount = 0;

			this._visibleCount = Math.ceil(viewportHeight / this.itemHeight);
			physicalCount = this.disabled ? this.data.length : Math.min(this._visibleCount + this.extraItems, this.data.length);
			// constrain _physicalCount to a multiple of itemsPerPanel
			physicalCount = itemsPerPanel * (1 + (0|((physicalCount + itemsPerPanel - 1) / itemsPerPanel)));

			return physicalCount;
		},

		viewportWidthChanged: function() {
			this.$.list.style.width = this.viewportWidth + "px";
		},

		initalizeData: function() {
			var limit = this.data.length;
			this._physicalData = new Array(this._physicalCount);

			for (var i = 0; i < this._physicalCount; ++i) {
				this._physicalData[i] = {
					model: i < limit ? this.data[i] : null,
					scope: this.scope
				};

				this.updateItem(i, i);
			}
		},

		expandData: function (amount, virtualDataIndex) {
			var dataCount = this._physicalData.length,
				physicalDataIndex = 0;

			while (amount-- > 0) {
				physicalDataIndex = -1 + this._physicalData.push({
					model: (virtualDataIndex < dataCount ? this.data[virtualDataIndex] : null),
					scope: this.scope
				});

				this.updateItem(virtualDataIndex, physicalDataIndex);

				virtualDataIndex++;
			}
		},

		initializePhysical: function (observerFactory, target, panels, presentation, data, template, itemsPerPanel) {

			var itemList = document.createDocumentFragment(),
				panelCount = panels.length,
				panelIndex = 0,
				itemIndex = 0,
				dataCount = data.length,
				physicalDataIndex = 0,
				bound = null,
				panelItems = null,
				panelFragment = null,
				itemFragment = null,
				item = null,
				physical = null;

			for (panelIndex = 0; panelIndex < panelCount; ++panelIndex) {
				panelItems = new Array(itemsPerPanel);
				panelFragment = document.createElement("DIV");
				panelFragment.className += " recycler-panel";

				physical = panels[panelIndex] = {
					panel: panelFragment,
					items: panelItems,
					next: null,
					prev: physical,
					observer: null,
					adjustPositionsAbove: false,
					_virtualPanelIndex: panelIndex,
					_physicalPanelIndex: panelIndex
				};

				if (presentation.length > panelIndex) {
					if (!presentation[panelIndex]) {
						presentation[panelIndex] = new PresentationMetadata()
					}
				} else {
					presentation.push(new PresentationMetadata());
				}

				physical.observer = observerFactory(target, physical, panelFragment);

				if (physical.prev) {
					// back-link the linked list
					physical.prev.next = physical;
				}

				for (itemIndex = 0; itemIndex < itemsPerPanel; ++itemIndex) {
					physicalDataIndex = itemIndex + panelIndex * itemsPerPanel;
					bound = physicalDataIndex < dataCount ? data[physicalDataIndex] : null;
					itemFragment = template.createInstance(bound);
					item = itemFragment.firstElementChild;

					item._transformValue = 0;
					panelItems[itemIndex] = item;
					panelFragment.appendChild(itemFragment);
				}

				itemList.appendChild(panelFragment);
			}

			return itemList;
		},

		initializePanels: function (panels, presentation, itemsPerPanel, offset, presumedItemHeight, totalItems) {

			var panelCount = panels.length,
				panelIndex = 0,
				itemIndex = 0,
				meta = null,
				position = offset,
				physical = null,
				itemCount = 0,
				delta = 0;

			// initialize the panel positions and heights
			for (panelIndex = 0; panelIndex < panelCount; ++panelIndex) {
				physical = panels[panelIndex];
				meta = presentation[physical._virtualPanelIndex];
				meta.position = position;
				if (meta.custom) {
					position += meta.height;
				} else {
					meta.height = physical.panel.offsetHeight;
					position += meta.height;

					if (itemCount + itemsPerPanel < totalItems) {
						delta += meta.height - (presumedItemHeight * itemsPerPanel);
						itemCount += itemsPerPanel;
					} else if (itemCount < totalItems) {
						itemIndex = 0;
						position -= meta.height;
						meta.height = 0;
						for (itemCount; itemCount < totalItems; ++itemCount) {
							meta.height += physical.items[itemIndex++].offsetHeight;
							delta -= presumedItemHeight;
						}
						delta += meta.height;
						position += meta.height;
						meta.custom = true;
					} else {
						position -= meta.height;
						meta.height = 0;
						meta.custom = true;
					}
				}

				for (itemIndex = 0; itemIndex < itemsPerPanel; ++itemIndex) {
					physical.items[itemIndex].addEventListener("item-resized", physical.observer);
				}
			}

			if (delta) {
				this.recalculateListHeight(delta);
			}
		},

		initializeItems: function() {
			var template = this.itemTemplate,
				container = template.parentNode,
				panels = this._physicalPanels,
				count = 0|(panels && panels.length),
				index = 0,
				itemList = null,
				ipp = 0|this.itemsPerPanel || 1,
				panelCount = this._physicalCount / ipp;

			// Remove existing items
			for (index = 0; index < count; ++index) {
				container.removeChild(panels[index].panel);
			}

			this._physicalPanels = new Array(panelCount);
			this._presentationMeta = new Array();

			this.expandItemsBefore(
				template.nextElementSibling,
				this._physicalPanels,
				this._presentationMeta,
				this._physicalData,
				ipp,
				0,
				this.data.length);

			this._physicalHead = this._physicalPanels[0];
			this._physicalTail = this._physicalPanels[panelCount - 1];

			this.refresh(true, 0);
		},

		expandItemsBefore: function (element, panels, presentation, data, itemsPerPanel, offset, totalItems) {
			var template = this.itemTemplate,
				container = template.parentNode,
				itemList = null;

			itemList = this.initializePhysical(
				this.panelHeightObserverFactory,
				this,
				panels,
				presentation,
				data,
				template,
				itemsPerPanel);

			container.insertBefore(itemList, element);

			this.initializePanels(
				panels,
				presentation,
				itemsPerPanel,
				offset,
				this.itemHeight,
				totalItems);
		},

		recalculateListHeight: function (delta) {
			this._listHeight += (0|delta);
			this.$.list.style.height = (0|this._listHeight) + "px";
		},

		simulatePanelResizeEvents: function (simulatedState) {
			var panels = this._physicalPanels,
				count = panels.length,
				index = 0;

			// must not walk head-to-tail here because observer() will cause a this.refresh() and linked-list shift
			for (index = 0; index < count; index++) {
				panels[index].observer.call(null, null, simulatedState);
			}
		},

		determineEffectivePanelTruncation: function (physical, element, data) {
			var truncate = 0,
				ipp = 0|this.itemsPerPanel || 1,
				total = this.data.length,
				overflow = (physical._virtualPanelIndex * ipp) + ipp - total,
				child = element.lastElementChild;

			while ((overflow-- > 0) && child) {
				truncate += child.offsetHeight;
				child = child.previousElementSibling;
			}

			return 0|truncate;
		},

		panelHeightObserverFactory: function (recycler, physical, element) {
			return function fn (ev, simulatedState) {
				var meta = recycler._lazyMetadata(physical._virtualPanelIndex, physical._physicalPanelIndex),
					data = physical,
					state = 0|((ev && ev.detail) || simulatedState),
					panelHeight = element.offsetHeight,
					truncate = recycler.determineEffectivePanelTruncation(physical, element, recycler.data),
					change = (panelHeight - truncate) - meta.height,
					wasCustomMeasuredHeight = meta.custom,
					delta = 0;

				meta.custom = true;
				if (ev) {
					physical.adjustPositionsAbove = false;
					wasCustomMeasuredHeight = false;
				}
				if (change) {

					panelHeight = meta.height + change;

					if (state !== null && // on externally triggered "resize" event only
						recycler._inferDefaultHeight &&
						truncate === 0) { // only a panel with nothing truncated
						change = 0;
						recycler._inferDefaultHeight = false;
						recycler.recalculatePresentationData(panelHeight, state);
						meta.custom = true;
					} else {
						delta = 1;
						meta.height = panelHeight; // alternatively this happens above in recalculatePresentationData()

						if (!wasCustomMeasuredHeight) {
							recycler.recalculateListHeight(0|change);
						}

						if (!wasCustomMeasuredHeight &&
							physical.adjustPositionsAbove) {
							physical.adjustPositionsAbove = false;
							delta = -1;
							recycler.shiftScrollTop(change);
						}

						if (physical.adjustPositionsAbove) {
							physical.adjustPositionsAbove = false;
							delta = -1;
							do {
								meta = recycler._lazyMetadata(data._virtualPanelIndex, data._physicalPanelIndex);
								meta.position -= change;
							} while (data = data.prev);
						} else {
							while (data = data.next) {
								meta = recycler._lazyMetadata(data._virtualPanelIndex, data._physicalPanelIndex);
								meta.position += change;
							}
						}
					}

					recycler.refresh(false, delta);
				}
				return 0|change;
			};
		},

		inferDefaultHeightFromNextResize: function (state, defaultPanelHeight) {
			var panelHeight = 0|defaultPanelHeight;

			if (!panelHeight) {
				this._inferDefaultHeight = true;
				this.async(this.simulatePanelResizeEvents, state);
			} else {
				this._inferDefaultHeight = false;
				this.recalculatePresentationData(panelHeight, null);
			}
		},

		recalculatePresentationData: function (defaultPanelHeight, state) {
			var presentation = this._presentationMeta,
				ipp = 0|this.itemsPerPanel || 1,
				head = this._physicalHead,
				tail = this._physicalTail,
				lower = head._virtualPanelIndex,
				upper = tail._virtualPanelIndex + 1,
				obsolete = this.defaultPanelHeight,
				change = 0,
				total = this.data.length,
				count = 0|((total + ipp - 1) / ipp),
				meta = null,
				overflow = 0,
				truncate = 0,
				panelPosition = 0,
				panelHeight = 0,
				correction = 0,
				result = 0,
				offsetTop = this.$.list.offsetTop,
				offsetHeight = this.offsetHeight,
				scrollTop = this._scrollTop;

			// recalculate off-DOM presentation information above viewport
			change = propagateOffDOMChange(change, presentation, 0, lower, obsolete, defaultPanelHeight);

			result = change;

			// recalculate on-DOM presentation information
			do {
				meta = this._lazyMetadata(head._virtualPanelIndex, head._physicalPanelIndex);
				panelPosition = meta.position;
				meta.position += change;
				panelHeight = meta.height;
				meta.height = defaultPanelHeight;
				meta.custom = false;

				change += defaultPanelHeight - panelHeight;

				if (scrollTop > panelPosition + panelHeight) {
					result = change;
				} else if (scrollTop > panelPosition) {
					correction = (0|((scrollTop - panelPosition) / (panelHeight / ipp))) / ipp;
					result += (defaultPanelHeight - panelHeight) * correction;
				}
			} while (head !== tail && (head = head.next));

			// recalculate offscreen presentation information below viewport
			change = propagateOffDOMChange(change, presentation, upper, count, obsolete, defaultPanelHeight);

			// account for the last panel having "remainder" elements that overflow the virtual data length
			if (overflow = (count * ipp - total)) {
				meta = presentation.length < count ? null : presentation[count - 1];
				if (!meta) {
					truncate = overflow * (defaultPanelHeight - obsolete) / ipp;
				} else {
					truncate = overflow * (defaultPanelHeight) / ipp;
					meta.height -= truncate;
				}
				change -= truncate;
			}

			change && this.recalculateListHeight(change);

			this.defaultPanelHeight = defaultPanelHeight;

			this.shiftScrollTop(result);

			return result;
		},

		shiftScrollTop: function (change) {
			var offsetTop = this.$.list.offsetTop,
				offsetHeight = this.offsetHeight;

			if (this._scrollTop + change > this._listHeight - (offsetHeight - offsetTop)) {
				this.scrollTop = this._scrollTop = this._listHeight - (offsetHeight - offsetTop);
			} else if (this._scrollTop + change < 0) {
				this.scrollTop = this._scrollTop = 0;
			} else {
				this.scrollTop = this._scrollTop = this._scrollTop + change;
			}
		},

		updateItem: function (virtualIndex, physicalIndex) {
			return updateItem(this.data, virtualIndex, this._physicalData, physicalIndex);
		},

		scrollHandler: function(e) {
			var delta = e.target.scrollTop - this._scrollTop;
			this._scrollTop = e.target.scrollTop;

			this.index = Math.floor(this._scrollTop / this.itemHeight);
			if(!this.disabled) {
				this.refresh(false, delta);
			}
		},

		scrollToIndex: function(value) {
			this.scrollTop = this._scrollTop = value * this.itemHeight;
		},

		_lazyMetadata: function (virtualPanelIndex, physicalPanelIndex) {
			return _lazyMetadata(virtualPanelIndex, physicalPanelIndex, this._presentationMeta);
		},

		refresh: function(force, delta) {
			var panels = this._physicalPanels,
				presentation = this._presentationMeta,
				presentationCount = presentation.length,
				viewportHeight = this._viewportHeight,
				padding = 0 + this.extraItems * this.itemHeight,
				head = this._physicalHead,
				tail = this._physicalTail,
				truncate = 0,
				ipp = 0|this.itemsPerPanel || 1,
				total = this.data.length,
				virtualPanelCount = 0|((total + ipp - 1) / ipp),
				misaligned = null;

			if (delta <= 0) {
				// find physical that is "below" viewport
				tail = refreshTail(
					head,
					tail,
					presentation,
					this._scrollTop + viewportHeight + padding,
					this.defaultPanelHeight);
				head = tail.next || head;
			}

			if (delta >= 0) {
				// find physical that is "above" viewport
				head = refreshHead(
					head,
					tail,
					presentation,
					this._scrollTop - padding,
					this.defaultPanelHeight,
					virtualPanelCount - 1);
				tail = head.prev || tail;

				if (presentationCount < virtualPanelCount &&
					presentation.length >= virtualPanelCount) {
					truncate = ((virtualPanelCount * ipp) - total) * this.defaultPanelHeight / ipp;
					this._lazyMetadata(tail._virtualPanelIndex, tail._physicalPanelIndex).height -= truncate;
				}

			}

			head.prev = null;
			tail.next = null;

			this._physicalHead = head;
			this._physicalTail = tail;

			misaligned = refreshPanels(panels, presentation, ipp, this.data, this._physicalData, 0|force);

			if (misaligned) {
				this.async(alignPanelsFactory(misaligned));
			}
		}
	});



	function nonNullReducer (a, b) {
		return a !== null ? a : b;
	}

	function propagateOffDOMChange (offset, presentation, start, end, oldDefault, youngDefault) {

		var change = offset,
			amount = presentation.length,
			index = 0,
			meta = null;

		// start is inclusive, end is exclusive
		for (index = start; index < end; index++) {
			if (index < amount) {
				meta = presentation[index];
				meta.position += change;
				panelHeight = meta.height;
				meta.height = youngDefault;
				meta.custom = false;
			} else {
				panelHeight = oldDefault;
			}

			change += youngDefault - panelHeight;
		}

		return change;
	}

	function PresentationMetadata () {
		this.position = 0;
		this.height = 0;
		this.custom = false;
	}

	function _lazyMetadata (virtualPanelIndex, physicalPanelIndex, presentation) {
		var count = presentation.length;

		if (virtualPanelIndex < count) {
			return presentation[virtualPanelIndex];
		}

		do {
			presentation.push(null);
		} while (virtualPanelIndex > count++); // important post-increment

		return presentation[virtualPanelIndex] = new PresentationMetadata();
	}

	function refreshTail (head, tail, presentation, limit, defaultPanelHeight) {

		var headMeta = _lazyMetadata(head._virtualPanelIndex, head._physicalPanelIndex, presentation),
			tailMeta = headMeta,
			lazyMeta = headMeta;

		do {
			tailMeta = _lazyMetadata(tail._virtualPanelIndex, tail._physicalPanelIndex, presentation);
			if (tailMeta.position < limit ||
				head._virtualPanelIndex < 1) {
				break;
			}

			tail.adjustPositionsAbove = true;
			tail._virtualPanelIndex = head._virtualPanelIndex - 1;
			lazyMeta = _lazyMetadata(tail._virtualPanelIndex, tail._physicalPanelIndex, presentation);
			lazyMeta.height = lazyMeta.height || defaultPanelHeight;
			lazyMeta.position = headMeta.position - lazyMeta.height;
			tail.next = head;
			head.prev = tail;
			head = tail;
			headMeta = lazyMeta;
		} while (tail = tail.prev);

		return tail;
	}

	function refreshHead (head, tail, presentation, limit, defaultPanelHeight, lastVirtualPanelIndex) {

		var tailMeta = _lazyMetadata(tail._virtualPanelIndex, tail._physicalPanelIndex, presentation),
			headMeta = tailMeta,
			lazyMeta = tailMeta;

		do {
			headMeta = _lazyMetadata(head._virtualPanelIndex, head._physicalPanelIndex, presentation);
			if (headMeta.position + headMeta.height > limit ||
				tail._virtualPanelIndex + 1 > lastVirtualPanelIndex) {
				break;
			}

			head.adjustPositionsAbove = false;
			head._virtualPanelIndex = tail._virtualPanelIndex + 1;
			lazyMeta = _lazyMetadata(head._virtualPanelIndex, head._physicalPanelIndex, presentation);
			lazyMeta.height = lazyMeta.height || defaultPanelHeight;
			lazyMeta.position = tailMeta.position + tailMeta.height;
			head.prev = tail;
			tail.next = head;
			tail = head;
			tailMeta = lazyMeta;
		} while (head = head.next);

		return head;
	}

	function refreshPanels (panels, presentation, itemsPerPanel, data, physicalData, force) {

		var dataCount = data.length,
			panelCount = panels.length,
			panelIndex = 0,
			physical = null,
			meta = null,
			position = 0,
			misaligned = null;

		for (panelIndex = 0; panelIndex < panelCount; panelIndex++) {
			physical = panels[panelIndex];
			meta = _lazyMetadata(physical._virtualPanelIndex, physical._physicalPanelIndex, presentation);
			position = meta.position;
			if (force || physical.panel._transformValue !== position) {
				refreshItems(physical, panelIndex, itemsPerPanel, data, physicalData);
				_setTransform(physical.panel, "matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0," + position + ", 0, 1)");
				physical.panel._transformValue = position;
				if (misaligned) {
					misaligned.push(physical);
				} else {
					misaligned = [physical];
				}
			}
		}

		return misaligned;
	}

	function refreshItems (panel, panelIndex, itemsPerPanel, data, physicalData) {
		var dataCount = data.length,
			oldPanelOffset = panel._virtualPanelIndex * itemsPerPanel,
			youngPanelOffset = panelIndex * itemsPerPanel,
			items = panel.items,
			itemIndex = 0,
			virtualDataIndex = 0;

		for (itemIndex = 0; itemIndex < itemsPerPanel; itemIndex++) {
			virtualDataIndex = itemIndex + oldPanelOffset;
			if (virtualDataIndex < dataCount) {
				updateItem(data, virtualDataIndex, physicalData, itemIndex + youngPanelOffset);
			}
		}
	}

	function updateItem (data, virtualIndex, physicalData, physicalIndex) {
		var physicalDatum = physicalData[physicalIndex];

		physicalDatum.model = data.length > virtualIndex ? data[virtualIndex] : null;
	}

	function alignPanelsFactory(panels) {
		return function () {
			panels.forEach(triggerPanelObserver);
		};
	}

	function triggerPanelObserver (panel) {
		panel.observer(null);
	}

})();