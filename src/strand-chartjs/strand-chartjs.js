/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Checkbox = Polymer({
		is: 'strand-chartjs',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Stylable,
			StrandTraits.Refable
		],

		properties: {
			width: {
				type: Number,
				value: 500
			},
			height: {
				type: Number,
				value: 500
			}
		},

		// TODO

		_updateStyle: function(width, height, fitparent) {
			return this.styleBlock({
				width: width + "px",
				height: height + "px"
			});
		}
	});

})(window.Strand = window.Strand || {});
