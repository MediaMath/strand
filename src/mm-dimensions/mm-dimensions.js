/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/

(function (scope) {

	// special form component to validate assumptions:
	scope.Dimensions = Polymer({
		is: "mm-dimensions",

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Formable
		],

		properties: {
			value: {
				type: Object,
				notify: true,
				value: function() {
					return {
						width: null,
						height: null
					}
				},
				observer: "_valueChanged"
			},
			isStandard: {
				type: Boolean
			}
		},

		_handleRadioSelected: function(e) {
			switch (e.detail.item.id) {
				case 'standardSize':
					this.isStandard = true;
					break;
				case 'nonStandardSize':
					this.isStandard = false;
					break;
				default:
					return;	
			}
		},

		_valueChanged: function(newVal, oldVal) {
			if (newVal) {
				this.fire('changed', { value: newVal });

				// set the dropdown if needed
				if (!this.nonStandardSize) {
					if (!this.$.standardSizeDdl.value) {
						this.$.standardSizeDdl.value = String(
							this.value.width + 'x' + this.value.height
						);
					} 
				} else {
					this.$.width.value = this.value.width;
					this.$.height.value = this.value.height;
				}
			}
		},

		_standardSizeChanged: function(e) {
			var dimensions = e.detail.value.split('x'),
				width = parseInt(dimensions[0]),
				height = parseInt(dimensions[1]);
			this._dimensionsChanged(width, height);
		},
		_widthChanged: function(e) {
			e.preventDefault();
			if (e.detail.value) {
				var width = parseInt(e.detail.value),
					height = this.value ? this.value.height : null;
				this._dimensionsChanged(width, height);
			}
		},
		_heightChanged: function(e) {
			e.preventDefault();
			if (e.detail.value) {
				var width = this.value ? this.value.width : null,
					height = parseInt(e.detail.value);
				this._dimensionsChanged(width, height);
			}
		},
		_dimensionsChanged: function(width, height) {
			this.value = {
				width: width,
				height: height
			}
		}
	});

})(window.Strand = window.Strand || {}); 