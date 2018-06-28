/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/

(function (scope) {

	scope.TestFormView = Polymer({
		is: "strand-test-form-view",

		behaviors: [
			StrandTraits.Refable
		],

		properties: {
			// custom form items:
			standardSize: {
				type: Boolean,
				value: true,
				observer: '_standardSizeChanged'
			},
			width: {
				type: Number,
				observer: '_widthChanged'
			},
			height: {
				type: Number,
				observer: '_heightChanged'
			},
			frequency_type: {
				type: String
			},
			frequency_interval: {
				type: String
			},
			frequency_amount: {
				type: Number
			},
			use_mm_freq: {
				type: Boolean,
				value: false,
				// observer: '_useMMFreqChanged'
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
						validation: function(name, value, data, view) {
							return data[name] === '1' && value === '1';
						},
						errorMsg: 'You need to select \'Red\'',
						label: 'Select a Color'
					},
					// first custom item
					'widthHeight' : {
						validation: 'empty',
						errorMsg: 'You need to select a standard size',
						errorMsgEle: 'heightWidthError',
						exclude: true
					},
					'width' : {
						validation: function(name, value, data, view) {
							return parseInt(value) >= 0;
						},
						errorMsg: 'Enter a width',
						parentEle: 'widthHeightWrapper'
					},
					'height' : {
						validation: function(name, value, data, view) {
							return parseInt(value) >= 0;
						},
						errorMsg: 'Enter a height',
						parentEle: 'widthHeightWrapper'
					},
					// second custom item
					'use_mm_freq' : {},
					'frequency_type' : {
						parentEle: 'freqCapWrapper',
						validation: 'empty',
						errorMsg: 'Select a type'
					},
					'frequency_amount' : {
						parentEle: 'freqCapWrapper',
						validation: 'int|empty',
						errorMsg: 'Enter an amount'
					},
					'frequency_interval' : {
						parentEle: 'freqCapWrapper',
						validation: 'empty',
						noValidate: function(name, value, data, view) {
							return !view.use_mm_freq;
						},
						errorMsg: 'Select an interval'
					}
				}
			},
			formData: {
				type: Object
			}
		},

		// custom form item interactions:
		_sizeRadioSelected: function(e) {
			if (e.target.id === 'standardSize') {
				this.standardSize = true;
			} else {
				this.standardSize = false;
			}
		},

		_standardSizeChanged: function(newVal, oldVal) {
			// reset previous validation state if necessary
			if (newVal) {
				this.$.testForm.resetFieldValidation('width');
				this.$.testForm.resetFieldValidation('height');
			} else {
				this.$.testForm.resetFieldValidation('widthHeight');
			}
		},

		_standardSizeDdl: function(e) {
			var dimensions = e.detail.value.split('x');
			var width = parseInt(dimensions[0]);
			var height = parseInt(dimensions[1]);
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
		},

		// another custom interaction
		_freqTypeChanged: function(e) {
			this.freqency_type = e.detail.value;
		},

		_freqIntervalChanged: function(e) {
			this.frequency_interval = e.detail.value;
		},

		// _useMMFreqOnChange: function(e) {
		// 	this.use_mm_freq = e.detail.value | 0;
		// },

		_useMMFreqChanged: function(newVal, oldVal) {
			if (!newVal) {	
				this.$.testForm.resetFieldValidation('frequency_type');
				this.$.testForm.resetFieldValidation('frequency_interval');
				this.$.testForm.resetFieldValidation('frequency_amount');
			}
		},

		_useMMFreq: function(use_mm_freq) {
			return !use_mm_freq;
		}
	});

})(window.Strand = window.Strand || {});