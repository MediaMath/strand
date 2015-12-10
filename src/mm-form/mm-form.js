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
			formItems: {
				type: Object,
				value: function() { return {}; }
			},
			formData: {
				type: Object,
				value: function() { return {}; }
			},
			footerMessage: {
				type: String,
				notify: true
			},
			footerType: {
				type: String,
				notify: true
			},
			showFooterMessage: {
				type: Boolean,
				notify: true
			},
			actions: {
				type: Array,
				value: function() {
					return [
						{
							label: 'Cancel',
							type: 'action',
							callback: function(e,host) {
								console.log('cancel - e: ', e, 'host: ', host);
							}
						},
						{
							label: 'Save',
							type: 'primary',
							callback: function(e,host) {
								console.log('save - e: ', e, 'host: ', host);
								host.serializeForm();
							}
						} 
					];
				}
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

		_initialFormData: {},

		// *******************************
		// Form Data: 
		// { 
		// 	key: { // object.getAttribute('form-id')
		// 		field: object, // the field element
		//		value: object/string, // value of the field 
		// 		validation: string, // i.e.: 'int|empty'
		// 		errorMsg: object // the error message element i.e: Polymer.dom(document)querySelector(field.getAttribute('error-message'));
		// 	},
		// 	...
		// }
		// *******************************

		ready: function() {
			// build form data object
			// TODO: consider effective children apis once we get to v1.2.3
			// https://www.polymer-project.org/1.0/docs/devguide/local-dom.html#effective-children
			this.async(function() {
				var formFields = Polymer.dom(this).querySelectorAll('[name]');

				formFields.forEach(function(item) {
					var key 			= item.getAttribute('name'),
						field 			= item,
						label 			= item.getAttribute('label'),
						value 			= item.value,
						validation 		= item.getAttribute('validation'),
						errorMsg 		= item.getAttribute('error-message'),
						errorMsgEle		= null,
						fieldHeaderEle 	= null;
					
					// create the label and error message if necessary
					if (errorMsg) {
						var parentEle = Polymer.dom(item).parentNode;

						errorMsgEle = new Strand.FormMessage();
						errorMsgEle.message = errorMsg;
						errorMsgEle.type = 'error';
						Polymer.dom(parentEle).appendChild(errorMsgEle);
					}

					if (label) {
						var parentEle = Polymer.dom(item).parentNode,
							headerTxt = document.createTextNode(label);

						fieldHeaderEle = new Strand.Header();
						fieldHeaderEle.size = 'medium';
						Polymer.dom(fieldHeaderEle).appendChild(headerTxt);
						Polymer.dom(parentEle).insertBefore(fieldHeaderEle, field);
					}

					// store the form data, hold on to the initial settings
					// for cross reference diff later 
					this.formData[key] = this._initialFormData[key] = value;

					// store the form items and related data/elements
					this.formItems[key] = {
						'field'				: field,
						'validation'		: validation,
						'errorMsg'			: errorMsg,
						'errorMsgEle' 		: errorMsgEle,
						'fieldHeaderEle' 	: fieldHeaderEle
					};

				}.bind(this));
				console.log("this.formData: ", this.formData);
				console.log("this._initialFormData: ", this._initialFormData);
				console.log("this.formItems: ", this.formItems);
			});
		},

		// *******************************
		// footer and footer actions:
		_validType: function(type) {
			return type === 'primary' || type === 'secondary';
		},

		_handleClick: function(e) {
			e.preventDefault();
			e.model.item.callback(e,this);
		},

		// *******************************
		// handle changes within the form
		_handleChanged: function(e) {

		},

		// *******************************
		// form validation
		// validate per field:
		_validateField: function(validation, value) {
			// construct the test set based on pipes:
			var testSet = validation.replace(/\s/g, '').split("|"),
				result = testSet.map(function(item) {
					return this.rules[item](value);
				}, this).filter(function(item) {
					return item === true;
				});

			return result.length === testSet.length;
		},

		serializeForm: function() {
			var invalid = [],
				valid = [];

			// UI validation pass:
			// console.log('submitForm');
			for (var key in this.formData) {
				var item 			= this.formItems[key]
					value 			= item.field.value,
					validation		= item.validation,
					isValid 		= false;

				// set the form data:
				this.formData[key] = value;

				// validate UI:
				isValid = this._validateField(validation, value);

				// track invalid & valid fields
				if (!isValid) {
					invalid.push(key);
					item.errorMsgEle.style.display = 'block'; 
				} else {
					valid.push(key);
					item.errorMsgEle.style.display = 'none';
				}

				// show error state:
				item.field.error = !isValid;
			}

			// TODO:
			if (invalid.length > 0) {
				this.footerType = 'error';
				this.footerMessage = 'This form contains errors.';
				this.showFooterMessage = true;
			} else {

				// send the data to some endpoint
				// handle that response
				
				// reconfigure based on the response - display more error messaging
				// or change the error messaging, etc - for if backend error wasn't
				// caught on the UI validation pass				

				this.footerType = 'success';
				this.footerMessage = 'This form does not contain any errors.';
				this.showFooterMessage = true;
			}

			// TODO - footer logic in here not index:
			// fire an invalid form event:
			this.fire('serialize-form', {
				isValid: !invalid.length > 0,
				invalidFields: invalid,
				validFields: valid,
				data: this.formData 
			});
		},

		// *******************************
		// TODO: This'll get replaced by Shuwen's system/component
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