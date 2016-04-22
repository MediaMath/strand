/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.Box = Polymer({
		is: "strand-box",

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Refable
		],

		properties: {
			direction: {
				// options: row | row-reverse | column | column-reverse
				type: String,
				value: 'horizontal'
			},
			align: {
				// options: flex-start | flex-end | center | baseline | stretch
				type: String,
				value: 'flex-start'
			},
			justify: {
				// options: flex-start | flex-end | center | space-between | space-around
				type: String,
				value: 'flex-start'
			}
		},

		observers: [
			'_updateStyle(direction, align, justify)'
		],

		_updateStyle: function(direction, align, justify) {
			var flexDir = direction === 'horizontal' ? 'row' : 'column';

			this.style.flexDirection = flexDir;
			this.style.justifyContent = justify;
			this.style.alignItems = align;
		}

	});
	
})(window.Strand = window.Strand || {});