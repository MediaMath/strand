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
			footerMessages: {
				type: Object,
				value: function() {
					return {
						'error' : 'This form contains errors',
						'success' : 'This form does not contain any errors',
						'warning' : 'This form contains unsaved changes'
					};
				}
			},
			footerType: {
				type: String,
				notify: true
			},
			footerMessage: {
				type: Boolean,
				value: true
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
			},
			_showFooterMessage: {
				type: Boolean,
				notify: true
			},
		},

		observers: [
			"_applyStyles(columns, spacing)"
		],

		listeners: {
			'changed' : '_handleChanged'
		},

		// common validation rules
		rules: {
			email: function(i) {
				// var regEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
				// return regEx.test(i);
				return validator.isEmail(i);
			},
			alpha: function(i) {
				// var regEx = /^\w+$/;
				// return regEx.test(i);
				return validation.isAlpha(i);
			},
			int: function(i) {
				// var regEx = /^\d+$/;
				// return regEx.test(i);
				return validator.isInt(i); 
			},
			decimal: function(i) {
				// var regEx = /^\d*[.]\d+$/;
				// return regEx.test(i);
				return validator.isDecimal(i);
			},
			whitespace: function(i) {
				// var regEx = /\s/;
				// return i.length > 0 && !regEx.test(i);
				return validator.isWhitespace(i);
			},
			checked: function(i) {
				return validator.isChecked(i);
			},
			empty: function(i) {
				return validator.isEmpty(i);
			},
			blank: function(i) {
				return validator.isBlank(i);
			}
		},

		_initialFormData: {},

		// *******************************
		// collect all the things (and data)
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
			var field = e.target,
				value = e.detail.value;

			this._dataUpdate(field, value);

			var diff = this._diffData();

			if (diff) {
				this.footerMessage = this.footerMessages.warning;
				this.footerType = 'warning';
				this._showFooterMessage = true;
			}
		},

		_dataUpdate: function(field, value) {
			var name = field.getAttribute('name');
			
			// can be triggered prior to the 'ready' method, where formData is created
			if (name && this.formData[name]) {
				this.formData[name] = value;
			}
		},

		_diffData: function() {
			var diff = [];
			
			for (var key in this.formData) {
				if (key !== this._initialFormData[key]) {
					diff.push(key);	
				}
			}

			return diff.length > 0;
		},

		// *******************************
		// form validation
		// validate per field:
		_validateField: function(validation, value) {
			// construct the test set based on pipes:
			var testSet = validation.replace(/\s/g, '').split("|"),
				result = [];

			// attempt with validate-js
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

				// show messaging in the footer
				if (this.footerMessage) {
					this.footerType = 'error';
					this.footerMessage = this.footerMessages.error;
					this._showFooterMessage = true;
				}
			} else {

				// send the data to some endpoint
				// handle that response
				
				// reconfigure based on the response - display more error messaging
				// or change the error messaging, etc - for if backend error wasn't
				// caught on the UI validation pass				

				// show messaging in the footer
				if (this.footerMessage) {
					this.footerType = 'success';
					this.footerMessage = this.footerMessages.success;
					this._showFooterMessage = true;
				}
			}

			// fire an invalid form event:
			this.fire('serialize-form', {
				isValid: !invalid.length > 0,
				invalidFields: invalid,
				validFields: valid,
				data: this.formData 
			});
		},

		// *******************************
		// TODO: replace with a behavior/component if this is something
		// that will be of benefit elsewhere
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