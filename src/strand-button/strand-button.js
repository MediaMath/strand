/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.Button = Polymer({
		is: 'strand-button',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Stylable,
			StrandTraits.Refable
		],
		
		properties: {
			type: {
				type: String,
				value: "primary",
				reflectToAttribute: true
			},
			size: {
				type: String,
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
				reflectToAttribute: true 
			},
			selected: { 
				type: String,
				value: false, 
				reflectToAttribute: true 
			},
			error: {
				type: Boolean,
				value: false
			}
		},

		updateClass: function(fitparent, error, type) {
			var o = {};
			o.button = true;
			o.fit = fitparent;
			o.invalid = error;
			o[type] = true; 
			return this.classBlock(o);
		}

	});

})(window.Strand = window.Strand || {});