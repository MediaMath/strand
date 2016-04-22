/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {
	
	scope.FormMessage = Polymer({
		is: 'strand-form-message',

		behaviors: [
			StrandTraits.Resolvable
		],

		properties: {
			type: {
				type: String
			},
			message: {
				type: String
			},
			visible: {
				type: Boolean,
				value: false
			}
		},
	
	});

})(window.Strand = window.Strand || {});