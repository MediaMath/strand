/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {
	
	scope.Textarea = Polymer({
		is: 'strand-textarea',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Stylable,
			StrandTraits.Validatable,
			StrandTraits.Refable
		],

		properties: {
			placeholder: {
				type: String,
				reflectToAttribute: true
			},
			width: {
				type: Number,
				value: false,
				reflectToAttribute: true
			},
			height: {
				type: Number,
				value: false,
				reflectToAttribute: true
			},
			maxlength: { 
				type: Number,
				value: false, 
				reflectToAttribute: true 
			},
			value: {
				type: String,
				value: null,
				observer: "_valueChanged",
				notify: true
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
			mono: {
				type: Boolean,
				value: false,
				reflectToAttribute: true
			}
		},

		_valueChanged: function(newVal, oldVal) {
			if (newVal) {
				this.fire("changed", { value: newVal });
			}
		},

		_updateStyle: function(width, height, fitparent) {
			var f = fitparent ? "100%" : false,
				w = width ? width + "px" : "auto",
				h = height ? height + "px" : "auto";
 
			return this.styleBlock({
				width: f ? f : w,
				height: h
			});
		},

		_updateClass: function(error, mono) {
			var o = {};
			o["text-input"] = true;
			o.monospace = mono;
			o.invalid = error;
			return this.classBlock(o);
		}
	
	});

})(window.Strand = window.Strand || {});