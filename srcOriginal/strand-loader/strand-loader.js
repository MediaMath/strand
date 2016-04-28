/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {
	scope.Loader = Polymer({
		is: 'strand-loader',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Stylable,
			StrandTraits.Refable
		],

		properties: {
			bgColor: {
				type: String,
				value: "#000000",
			},
			bgOpacity: {
				type: Number,
				value: 0.5,
			},
			paddingTop: {
				type: Number,
				value: 5,
			},
			paddingLeft: {
				type: Number,
				value: 20
			},
			spinnerRadius: {
				type: Number,
				value: 9
			},
			spinnerNumTicks: Number,
			spinnerFillColor: String,
			spinnerLineWidth: Number,
			spinnerLineWeight: Number,
			spinnerNumTicks: Number,
			hasUserSpinner: {
				type: Boolean,
				value: false
			}
		},

		attached: function() {
			this.debounce('getSpinner', this._getSpinner, 0);
		},

		_getSpinner: function() {
			this.async(function() {
				this.hasUserSpinner = Polymer.dom(this.$.userSpinner).getDistributedNodes().length !== 0;
				this.spinner = this.hasUserSpinner ? this.querySelector('strand-spinner') : this.$.spinner;
				if(this.hasUserSpinner) this.spinnerRadius = this.spinner.radius;
			});
		},

		show: function () {
			this.style.display = "block";
			if(this.spinner) this.spinner.start();
		},

		hide: function () {
			this.style.display = "none";
			if(this.spinner) this.spinner.stop();
		},

		_updateStyle: function(spinnerRadius,bgColor,bgOpacity,paddingTop,paddingLeft) {
			return this.styleBlock({
				backgroundColor: this._convertHex(bgColor),
				borderRadius: spinnerRadius*2 + 'px',
				padding: paddingTop+'px ' + paddingLeft+'px'
			});
		},

		// util methods:
		_convertHex: function (value) {
			// expects a 6 digit hex value:
			hex = value.replace("#","");
			r = parseInt(hex.substring(0,2), 16);
			g = parseInt(hex.substring(2,4), 16);
			b = parseInt(hex.substring(4,6), 16);

			result = "rgba("+r+","+g+","+b+","+this.bgOpacity+")";
			return result;
		}
	});
})(window.Strand = window.Strand || {});