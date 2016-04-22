/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Footer = Polymer({
		is: 'strand-footer',

		properties: {
			message: {
				type: String,
				value: null
			},
			type: {
				type: String,
				value: "info"
			},
			messageVisible: {
				type: Boolean,
				reflectToAttribute: true
			},
			semiTransparent: {
				type: Boolean,
				reflectToAttribute: true
			}
		},

		behaviors:[
			StrandTraits.Resolvable,
			StrandTraits.Refable
		],

		showMessage: function() {
			this.messageVisible = true;
		},

		hideMessage: function() {
			this.messageVisible = false;
		}

	});

})(window.Strand = window.Strand || {});
