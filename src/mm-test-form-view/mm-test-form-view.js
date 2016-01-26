/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/

(function (scope) {

	scope.TestFormView = Polymer({
		is: "mm-test-form-view",

		behaviors: [
			StrandTraits.Refable
		],

		properties: {
			// custom form items:
			standardSize: {
				type: Boolean,
				value: true
			},

			width: {
				type: Number,
				observer: '_widthChanged'
			},

			height: {
				type: Number,
				observer: '_heightChanged'
			},

			// TODO: Test out the 3 field scenario
			// frequency_type
			frequency_type: {
				type: String
			},

			// frequency_interval
			frequency_interval: {
				type: String
			},

			// frequency_amount
			frequency_amount: {
				type: Number
			},

			// use_mm_freq
			use_mm_freq: {
				type: Boolean,
				value: false
			},

			//
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
							return data[name] === 'Red' && value === 'Red';
						},
						errorMsg: 'You need to select \'Red\'',
						label: 'Select a Color'
					},
					// first custom item
					'widthHeight' : {
						validation: 'empty',
						validateIf: function(name, value, data, view) {
							return view.standardSize;
						},
						errorMsg: 'You need to select a standard size',
						errorMsgEle: 'heightWidthError',
						exclude: true
					},
					'width' : {
						validation: function(name, value, data, view) {
							return parseInt(value) >= 0;
						},
						validateIf: function(name, value, data, view) {
							return !view.standardSize;
						},
						errorMsg: 'Enter a width',
						parentEle: 'widthHeightWrapper'
					},
					'height' : {
						validation: function(name, value, data, view) {
							return parseInt(value) >= 0;
						},
						validateIf: function(name, value, data, view) {
							return !view.standardSize;
						},
						errorMsg: 'Enter a height',
						parentEle: 'widthHeightWrapper'
					},
					// second custom item
					'use_mm_freq' : {
						// doesn't need anything
					},
					'frequency_type' : {
						parentEle: 'freqCapWrapper',
						validation: 'empty',
						validateIf: function(name, value, data, view) {
							return view.use_mm_freq;
						},
						errorMsg: 'Select a type'
					},
					'frequency_interval' : {
						parentEle: 'freqCapWrapper',
						validation: 'int|empty',
						// validateIf: function(name, value, data, view) {
						// 	return view.use_mm_freq;
						// },
						errorMsg: 'Select an interval'
					},
					'frequency_amount' : {
						parentEle: 'freqCapWrapper',
						validation: 'empty',
						// validateIf: function(name, value, data, view) {
						// 	return view.use_mm_freq;
						// },
						errorMsg: 'Enter an amount'
					}
				}
			},
			formData: {
				type: Object
			}
		},

		// custom form item interactions:
		_sizeRadioSelected: function(e) {
			this.async(function(){
				switch (e.detail.item.id) {
					case 'standardSize':
						this.standardSize = true;
						this.$.testForm.resetFieldValidation('width');
						this.$.testForm.resetFieldValidation('height');
						break;
					case 'nonStandardSize':
						this.standardSize = false;
						this.$.testForm.resetFieldValidation('widthHeight');
						break;
					default:
						return;	
				}
			});
		},

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
		},

		// another custom interaction
		_freqTypeChanged: function(e) {
			this.freqency_type = e.detail.value;
		},

		_freqIntervalChanged: function(e) {
			this.frequency_interval = e.detail.value;
		},

		_useMMFreqChanged: function(e) {
			// TODO: getting a changed messaging and we don't want it
			console.log(e);
			this.use_mm_freq = e.detail.state === 'checked';
		}

	});

})(window.Strand = window.Strand || {});