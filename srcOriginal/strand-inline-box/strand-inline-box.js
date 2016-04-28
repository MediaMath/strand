/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.InlineBox = Polymer({
		is: 'strand-inline-box',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Refable
		],

		_iconMap: {
			info:    { type: "info" },
			success: { type: "success" },
			warning: { type: "warning" },
			error:   { type: "warning" }
		},

		properties: {
			type: {
				type: String,
				value: "info",
				reflectToAttribute: true
			},
			maxlines: {
				type: Number
			},
			fitparent: { 
				type: Boolean,
				value: false, 
				reflectToAttribute: true 
			},
			layout: { 
				type: String,
				reflectToAttribute: true 
			},
			_icon: {
				type: Object,
				computed: '_getIconAttributes(type)'
			}
		},

		behaviors:[
			StrandTraits.Resolvable
		],

		LINE_HEIGHT: 18,
		TYPE_DEFAULT: "default",
		TYPE_MESSAGE: "message",

		_getContentStyle: function(maxlines) {
			var maxHeight = maxlines ? maxlines * this.LINE_HEIGHT + "px" : "none";
			return "max-height: " + maxHeight;
		},

		_getIconAttributes: function(type) {
			return this._iconMap[type];
		}
	});

})(window.Strand = window.Strand || {});
