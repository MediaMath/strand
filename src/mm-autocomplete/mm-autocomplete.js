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
			_panel: {
				type: Object,
				value: function() { return this.$.panel; }
			},
			_target: {
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
			placeholder: {
				type: String,
				value: "Search",
			},
			maxItems: {
				type: Number,
				value: false,
				observer: '_maxItemsChanged'
			},
			value: {
				type: String,
				reflectToAttribute: true
			},
			width: Number,
			_searchable: {
				type: Boolean,
				value: true
			},
			data: {
				type: Array,
				value: null
			},
			_searchData: {
				type: Array,
				value: function() { return []; },
				notify: true
			}
		},

		behaviors: [
			StrandTraits.Stylable,
			StrandTraits.KeySelectable,
			StrandTraits.Jqueryable,
			StrandTraits.AutoClosable,
			StrandTraits.PositionableDropdown
		],

		_selectedIndexChangedFlag: false,

		open: function(silent) {
			var inherited = BehaviorUtils.findSuper(StrandTraits.PositionableDropdown, "open");
			// Ensures that we get a value for the offsetHeight of the distributed list items:
			if (this.maxItems) this._setMaxHeight(this.maxItems);

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
			this._selectedIndexChangedFlag = false;
			if(this.data) {
				this.data.forEach(function(item) {
					if (item.highlighted) item.highlighted = null;
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
				if(!this._selectedIndexChangedFlag) {
					this._search(value);
					this.value = value;
				}
				this._selectedIndexChangedFlag = false;
			}
		},

		_search: function(value) {
			if(this.data && value) {
				this._searchData = this.data.filter(this._textfilter.bind(this, value));

				// wait a tick to ensure we have searchitems
				this.async(function(){
					if(value && this._searchData.length > 0) { 
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
			var targetIndex = this._searchData.indexOf(this.$.domRepeat.itemForElement(e.target));

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
			if(typeof newIndex === 'number') {
				var newSearchDataObj = this._searchData[newIndex],
					newDataIndex = this.data.indexOf(newSearchDataObj),
					newSelected = this.data[newDataIndex],
					value = newSelected.value ? newSelected.value : newSelected.name;

				this._selectedIndexChangedFlag = true;
				this.value = value;
				this.$.target.value = newSelected.name;

				this.fire('selected', {
					item: newSelected,
					index: newIndex,
					value: this.value,
					selected: true
				});

				this.fire('changed', { value: value });
			}
		},

		_highlightedIndexChanged: function(newIndex, oldIndex) {
			if(typeof newIndex === 'number') {
				this.set('_searchData.' + newIndex + '.highlighted', true);
			}
			if(typeof oldIndex === 'number') {
				this.set('_searchData.' + oldIndex + '.highlighted', false);
			}
			this._updateContainerScroll();
		},

		_updateContainerScroll: function() {
			var highlightedItem = this.domItems[this._highlightedIndex];
			if(highlightedItem) {
				var panelRect = this._panel.getBoundingClientRect(),
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
	 	}

	});
})(window.Strand = window.Strand || {});