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
						parentEle: 'customItemWrapper'
					},
					'height' : {
						validation: function(name, value, data, view) {
							return parseInt(value) >= 0;
						},
						validateIf: function(name, value, data, view) {
							return !view.standardSize;
						},
						errorMsg: 'Enter a height',
						parentEle: 'customItemWrapper'
					}
				}
			},
			formData: {
				type: Object,
				notify: true
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
		}

	});

})(window.Strand = window.Strand || {});