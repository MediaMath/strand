/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/

(function (scope) {

	scope.TestFormView = Polymer({
		is: "mm-test-form-view",

		behaviors: [],

		properties: {
			// custom form items:
			isStandard: {
				type: Boolean
			},

			width: {
				type: Number,
				observer: '_widthChanged'
			},

			height: {
				type: Number,
				observer: '_heightChanged'
			},

			// form data/config:
			formConfig: {
				type: Object,
				value: {
					'input' : {
						validation: 'int|empty',
						errorMsg: 'You need to type a number',
						label: 'Type a number'
					},
					'dropdown' : {
						validation: 'empty',
						errorMsg: 'You need to select an item',
						label: 'Select an Item'
					},
					'radio' : {
						validation: function(name, value, data) {
							return data[name] === 'Red' && value === 'Red';
						},
						errorMsg: 'You need to select \'Red\'',
						label: 'Select a Color'
					},
					'width' : {
						validation: function(name, value, data) {
							return parseInt(value) >= 0;
						},
						errorMsgEle: 'heightWidthError'
					},
					'height' : {
						validation: function(name, value, data) {
							return parseInt(value) >= 0;
						},
						errorMsgEle: 'heightWidthError'
					}
				}
			},
			formData: {
				type: Object,
				value: {
					'input' : null,
					'dropdown' : null,
					'radio' : null,
					'width' : null,
					'height' : null
				}
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

		// _valueChanged: function(newVal, oldVal) {
		// 	if (newVal) {
		// 		this.fire('changed', { value: newVal });

		// 		// set the dropdown if needed
		// 		if (!this.nonStandardSize) {
		// 			if (!this.$.standardSizeDdl.value) {
		// 				this.$.standardSizeDdl.value = String(
		// 					this.value.width + 'x' + this.value.height
		// 				);
		// 			} 
		// 		} else {
		// 			this.$.width.value = this.value.width;
		// 			this.$.height.value = this.value.height;
		// 		}
		// 	}
		// },

		_standardSizeChanged: function(e) {
			var dimensions = e.detail.value.split('x'),
				width = parseInt(dimensions[0]),
				height = parseInt(dimensions[1]);
			this._dimensionsChanged(width, height);
		},

		_widthChanged: function(newVal, oldVal) {
			console.log('_widthChanged: ', newVal);
		},

		_heightChanged: function(newVal, oldVal) {
			console.log('_heightChanged: ', newVal);
		},

		_dimensionsChanged: function(width, height) {
			this.width = width;
			this.height = height;
		}

	});

})(window.Strand = window.Strand || {});