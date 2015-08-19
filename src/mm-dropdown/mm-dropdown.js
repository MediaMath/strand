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
		is: 'mm-dropdown',

		properties: {
			scope: {
				type: Object,
				value: function() { return this; }
			},
			panel: {
				type: Object,
				value: function() { return this.$.panel; }
			},
			itemRecycler: {
				type: Object,
				value: function() { return this.$.itemRecycler; }
			},
			target: {
				type: Object,
				value: function() { return this.$.target; }
			},
			overflow: {
				type: String,
				value: 'hidden'
			},
			type: {
				type: String,
				value: 'secondary'
			},
			disabled: {
				type: Boolean,
				value: false,
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
			maxItems: {
				type: Number,
				value: false,
				observer: '_maxItemsChanged'
			},
			value: {
				type: String,
				value: false,
				reflectToAttribute: true,
				observer: '_valueChanged'
			},
			data: {
				type: Array,
				value: null,
				notify: true,
				observer: '_dataChanged'
			},
			layout: String,
			_selectedFlag: Boolean
		},

		behaviors: [
			StrandTraits.Stylable,
			StrandTraits.KeySelectable,
			StrandTraits.Jqueryable,
			StrandTraits.AutoClosable,
			StrandTraits.AutoTogglable,
			StrandTraits.PositionableDropdown
		],

		_widthLocked: false,
		LAYOUT_TYPE: 'dropdown',
		SECONDARY_ICON_COLOR: Colors.A2,

		ready: function() {
			if(!this.toggleTrigger) {
				this.toggleTrigger = this.target;
			}

			this.async(function() {
				// set input layout default - is there an input?
				var search = this.querySelector('mm-input');
				if (search) {
					search.layout = this.LAYOUT_TYPE;
				}
			});
		},

		open: function(silent) {
			var inherited = BehaviorUtils.findSuper(StrandTraits.PositionableDropdown, 'open');
			// Ensures that we get a value for the offsetHeight of the distributed list items:
			// See Selectable behavior
			if (this.maxItems) this._setMaxHeight(this.maxItems);

			if (!this._widthLocked) this._lockWidth();

			this.focus();
			inherited.apply(this, [silent]);
		},

		close: function(silent) {
			var inherited = BehaviorUtils.findSuper(StrandTraits.PositionableDropdown, "close");
			inherited.apply(this, [silent]);
		},

		reset: function() {
			this.value = null;
			this.selectedIndex = null;
			highlightedIndex = null;
			if(this.state === this.STATE_OPENED) this.close();
		},


		_selectItemByValue: function(value) {
			var item = null;

			value = value.toString();

			if (!this._widthLocked) this._lockWidth();

			if (this.data) {
				item = this._getDataItemByValue(value);
			} else {

				item = this._getDomByValue(value);
			}
			if (item) this.selectedIndex = this.items.indexOf(item);
		},

		_updateSelectedItem: function(e) {
			var target = Polymer.dom(e).path[0],
				value = this._getValueFromDom(target),
				targetIndex = null;

			if (this.data) {
				targetIndex = this._getDataIndexFromDom(value);
			} else {
				targetIndex = this.items.indexOf(target);
			}

			if(targetIndex >= 0) {
				this.selectedIndex = targetIndex;
				this.close();
			}
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

		// Data handling
		_dataChanged: function(newData, oldData) {
			if(newData) this._setMaxHeight(this.maxItems); 
			if (newData && this.value) this._selectItemByValue(this.value);
		},

		_getDataItemByValue: function(value) {
			return this.data.filter(function(item) {
				return item.name === value || item.value === value;
			})[0];
		},

		// Getters
		get itemHeight() {
			var itemHeight = null,
				items = this.items;

			if (this.items.length > 0) {
				if (this.data) {
					itemHeight = Polymer.dom(this.$.itemRecycler.$.pane).querySelector('mm-list-item').offsetHeight;
				} else {
					itemHeight = this.items[0].offsetHeight;
				}
			}

	 		return itemHeight;
		},

		get buttonWidth() {
			return Math.ceil(Rectangle.fromElement(this.$.target).width);
		},

		get paddingWidth() {
			return Measure.getPaddingWidth(this.$.target);
		},

		get borderWidth() {
			return Measure.getBorderWidth(this.$.target);
		},

		// General
		_valueChanged: function(newVal, oldVal) {
			if (newVal && !this._selectedFlag) {
				this._selectItemByValue(newVal);
			}
			this._selectedFlag = false;
		},

		_selectedIndexChanged: function(newIndex, oldIndex) {
			if (typeof newIndex === 'number' && newIndex !== oldIndex) {
				var newSelected = this.items[newIndex],
					oldSelected = this.items[oldIndex],
					value = newSelected.value ? newSelected.value : newSelected.textContent.trim();

				if (this.data) { 
					// ***********************
					// TODO: It doesn't ACTUALLY reflect to the dom...
					// ***********************
					this.set('data.' + newIndex + '.selected', true);
				} else {
					newSelected.selected = true;
				}
				
				this._selectedFlag = true;
				this.value = value;

				this.fire('selected', {
					item: newSelected,
					index: newIndex,
					value: this.value,
					selected: newSelected.selected
				});

				this.fire('changed', { value: value });
			}

			if (typeof oldIndex === 'number' && newIndex !== oldIndex) {
				this.items[oldIndex].selected = false;
			}
		},

		_highlightedIndexChanged: function(newIndex, oldIndex) {
			if (typeof newIndex === 'number' && newIndex >= 0) {
				if (this.data) {
					// ***********************
					// TODO: It doesn't ACTUALLY reflect to the dom...
					// ***********************
					this.set('data.' + newIndex + '.highlighted', true);
				} else {
					this.classFollows('highlighted', this.items[newIndex], this.items[oldIndex]);
				}
			}
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
				var selectedItem = this.items[selectedIndex],
					title = '';

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
			if(data && data.length > 0) {
				return true;
			} else {
				return false;
			}
		},

		_lockWidth: function() {
			this.$.target.style.width = !this.fitparent ? this.buttonWidth + 'px' : '';
			this._widthLocked = true;
		},

		_maxItemsChanged: function(newVal, oldVal) {
			if(newVal) this._setMaxHeight(newVal);
	 	},

	 	_setMaxHeight: function(maxItems) {
			actualMax = Math.min(this.items.length, maxItems);
			
			this.$.list.style.height = this.itemHeight * actualMax + 'px';
			
			if (this.data) {
				this.$.itemRecycler.style.height = this.itemHeight * actualMax + 'px';
				this.$.list.style.overflowY = "hidden";
			}
	 	},

		_updateButtonClass: function(direction, fitparent, error, state, type) {
			var o = {};
			o['button'] = true;
			o['fit'] = fitparent;
			o['invalid'] = error;
			o[type] = true;
			o[state] = true;
			o['top'] = (direction === 'n');
			o['bottom'] = (direction === 's');
			return this.classBlock(o);
		}
	});

})(window.Strand = window.Strand || {});
