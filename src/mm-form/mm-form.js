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
			unsaved: {
				type: Boolean,
				value: false,
				notify: true
			},
			showFooterMessages: {
				type: Boolean,
				value: true,
				notify: true
			},
			showWarningMessages: {
				type: Boolean,
				value: true,
				notify: true
			},
			_showFooterMessage: {
				type: Boolean,
				value: false,
				notify: true
			},
			_displayFooterMessage: {
				type: Boolean,
				computed: '_displayMessage(_showFooterMessage, showFooterMessages)'
			}
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
		attached: function() {
			// build form data object
			this.async(function() {
				var formFields = Polymer.dom(this).querySelectorAll('[name]');

				formFields.forEach(function(item) {
					var name 			= item.getAttribute('name'),
						field 			= item,
						label 			= item.getAttribute('label'),
						value 			= item.value,
						validation 		= item.getAttribute('validation'),
						errorMsg 		= item.getAttribute('error-message'),
						errorMsgEle		= null,
						fieldHeaderEle 	= null,
						parentEle 		= Polymer.dom(item).parentNode;

					// create the label and error message if necessary
					if (errorMsg) {
						errorMsgEle = new Strand.FormMessage();
						errorMsgEle.message = errorMsg;
						errorMsgEle.type = 'error';
						Polymer.dom(parentEle).appendChild(errorMsgEle);
					}

					if (label) {
						var headerTxt = document.createTextNode(label);
						fieldHeaderEle = new Strand.Header();
						fieldHeaderEle.size = 'medium';
						Polymer.dom(fieldHeaderEle).appendChild(headerTxt);
						Polymer.dom(parentEle).insertBefore(fieldHeaderEle, field);
					}

					// store the initial form data
					// TODO: OR populate it(?) given a formData is provided:
					this._updateData(name, value);

					// store the form items separately for reference later,
					// since the formData may not map directly to the items
					this.formItems[name] = {
						'field'				: field,
						'validation'		: validation,
						'errorMsg'			: errorMsg,
						'errorMsgEle' 		: errorMsgEle,
						'fieldHeaderEle' 	: fieldHeaderEle
					};

				}.bind(this));

				this._initialFormData = this.formData;
				
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

		// display footer messaging based on settings
		_displayMessage: function(_showFooterMessage, showFooterMessages) {
			return _showFooterMessage && showFooterMessages;
		},

		// *******************************
		// handle changes within the form
		_handleChanged: function(e) {
			var name = e.target.getAttribute('name'),
				value = e.detail.value,
				item = this.formItems[name]; // make sure it's an item we actually care about

			if (item && value) {
				this._updateData(name, item.value);
				// TODO: re-init the diff
				this.unsaved = this._diffData();

				// trigger a warning message in the footer
				if (this.unsaved && this.showWarningMessages) {
					this.footerMessage = this.footerMessages.warning;
					this.footerType = 'warning';
					this._showFooterMessage = true;
				}
			}
		},

		_updateData: function(name, value) {
			if (typeof(value) === 'object') {
				for (var subkey in value) {
					this.formData[subkey] = value[subkey];
				}
			} else {
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
			// console.log('serializeForm');
			// TODO: this should be formItems
			for (var key in this.formData) {
				var item 			= this.formItems[key]
					value 			= item.field.value,
					validation		= item.validation,
					isValid 		= false;

				this._updateData(item.field, value);
				this.unsaved = this._diffData();

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

			if (invalid.length > 0) {
				// show messaging in the footer
				if (this.unsaved) {
					this.footerType = 'error';
					this.footerMessage = this.footerMessages.error;
					this._showFooterMessage = true;
				}
			} else {
				// show messaging in the footer
				if (this.unsaved) {
					this.footerType = 'success';
					this.footerMessage = this.footerMessages.success;
					this._showFooterMessage = true;
				}
			}

			// fire a serialize-form event:
			this.fire('serialize-form', {
				isValid: !invalid.length > 0,
				invalidFields: invalid,
				validFields: valid,
				data: this.formData 
			});
		},
		
		// *******************************
		// TODO: handle the response data object
		// should be some key value pairs (same)
		
		// reconfigure based on the response - display more error messaging
		// or change the error messaging, etc - for if backend error wasn't
		// caught on the UI validation pass				

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