/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Dialog = Polymer({
		is: 'mm-dialog',

		behaviors: [
			StrandTraits.Stackable
		],

		properties: {
			ver: {
				type: String,
				value: "<<version>>"
			},
			primaryButtonLabel: {
				type: String,
				value: 'Save'
			},
			secondaryButtonLabel: {
				type: String,
				value: 'Don\'t Save'
			},
			actionLabel: {
				type: String,
				value: 'Cancel'
			}
		},

		show: function() {
			this.$$('#dialog-inner-modal').show();
		},

		hide: function() {
			this.$$('#dialog-inner-modal').hide();
		}

	});

})(window.Strand = window.Strand || {});