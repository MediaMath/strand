/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {
	
	scope.MMForm = Polymer({
		is: 'mm-form',

		behaviors: [
			StrandTraits.LightDomGettable,
			StrandTraits.Resolvable
		],

		properties: {
			columns: {
				type: Number,
				value: 4,
				reflectToAttribute: true
			},
			spacing: {
				type: Number,
				value: 10,
				reflectToAttribute: true
			},
			// submitMessage: {
			// 	type: String,
			// 	notify: true
			// },
			formItems: {
				type: Array
			},
			formData: {
				type: Object,
				value: function() { return {}; }
			}
		},

		observers: [
			"_applyStyles(columns, spacing)"
		],

		// common validation rules
		rules: {
			email: function(i) {
				var regEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				return regEx.test(i);
			},
			alpha: function(i) {
				var regEx = /^\w+$/;
				return regEx.test(i);
			},
			int: function(i) {
				var regEx = /^\d+$/;
				return regEx.test(i);
			},
			decimal: function(i) {
				var regEx = /^\d*[.]\d+$/;
				return regEx.test(i);
			},
			whitespace: function(i) {
				var regEx = /\s/;
				return i.length > 0 && !regEx.test(i);
			},
			checked: function(i) {
				return i === true;
			},
			empty: function(i) {
				return i && i.length > 0;
			},
			blank: function(i) {
				return i.trim().length > 0;
			}
		},

		// *******************************
		// Form Data: 
		// { 
		// 	key: { // object.getAttribute('form-id')
		// 		field: object, // the field element
		//		value: object/string, // value of the field 
		// 		validation: string, // i.e.: 'int|empty'
		// 		errorMessage: object // the error message element i.e: Polymer.dom(document)querySelector(field.getAttribute('error-message'));
		// 	},
		// 	...
		// }
		// *******************************

		ready: function() {
			// build form data object
			// TODO: consider effective children apis once we get to v1.2.3
			// https://www.polymer-project.org/1.0/docs/devguide/local-dom.html#effective-children
			this.async(function() {
				this.formItems = Polymer.dom(this).querySelectorAll('[form-id]');
				this.formItems.forEach(function(item) {
					var key = item.getAttribute('form-id'),
						field = item,
						value = item.value,
						validation = item.getAttribute('validation'),
						errorMessage = Polymer.dom(this).querySelector(item.getAttribute('error-message'));
					
					this.formData[key] = {
						'field': field,
						'value': value,
						'validation': validation,
						'errorMessage': errorMessage 
					};
				}.bind(this));
				console.log("this.formData: ", this.formData);
			});
		},

		// validate per field:
		_validateField: function(field) {
			// construct the test set based on pipes(?):
			var testSet = field.validation.replace(/\s/g, '').split("|")
				result = result = testSet.map(function(item) {
					return this.rules[item](field.value);
				}, this).filter(function(item) {
					return item === true;
				});

			return result.length === testSet.length;
		},

		submitForm: function() {
			var invalid = [],
				valid = [];

			// UI validation pass:
			// console.log('submitForm');
			this.formItems.forEach(function(item){
				var key 			= item.getAttribute('form-id'),
					value 			= item.value,
					dataItem 		= this.formData[key],
					isValid 		= false;

				// validate UI:
				dataItem.value = value;
				isValid = this._validateField(dataItem);

				// track invalid & valid fields
				if (!isValid) {
					invalid.push(key);
					dataItem.errorMessage.style.display = 'block'; 
				} else {
					valid.push(key);
					dataItem.errorMessage.style.display = 'none';
				}

				// show error state:
				item.error = !isValid;

			}.bind(this));

			// TODO:
			if (invalid.length > 0) {
				// there were errors
				// show footer error
			} else {
				// send the data to some endpoint
				// handle that response
			}

			// TODO - footer logic in here not index:
			// fire an invalid form event:
			this.fire('form-submit', {
				isValid: !invalid.length > 0,
				invalidFields: invalid,
				validFields: valid,
				data: this.formData 
			});
		},

		// styling concerns (columns)
		_applyStyles: function(columns, spacing) {
			var items = this.getLightDOM();

			if (items.length > 0) {
				var spanItems = items.filter(function(item){
						return item.hasAttribute('span');
					}),
					columnWidth = 100/columns;

				spanItems.forEach(function(item, index){
					var span = parseInt(item.getAttribute('span')),
						colWidth = columnWidth * span,
						calc = 'calc(' + colWidth + '% - ' + spacing + 'px)';

					item.style.width = calc;
					item.style.marginRight = spacing + 'px';
					item.style.marginBottom = spacing + 'px';
				});
			}
		},
	
	});

})(window.Strand = window.Strand || {});