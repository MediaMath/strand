/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.Button = Polymer({
		is: 'mm-button',

		behaviors: [
			StrandTraits.Stylable
		],
		
		properties: {
			ver: {
				type: String,
				value: "<<version>>"
			},
			type: {
				type: String,
				value: "primary",
				reflectToAttribute: true
			},
			disabled: { 
				type: Boolean,
				value: false, 
				reflectToAttribute: true 
			},
			fitparent: { 
				type: Boolean,
				value: false, 
				reflectToAttribute: true 
			},
			layout: { 
				type: String,
				value: false, 
				reflectToAttribute: true 
			},
			error: {
				type: Boolean,
				value: false
			}
		},

		PRIMARY_ICON_COLOR: Colors.D0,
		SECONDARY_ICON_COLOR: Colors.A2,
		
		ready: function() {
			// if there is an icon - colorize it:
			var items = Array.prototype.slice.call(Polymer.dom(this.$.icon).getDistributedNodes()),
				primaryColor = (this.type !== "primary") ? this.SECONDARY_ICON_COLOR : this.PRIMARY_ICON_COLOR;
			if (items.length) {
				items[0].setAttribute("primary-color", primaryColor);
			}
		},

		updateClass: function(fitparent, error, type) {
			var o = {};
			o["button"] = true;
			o["fit"] = fitparent;
			o["invalid"] = error;
			o[type] = true; 
			return this.classBlock(o);
		}

	});

})(window.Strand = window.Strand || {});