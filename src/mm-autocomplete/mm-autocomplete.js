/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var BehaviorUtils = StrandLib.BehaviorUtils;

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
			searchable: {
				type: Boolean,
				value: true
			},
			maxItems: {
				type: Number,
				value: false,
				observer: '_maxItemsChanged'
			},
			value: {
				type: String,
				value: false,
				reflectToAttribute: true
			},
			data: {
				type: Array,
				value: null
			},
			searchData: {
				type: Array,
				value: function() { return []; },
				notify: true
			},
			width: Number,
			layout: String,
			changedFlag: Boolean
		},

		behaviors: [
			StrandTraits.Stylable,
			StrandTraits.KeySelectable,
			StrandTraits.Jqueryable,
			StrandTraits.AutoClosable,
			StrandTraits.PositionableDropdown
		],

		LAYOUT_TYPE: "dropdown",
		SECONDARY_ICON_COLOR: Colors.A2,

		open: function(silent) {
			var inherited = BehaviorUtils.findSuper(StrandTraits.PositionableDropdown, "open");
			// Ensures that we get a value for the offsetHeight of the distributed list items:
			if (this.maxItems) this._setMaxHeight(this.maxItems);

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
			this.changedSelectedFlag = false;
			if (this.data) {
				this.data.forEach(function(item) {
					if (item.selected === true) item.selected = false;
				});
			}
			if(this.state === this.STATE_OPENED) this.close();
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

			if (value === null || value === '') {
				this.reset();
			} else {
				if(!this.changedFlag) {
					this._search(value);
					this.value = value;
				}
				this.changedFlag = false;
			}
		},

		_search: function(value) {
			if(this.data && value) {
				this.searchData = this.data.filter(this._textfilter.bind(this, value));

				// wait a tick to ensure we have searchitems
				this.async(function(){
					if(value && this.searchData.length > 0) { 
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

		_selectItemByValue: function(value) {
			this.async(function() {
				var item = this.items.filter(function(el) {
					return String(el.value) === String(value) || String(el.textContent.trim()) === String(value)
				})[0];
				if(item) this.selectedIndex = this.items.indexOf(item);
			});
		},

		_updateSelectedItem: function(e) {
			var targetIndex = this.searchData.indexOf(this.$.domRepeat.itemForElement(e.target));

			if(targetIndex >= 0) {
				this.selectedIndex = targetIndex;
				this.close();
			}
		},

		get itemHeight() {
	 		return this.domItems.length ? this.domItems[0].offsetHeight : 0;
		},

		get domItems() {
	 		return Polymer.dom(this.$.list).querySelectorAll('mm-list-item');
		},

		_selectedIndexChanged: function(newIndex, oldIndex) {
			// zero is a valid index
			var nullNewIndex = newIndex === false || newIndex === null,
				nullOldIndex = oldIndex === false || oldIndex === null;

			if(!nullNewIndex && newIndex !== oldIndex) {
				var newSelected = this.items[newIndex],
					value = newSelected.value ? newSelected.value : newSelected.name;

				this.changedFlag = true;
				this.value = value;
				this.$.target.value = newSelected.name;
				this.set('searchData.' + newIndex + '.selected', true);

				this.fire('selected', {
					item: newSelected,
					index: newIndex,
					value: this.value,
					selected: newSelected.selected
				});

				this.fire('changed', { value: value });
			}

			if(!nullOldIndex && oldIndex !== newIndex) {
				var oldSelected = this.items[oldIndex];
				if (oldSelected) this.set('searchData.' + oldIndex + '.selected', false);
			}
		},

		_highlightedIndexChanged: function(newIndex, oldIndex) {
			var nullNewIndex = newIndex === false || newIndex === null,
				nullOldIndex = oldIndex === false || oldIndex === null;

			if(!nullNewIndex && newIndex !== oldIndex) {
				this.set('searchData.' + newIndex + '.highlighted', true);
			}

			if(!nullOldIndex && oldIndex !== newIndex) {
				this.set('searchData.' + oldIndex + '.highlighted', false);
			}

			this._updateContainerScroll();
		},

		_updateContainerScroll: function() {
			var highlightedItem = this.domItems[this.highlightedIndex];
			if(highlightedItem) {
				var panelRect = this.panel.getBoundingClientRect(),
					focusRect = highlightedItem.getBoundingClientRect();

				if(focusRect.top < panelRect.top) {
					this.$.list.scrollTop -= (panelRect.top - focusRect.top);
				}

				if(focusRect.bottom > panelRect.bottom) {
					this.$.list.scrollTop +=  (focusRect.bottom - panelRect.bottom);
				}
			}
		},

		_maxItemsChanged: function(newVal, oldVal) {
			if(newVal) this._setMaxHeight(newVal);
	 	},

	 	_setMaxHeight: function(maxItems) {
			var actualMax = Math.min(this.domItems.length, maxItems);
			this.$.list.style.height = this.itemHeight * actualMax + 'px';
	 	},

		_iconColor: function() {},
	});
})(window.Strand = window.Strand || {});