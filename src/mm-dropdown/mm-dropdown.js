/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var Rectangle = StrandLib.Rectangle,
		Measure = StrandLib.Measure;

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
			data: {
				type: Array,
				value: null,
				observer: '_dataChanged'
			},
			value: {
				type: String,
				value: false,
				reflectToAttribute: true,
				observer: '_valueChanged'
			},
			layout: String
		},

		behaviors: [
			StrandTraits.Stylable,
			StrandTraits.KeySelectable,
			StrandTraits.Jqueryable,
			StrandTraits.AutoClosable,
			StrandTraits.AutoTogglable,
			StrandTraits.PositionableDropdown,
			StrandTraits.NonScrollable
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
			// Ensures that we get a value for the offsetHeight of the distributed list items:
			// See Selectable behavior
			if (this.maxItems) this._setMaxHeight(this.maxItems);

			if (!this._widthLocked) {	
				this.$.target.style.maxWidth = !this.fitparent ? this.buttonWidth + "px" : "";
				this._widthLocked = true;
			}

			this.focus();
			this.disableScroll();
			this._origRect = this._origRect || Rectangle.fromElement(this.panel);

			StrandTraits.Closable.open.apply(this, [silent]);
		},

		close: function(silent) {
			this.enableScroll();
			StrandTraits.Closable.close.apply(this, [silent]);
		},

		reset: function() {
			this.selectedIndex = null;
		},

		_selectItemByValue: function(value) {
			this.async(function() {
				var item = this.items.filter(function(el) {
					return String(el.value) === String(value) || String(el.innerText) === String(value)
				})[0];
				if(item) this.selectedIndex = this.items.indexOf(item);
			});
		},

		_updateSelectedItem: function(e) {
			var target = Polymer.dom(e).path[0];
			var targetIndex = this.items.indexOf(target);
			if(targetIndex >= 0) {
				this.selectedIndex = targetIndex;
				this.close();
			}
		},

		// Data handling
		_dataChanged: function(newData, oldData) {
			if (newData && this.value) this._selectItemByValue(this.value);
		},

		get itemHeight() {
	 		return this.items.length ? this.items[0].offsetHeight : 0;
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

		// general
		_valueChanged: function(newVal, oldVal) {
			if (newVal) {
				this._selectItemByValue(newVal);
			}
		},

		_selectedIndexChanged: function(newIndex, oldIndex) {
			if(typeof newIndex === 'number') {
				var newSelected = this.items[newIndex];
				var oldSelected = this.items[oldIndex];

				if(this.value !== newSelected.value) this.value = newSelected.value;
				newSelected.selected = true;

				this.fire('selected', {
					item: newSelected,
					index: newIndex,
					value: newSelected.value,
					selected: newSelected.selected
				});

				this.fire('changed', { value: newSelected.value });
			}
			if(typeof oldIndex === 'number') {
				this.items[oldIndex].selected = false;
			}
		},

		_updateLabelText: function(selectedIndex, placeholder) {
			var selectedItem = this.items[selectedIndex];
			return selectedItem ? selectedItem.label || selectedItem.textContent.trim() : placeholder;
		},

		_updateTitle: function(selectedIndex) {
			var selectedItem = this.items[selectedIndex],
				title = "";
			if (selectedItem) {
				var availableArea = (this.buttonWidth + this.borderWidth) - this.paddingWidth,
					textBounds = Measure.getTextBounds(this.$.label);

				if(textBounds.width >= availableArea) {
					title = selectedItem.label || selectedItem.textContent.trim();
				}
			} 
			return title;
		},

		_hideInsertionPoints: function(data) {
			if(data && data.length > 0) {
				return true;
			} else {
				return false;
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
		},
	});

})(window.Strand = window.Strand || {});