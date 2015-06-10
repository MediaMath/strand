/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.Action = Polymer({
		is: "mm-action",

		behaviors: [
			StrandTraits.Stylable
		],

		properties: {
			ver:{
				type:String,
				value:"<<version>>",
			},
			href: {
				type: String,
				value: false,
				reflectToAttribute: true
			},
			underline: {
				type: Boolean,
				value: false,
				reflectToAttribute: true
			},
			target: {
				type: String,
				value: "_self",
				reflectToAttribute: true
			},
			disabled: {
				type: Boolean,
				value: false,
				reflectToAttribute: true
			}
		},

		PRIMARY_ICON_COLOR: Colors.D0,

		ready: function() {
			// if there is an icon - colorize it:
			var items = Array.prototype.slice.call(Polymer.dom(this.$.icon).getDistributedNodes());
			if (items.length) {
				items[0].setAttribute("primary-color", this.PRIMARY_ICON_COLOR);
			}
		},

		updateClass: function(underline) {
			var o = {};
			o["action"] = true;
			o["underline"] = underline;
			return this.classList(o);
		}

	});
	
})(window.Strand = window.Strand || {});