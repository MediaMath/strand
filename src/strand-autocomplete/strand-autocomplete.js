/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var BehaviorUtils = StrandLib.BehaviorUtils;

	scope.AutoComplete = Polymer({
		is: 'strand-autocomplete',

		properties: {
			_panel: {
				type: Object,
				value: function() { return this.$.panel; }
			},
			_target: {
				type: Object,
				value: function() { return this.$.target; }
			},
			_stackTarget: {
				type: Object,
				value: function() { return this.$.panel; }
			},
			search: {
				type: Boolean,
				value: true,
			},
			clear: {
				type: Boolean,
				value: true,
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
				reflectToAttribute: true,
				notify: true,
				observer: "_valueChanged"
			},
			_name: {
				type: String,
				observer: "_nameChanged"
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
			StrandTraits.Resolvable,
			StrandTraits.Stylable,
			StrandTraits.KeySelectable,
			StrandTraits.Stackable,
			StrandTraits.Jqueryable,
			StrandTraits.PositionableDropdown,
			StrandTraits.Refable
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
			this.$.target.clearInput();
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

		_valueChanged: function(newVal, oldVal) {
			if(!this._selectedIndexChangedFlag) {
				this._name = newVal;
			}
		},

		_nameChanged: function(newVal, oldVal) {
			if (newVal === null || newVal === '') {
				this.reset();
			} else {
				if(!this._selectedIndexChangedFlag) {
					this._search(newVal);
				}
				this._selectedIndexChangedFlag = false;
			}
		},

		_search: function(value) {
			if(this.data && value) {
				this._searchData = this.data.filter(this._textfilter.bind(this, value));

				// wait a tick to ensure we have searchitems
				this.async(function(){
					this._maxIndex = this._searchData.length-1;
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
			if(targetIndex >= 0) this.selectedIndex = targetIndex;
		},

		get itemHeight() {
	 		return this.domItems.length ? this.domItems[0].offsetHeight : 0;
		},

		get domItems() {
	 		return Polymer.dom(this.$.list).querySelectorAll('strand-list-item');
		},

		_selectedIndexChanged: function(newIndex, oldIndex) {
			if(typeof newIndex === 'number') {
				var newSearchDataObj = this._searchData[newIndex],
					newDataIndex = this.data.indexOf(newSearchDataObj),
					newSelected = this.data[newDataIndex],
					value = newSelected.value ? newSelected.value : newSelected.name,
					name = newSelected.name;

				this._selectedIndexChangedFlag = true;
				this.value = value;
				this._name = (value === name) ? value : name;

				this.fire('selected', {
					item: newSelected,
					index: newDataIndex,
					value: value,
					name: name,
					selected: true
				});

				this.fire('changed', { value: value });
				
				this.selectedIndex = null;
			}

			if (this.state === this.STATE_OPENED) this.close();
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
				var panelRect = this.$.list.getBoundingClientRect(),
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
