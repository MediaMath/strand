/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var Rectangle = StrandLib.Rectangle,
		Measure = StrandLib.Measure;

	scope.PulldownButton = Polymer({

		is: 'mm-pulldown-button',

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
				value: "hidden"
			},
			type: {
				type: String,
				value: "primary"
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
				value: false
			},
			iconColor: {
				type: String,
				computed: "_iconColor(type)"
			},
			overflowWidth: {
				type: Number,
				value: null
			},
			layout: String
		},

		PRIMARY_ICON_COLOR: Colors.D0,
		SECONDARY_ICON_COLOR: Colors.A2,

		behaviors: [
			StrandTraits.PositionableDropdown,
			StrandTraits.KeySelectable,
			StrandTraits.AutoClosable,
			StrandTraits.AutoTogglable,
			StrandTraits.Stylable,
			StrandTraits.NonScrollable
		],

		attached: function() {
			// colorize the icons
			this.async(function(){
				var icon = Polymer.dom(this.$.icon).getDistributedNodes();

				if (icon.length > 0) {
					icon[0].primaryColor = this.iconColor;
				}
			});
		},

		ready: function() {
			if(!this.toggleTrigger) {
				this.toggleTrigger = this.target;
			}
		},

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

				this.fire('selected', {
					item: newSelected,
					index: newIndex,
					value: newSelected.value || newSelected.innerText,
					selected: true
				});
			}

			if(typeof oldIndex === 'number') { 
				this.items[oldIndex].selected = false;
			}
		},

		_updateButtonClass: function(direction, fitparent, error, state, type) {
			var o = {};
			o["button"] = true;
			o["fit"] = fitparent;
			o["invalid"] = error;
			o[type] = true;
			o[state] = true;
			o["top"] = (direction === 'n');
			o["bottom"] = (direction === 's');
			return this.classBlock(o);
		},

		_iconColor: function(type) {
			return (this.type === "primary") ? this.PRIMARY_ICON_COLOR : this.SECONDARY_ICON_COLOR;
		}
	});

})(window.Strand = window.Strand || {});
