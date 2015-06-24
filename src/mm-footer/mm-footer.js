/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Footer = Polymer({
		is: 'mm-footer',

		properties: {
			ver: {
				type: String,
				value: "<<version>>",
			},
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
				value: false
			}
		},

		showMessage: function() {
			this.messageVisible = true;
		},

		hideMessage: function() {
			this.messageVisible = false;
		}

	});

})(window.Strand = window.Strand || {});
