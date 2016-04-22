/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.ProgressBar = Polymer({
		is: 'strand-progress-bar',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Stylable,
			StrandTraits.Refable
		],

		properties: {
			backgroundColor: {
				type: String,
				value: Colors.A1
			},
			fillColor: {
				type: String,
				value: Colors.D3
			},
			height: {
				type: Number,
				value: 12
			},
			indeterminate: {
				reflectToAttribute: true,
				type: Boolean,
				value: false
			},
			percentComplete: {
				observer: '_clampPercentComplete',
				type: Number,
				value: 0
			},
			secondaryFillColor: {
				type: String,
				value: Colors.D5
			},
			width: {
				type: Number,
				value: null,
			}
		},

		_clampPercentComplete: function() {
			this.percentComplete = Math.max(Math.min(this.percentComplete, 100), 0);
		},

		_updateBarStyle: function(backgroundColor, height, width) {
			return this.styleBlock({
				backgroundColor: backgroundColor,
				borderColor: backgroundColor,
				height: height+'px',
				maxWidth: width ? width+'px' : '100%'
			});
		},

		_updateFillStyle: function(percentComplete, fillColor, secondaryFillColor, indeterminate) {
			if(indeterminate) {
				return this.styleBlock({
					backgroundImage: 'repeating-linear-gradient(-45deg,'+fillColor+','+fillColor+' 7px,'+secondaryFillColor+' 7px,'+secondaryFillColor+' 14px)',
					width: '100%'
				});
			} else {
				return this.styleBlock({
					backgroundColor: fillColor,
					width: percentComplete+'%',
				});
			}
		},

	});

})(window.Strand = window.Strand || {});