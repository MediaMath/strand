/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Group = Polymer({
		is: 'mm-group',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Selectable
		],

		properties: {
			fitparent: {
				type: String,
				reflectToAttribute: true,
				observer: '_fitparentChanged'
			},
			group: {
				type: String,
				reflectToAttribute: true,
				observer: '_groupChanged'
			},
			align: {
				type: String,
				reflectToAttribute: true,
				observer: '_alignChanged'
			},
			value: {
				type: String,
				reflectToAttribute: true,
				notify: true,
				observer: '_valueChanged'
			},
			// TODO: multiselectable
			// multi: {
			// 	type: Boolean,
			// 	value: false
			// },
			_filter: {
				type: Boolean,
				value: false
			},
			_filterElementType: {
				type: String,
				value: "*"
			},
			_type: {
				type: String,
				value: false
			},
			_itemsByTagName: {
				type: Object,
				value: null
			}
		},

		HALIGN: "horizontal",
		VALIGN: "vertical",
		HALIGN_LEFT: "hgroup-left",
		HALIGN_CENTER: "hgroup-center",
		HALIGN_RIGHT: "hgroup-right",
		VALIGN_TOP: "vgroup-top",
		VALIGN_CENTER: "vgroup-center",
		VALIGN_BOTTOM: "vgroup-bottom",

		listeners: {
			'tap': '_updateSelectedItem',
			'selected': '_radioSelected'
		},

		ready: function() {
			this._type = this._getType();
		},

		attached: function() {
			if(this._type === 'mm-radio') {
				this._radioSelected(); // Check for pre-selected values
			}

			// if no group ID is specified, generate a UID
			if(!this.group){
				this.group = this._createId();
			}

			if (!this.align) {
				this.align = this.HALIGN;
			}
		},

		_getType: function() {
			var type = "";

			// items query handled by StrandTraits.Selectable
			this._itemsByTagName = this.items.reduce(this._countTags.bind(this), {});

			// infer that only one unique key means only one tag type
			var numKeys = Object.keys(this._itemsByTagName).length;

			if (numKeys === 1) {
				type = Object.keys(this._itemsByTagName)[0];
			} else {
				type = "mixed-type";
			}

			return type;
		},

		_countTags: function(map, item) {
			var key = item.tagName.toLowerCase();
			map[key] = (map[key] || 0);
			map[key]++;
			return map;
		},

		_updateSelectedItem: function(e) {
			if(this._type === 'mm-button') {
				var target = Polymer.dom(e).localTarget,
					targetIndex = this.items.indexOf(target);
				// console.log("_updateSelectedItem: ", e, target);
				if(targetIndex >= 0) {
					this.selectedIndex = targetIndex;
				}
				// ***********************
				// TODO: Multi-Select?
				// ***********************
			}
		},

		_selectedIndexChanged: function(newIndex, oldIndex) {
			if(typeof newIndex === 'number') {
				var newSelected = this.items[newIndex],
					oldSelected = this.items[oldIndex],
					value = newSelected.value ? newSelected.value : newSelected.textContent.trim();

				if(this.value !== value) this.value = value;
				newSelected.toggleAttribute("selected");

				this.fire('selected', {
					item: newSelected,
					index: newIndex,
					value: this.value,
					selected: true
				});
			}
			if(typeof oldIndex === 'number') {
				this.items[oldIndex].toggleAttribute("selected");
			}
		},

		_fitparentChanged: function(newVal, oldVal) {
			this.items.forEach(this._setItemFit, this);
		},

		_setItemFit: function(item) {
			item.setAttribute("fitparent", this.fitparent);
		},

		_alignChanged: function(newVal, oldVal){
			this.items.forEach(this._setItemAlign.bind(this));
		},

		_setItemAlign: function(item, index) {
			var alignFirst	= (this.align !== this.HALIGN) ? this.VALIGN_TOP : this.HALIGN_LEFT,
				alignCenter = (this.align !== this.HALIGN) ? this.VALIGN_CENTER : this.HALIGN_CENTER,
				alignLast	= (this.align !== this.HALIGN) ? this.VALIGN_BOTTOM : this.HALIGN_RIGHT;

			// set layout on all items
			if (index === 0) {
				item.setAttribute("layout", alignFirst);
			} else if (index === this.items.length-1) {
				item.setAttribute("layout", alignLast);
			} else {
				item.setAttribute("layout", alignCenter);
			}
		},

		_groupChanged: function(newVal, oldVal) {
			this.items.forEach(this._setItemGroup.bind(this));
		},

		_setItemGroup: function(item) {
			item.setAttribute("group", this.group);
		},

		_radioSelected: function(e) {
			if(this._type === 'mm-radio') {
				var checked = this.items.filter(function(item) {
					return item.hasAttribute("checked");
				})[0];

				if (checked) {
					this.value = checked.getAttribute("value") || checked.textContent.trim();
				}
			}
		},

		_selectRadioByValue: function(value) {
			this.items.forEach(function(item) {
				var itemValue = item.getAttribute('value') || item.textContent.trim();
				if (itemValue === value && !item.checked) {
					item.checked = true;
				}
			});
		},

		_valueChanged: function(newVal, oldVal) {
			this.async(function() {
				if (this._type === 'mm-radio') {
					this._selectRadioByValue(newVal);
				}
			});
			this.fire("changed", { value: newVal });
		},

		_createId: function() {
			var timestamp = new Date().valueOf(),
				rndNum	= Math.floor((Math.random()*99)+1),
				groupId = 'g' + rndNum + '_' + timestamp;
			return groupId;
		}

	});

})(window.Strand = window.Strand || {});
