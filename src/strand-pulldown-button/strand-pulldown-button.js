/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var BehaviorUtils = StrandLib.BehaviorUtils;

	scope.PulldownButton = Polymer({
		is: 'strand-pulldown-button',

		properties: {
			_scope: {
				type: Object,
				value: function() { return this; }
			},
			_panel: {
				type: Object,
				value: function() { return this.$.panel; }
			},
			_target: {
				type: Object,
				value: function() { return this.$.target; }
			},
			type: {
				type: String,
				value: "primary"
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
			overflowWidth: {
				type: Number,
				value: null
			},
			layout: { 
				type: String,
				reflectToAttribute: true 
			}
		},

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Stylable,
			StrandTraits.KeySelectable,
			StrandTraits.AutoTogglable,
			StrandTraits.PositionableDropdown,
			StrandTraits.Refable
		],

		ready: function() {
			if(!this.toggleTrigger) {
				this.toggleTrigger = this._target;
			}
		},

		open: function(silent) {
			var inherited = BehaviorUtils.findSuper(StrandTraits.PositionableDropdown, "open");
			this.focus();
			inherited.apply(this, [silent]);
		},

		close: function(silent) {
			var inherited = BehaviorUtils.findSuper(StrandTraits.PositionableDropdown, "close");
			this._highlightedIndex = null;
			inherited.apply(this, [silent]);
		},

		_updateSelectedItem: function(e) {
			var target = Polymer.dom(e).path[0],
				targetIndex = this.items.indexOf(target);
			if(targetIndex >= 0) this.selectedIndex = targetIndex;
		},

		_selectedIndexChanged: function(newIndex, oldIndex) {
			if(typeof newIndex === 'number') {
				var newSelected = this.items[newIndex],
					oldSelected = this.items[oldIndex],
					value = newSelected.value ? newSelected.value.toString() : newSelected.textContent.trim();

				this.fire('selected', {
					item: newSelected,
					index: newIndex,
					value: value,
					selected: true
				});
			}
			
			if (this.state === this.STATE_OPENED) this.close();
		},

		_highlightedIndexChanged: function(newIndex, oldIndex) {
			var inherited = BehaviorUtils.findSuper(StrandTraits.KeySelectable, '_highlightedIndexChanged');
			
			this.attributeFollows('highlighted', this.items[newIndex], this.items[oldIndex]);
			inherited.apply(this, [newIndex, oldIndex]);
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
		}
	});

})(window.Strand = window.Strand || {});
