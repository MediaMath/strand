/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var Rectangle = StrandLib.Rectangle;

	scope.AutoComplete = Polymer({
		is: 'mm-autocomplete',

		properties: {
			panel: {
				type: Object,
				value: function() { return this.$.panel; }
			},
			target: {
				type: Object,
				value: function() { return this.$.target; }
			},
			search: {
				type: String,
				value: "true",
			},
			clear: {
				type: String,
				value: "true",
			},
			overflow: {
				type: String,
				value: "hidden"
			},
			type: {
				type: String,
				value: "secondary"
			},
			direction: {
				type: String,
				value: "s",
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
				value: false,
				reflectToAttribute: true
			},
			iconColor: {
				type: String,
				computed: "_iconColor(type)"
			},
			placeholder: {
				type: String,
				value: "Search",
			},
			value: {
				type: String,
				value: null,
				reflectToAttribute: true,
				observer: "_valueChanged"
			},
			data: {
				type: Array,
				value: null
			},
			searchItems: {
				type: Array,
				value: function() { return []; },
				notify: true
			},
			width: Number,
			layout: String,
			selectedFlag: Boolean
		},

		behaviors: [
			StrandTraits.KeySelectable,
			StrandTraits.Jqueryable,
			StrandTraits.AutoClosable,
			StrandTraits.Stylable,
			StrandTraits.PositionableDropdown,
			StrandTraits.NonScrollable
		],

		LAYOUT_TYPE: "dropdown",
		SECONDARY_ICON_COLOR: Colors.A2,

		open: function(silent) {
			// Ensures that we get a value for the offsetHeight of the distributed list items:
			// See Selectable behavior
			if (this.maxItems) this._setMaxHeight(this.maxItems);

			this.focus();
			this.disableScroll();
			this._origRect = this._origRect || Rectangle.fromElement(this.panel);
			this.state = this.STATE_OPENED;
	 		!silent && this.fire("open");
		},

		close: function(silent) {
			this.state = this.STATE_CLOSED;
			this.enableScroll();
	 		!silent && this.fire("close");
		},

		_updateInputDirection: function(state,direction) {
			if(state === "opened") {
				return (direction === "n") ? "top" : "bottom";
			} else {
				return "";
			}
		},

		_changeHandler: function(e) {
			var value = e.detail.value;
			if (value) {
				if(!this.selectedFlag) this._search(value);
				this.selectedFlag = false;
			} else {
				this.reset();
			}
		},

		_search: function(value) {
			if(this.data && value) {
				this.searchItems = this.data.filter(this._textfilter.bind(this, value));

				// wait a tick to ensure we have searchitems
				this.async(function(){
					if(value && this.searchItems.length > 0) { 
						this.open();
					} else {
						this.close();
					}
				});
			}
		},

		_textfilter: function(value, item) {
			var val = value.toLowerCase().replace(/\s+/g, '');
				it = item.name.toLowerCase().replace(/\s+/g, '');
 
			return val !== "" && (it.indexOf(val) > -1);
		},

		_updateSelectedItem: function(e) {
			var target = Polymer.dom(e).path[0],
				targetIndex = this.items.indexOf(target);

			if(targetIndex >= 0) {
				this.selectedIndex = targetIndex;
				this.close();
			}
		},

		_selectedIndexChanged: function(newIndex, oldIndex) {
			if(typeof newIndex === 'number') {
				var newSelected = this.items[newIndex],
					oldSelected = this.items[oldIndex];

				if(this.value !== newSelected.value) {
					this.selectedFlag = true;
					newSelected.selected = true;
					this.value = newSelected.value;
					this.$.target.value = newSelected.innerText;
				}

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

		_valueChanged: function(newVal, oldVal) {
			if (newVal) {
				this._selectItemByValue(newVal);
			}
		},

		_selectItemByValue: function(value) {
			this.async(function() {
				var item = this.items.filter(function(el) {
					return String(el.value) === String(value) || String(el.innerText) === String(value)
				})[0];
				if(item) this.selectedIndex = this.items.indexOf(item);
			});
		},

		reset: function() {
			this.value = null;
			this.selectedIndex = null;
			highlightedIndex = null;
			this.selectedFlag = false;
			this.close();
		},

		get itemHeight() {
	 		return this.items.length ? this.items[0].offsetHeight : 0;
		},

		_iconColor: function() {},
	});
})(window.Strand = window.Strand || {});