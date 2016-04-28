/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var Rectangle = StrandLib.Rectangle,
		Measure = StrandLib.Measure,
		BehaviorUtils = StrandLib.BehaviorUtils;

	scope.Dropdown = Polymer({
		is: 'strand-dropdown',

		properties: {
			_scope: {
				type: Object,
				value: function() { return this; }
			},
			_panel: {
				type: Object,
				value: function() { return this.$.panel; }
			},
			_itemRecycler: {
				type: Object,
				value: function() { return this.$.itemRecycler; }
			},
			_target: {
				type: Object,
				value: function() { return this.$.target; }
			},
			_stackTarget: {
				type: Object,
				value: function() { return this.$.panel; }
			},
			_type: {
				type: String,
				value: 'secondary'
			},
			disabled: {
				type: Boolean,
				value: false,
				reflectToAttribute: true
			},
			error: {
				type: Boolean,
				value: false,
			},
			fitparent: {
				type: Boolean,
				value: false
			},
			placeholder: {
				type: String,
				value: 'Select',
			},
			isLoading:{
				type:Boolean,
				notify: true,
				value: false
			},			
			index: {
				type:Number,
				notify:true,
			},
			size: {
				type: String,
				reflectToAttribute: true
			},
			skinless: {
				type: Boolean,
				reflectToAttribute: true
			},
			layout: { 
				type: String,
				reflectToAttribute: true 
			},
			data: {
				type: Array,
				notify: true,
				observer: '_dataChanged'
			},
			value: {
				type: String,
				reflectToAttribute: true,
				notify: true,
				observer: '_valueChanged'
			},
			maxItems: {
				type: Number,
				observer: '_maxItemsChanged'
			}
		},

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Stylable,
			StrandTraits.KeySelectable,
			StrandTraits.Stackable,
			StrandTraits.Jqueryable,
			StrandTraits.AutoTogglable,
			StrandTraits.PositionableDropdown,
			StrandTraits.Refable
		],

		_widthLocked: false,
		LAYOUT_TYPE: 'dropdown',

		ready: function() {
			if(!this.toggleTrigger) {
				this.toggleTrigger = this.target;
			}

			this.async(function() {
				// set input layout default - is there an input?
				var search = this.querySelector('strand-input');
				if (search) {
					search.layout = this.LAYOUT_TYPE;
				}
			});
		},

		open: function(silent) {
			var inherited = BehaviorUtils.findSuper(StrandTraits.PositionableDropdown, 'open');
			// Ensures that we get a value for the offsetHeight of the distributed list items:
			if (this.maxItems) this._setMaxHeight(this.maxItems);
			if (!this._widthLocked) this._lockWidth();

			this.focus();
			inherited.apply(this, [silent]);
		},

		close: function(silent) {
			var inherited = BehaviorUtils.findSuper(StrandTraits.PositionableDropdown, "close");
			this._highlightedIndex = null;
			inherited.apply(this, [silent]);
		},

		reset: function() {
			this.value = null;
			this.selectedIndex = null;
			this._highlightedIndex = null;
			if(this.state === this.STATE_OPENED) this.close();
		},

		_selectItemByValue: function(value) {
			this.async(function(){
				var item = null;
				var valueStr = value.toString();

				if (!this._widthLocked) this._lockWidth();

				if (this.data) {
					item = this._getDataItemByValue(valueStr);
				} else {
					item = this._getDomByValue(valueStr);
				}
				if (item) this.selectedIndex = this.items.indexOf(item);
			});
		},

		_updateSelectedItem: function(e) {
			var target = Polymer.dom(e).path[0];
			var value = this._getValueFromDom(target).toString();
			var targetIndex = null;

			if (this.data) {
				targetIndex = this._getDataIndexFromDom(value);
			} else {
				targetIndex = this.items.indexOf(target);
			}

			if(targetIndex >= 0) this.selectedIndex = targetIndex;
		},

		// Dom handling
		_getDomByValue: function(value) {
			return this.items.filter(function(node) {
				return node.getAttribute('value') === value || node.textContent.trim() === value;
			})[0];
		},

		_getValueFromDom: function(node) {
			return node.getAttribute('value') || node.textContent.trim();
		},

		_getDataIndexFromDom: function(value) {
			return this.data.indexOf(this._getDataItemByValue(value));
		},

		_getDataItemByValue: function(value) {
			return this.data.filter(function(item) {
				return item.name === value || item.value.toString() === value;
			})[0];
		},

		// Data handling
		_dataChanged: function(newData, oldData) {
			if (newData) {
				if (!this.maxItems) {
					this.maxItems = 10;
				}
				// reset selectedIndex for recycler scenarios
				this.selectedIndex = null;
			} else {
				this.reset();
			}
		},

		// Getters
		get itemHeight() {
			var itemHeight = null;
			var items = this.items;

			if (this.items.length > 0) {
				if (this.data) {
					itemHeight = 0|this._itemRecycler.getHeightAtIndex(0);
				} else {
					itemHeight = this.items[0].offsetHeight;
				}
			}
	 		return itemHeight;
		},

		get buttonWidth() {
			return Rectangle.fromElement(this.$.target).width;
		},

		get paddingWidth() {
			return Measure.getPaddingWidth(this.$.target);
		},

		get borderWidth() {
			return Measure.getBorderWidth(this.$.target);
		},

		// General
		_valueChanged: function(newVal, oldVal) {
			if (newVal) {
				this._selectItemByValue(newVal);
			} else {
				this.reset();
			}
		},

		_selectedIndexChanged: function(newIndex, oldIndex) {
			if (typeof newIndex === 'number') {
				var newSelected = this.items[newIndex];
				var value = newSelected.value ? newSelected.value.toString() : newSelected.textContent.trim();
				var name = newSelected.name ? newSelected.name : newSelected.textContent.trim();

				this.value = value;

				if (this.data) {
					this.set('data.' + newIndex + '.selected', true);
				} else {
					newSelected.selected = true;
				}

				this.fire('selected', {
					item: newSelected,
					index: newIndex,
					value: value,
					name: name,
					selected: newSelected.selected
				});

				this.fire('changed', { value: value });
			}

			if (typeof oldIndex === 'number') {
				var oldSelected = this.items[oldIndex];

				if (this.data) {
					this.set('data.' + oldIndex + '.selected', false);
				} else {
					oldSelected.selected = false;
				}
			}

			if (this.state === this.STATE_OPENED) this.close();
		},

		_highlightedIndexChanged: function(newIndex, oldIndex) {
			var inherited = BehaviorUtils.findSuper(StrandTraits.KeySelectable, '_highlightedIndexChanged');
			if (typeof newIndex === 'number' && newIndex >= 0) {
				if (this.data) {
					this.set('data.' + newIndex + '.highlighted', true);
				} else {
					this.attributeFollows('highlighted', this.items[newIndex], this.items[oldIndex]);
				}
			}
			if (typeof oldIndex === 'number' && oldIndex >=0) {
				this.set('data.' + oldIndex + '.highlighted', false);
			}
			inherited.apply(this, [newIndex, oldIndex]);
		},

		_updateLabelText: function(selectedIndex, placeholder) {
			var label = this.placeholder;

			if (typeof selectedIndex === 'number') {
				var selectedItem = this.items[selectedIndex];

				label = this.data ? selectedItem.name : selectedItem.textContent.trim();
			}
			return label;
		},

		_updateTitle: function(selectedIndex) {
			if (typeof selectedIndex === 'number') {
				var selectedItem = this.items[selectedIndex];
				var title = '';

				if (selectedItem) {
					var availableArea = (this.buttonWidth + this.borderWidth) - this.paddingWidth,
						textBounds = Measure.getTextBounds(this.$.label);

					if(textBounds.width >= availableArea) {
						title = this.data ? selectedItem.name : selectedItem.textContent.trim();
					}
				}
				return title;
			}
		},

		_hideInsertionPoints: function(data) {
			if (data && data.length > 0) {
				return true;
			} else {
				return false;
			}
		},

		_lockWidth: function() {
			if (!this.fitparent && this.buttonWidth > 0 && !this.skinless) {
				this.$.target.style.width = this.buttonWidth + 'px';
			} else {
				return;
			}

			this._widthLocked = true;
		},

		_maxItemsChanged: function(newVal, oldVal) {
			this._setMaxHeight(newVal);
	 	},

	 	_setMaxHeight: function(maxItems) {
			var actualMax = Math.min(this.items.length, maxItems);

			this.$.list.style.height = this.itemHeight * actualMax + 'px';

			if (this.data) {
				this._itemRecycler.style.height = this.itemHeight * actualMax + 'px';
				this.$.list.style.overflowY = "hidden";
			}
	 	},

		_updateButtonClass: function(direction, fitparent, error, state, type) {
			var o = {};
			o.button = true;
			o.fit = fitparent;
			o.invalid = error;
			o[type] = true;
			o[state] = true;
			o.top = (direction === 'n');
			o.bottom = (direction === 's');
			return this.classBlock(o);
		},

		requestInitialization: function () {
			return this.$.itemRecycler.initialize();
		},
	});

})(window.Strand = window.Strand || {});
