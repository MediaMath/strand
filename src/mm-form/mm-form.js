/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	var rules = StrandLib.Validator.rules;

	scope.MMForm = Polymer({
		is: 'mm-form',

		behaviors: [
			StrandTraits.LightDomGettable,
			StrandTraits.Resolvable,
			StrandTraits.Columnable
		],

		properties: {
			
			unsaved: {
				type: Boolean,
				value: false,
				notify: true
			},

			showUnsavedMessage: {
				type: Boolean,
				value: true,
				notify: true
			},

			// configuration/initial settings:
			data: {
				type: Object,
				observer: '_dataChanged'
			},

			// flat data we can manipulate, without change handlers firing
			_formData: {
				type: Object,
				value: function() { return {}; }
			},

			// read only data that is exposed to end dev:
			formData: {
				type: Object,
				readOnly: true
			},

			// Footer related
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

			showFooterMessages: {
				type: Boolean,
				value: true,
				notify: true
			},

			_footerType: {
				type: String,
				notify: true
			},

			_footerMessage: {
				type: String,
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

		listeners: {
			'changed' : '_handleChanged'
		},

		_dataChanged: function(newVal, oldVal) {
			this._initForm(newVal);
		},

		_initForm: function(data) {
			for (var key in data) {
				var name 			= key,
					label 			= this.data[key].label,
					errorMsg 		= this.data[key].errorMsg,
					field 			= Polymer.dom(this).querySelector('[name='+name+']'),
					parentEle 		= Polymer.dom(field).parentNode,
					value			= this.data[key].value || null;

				// If there was an initial value set in markup, use that
				// However, values set in the config will always 'win':
				if (field.value && value === null) {
					value = field.value;
				}

				// store the field and parent element just in case we need
				// to reference those later
				this.data[name].field = field;
				this.data[name].parentEle = parentEle;

				this._updateData(name, value);
				this._createErrorMsg(name, parentEle, errorMsg);
				this._createLabel(name, parentEle, field, label);
			}
		},

		_createErrorMsg:function(name, parentEle, msg) {
			var errorMsgEle = Polymer.dom(parentEle).querySelector('._'+name+'-error-msg') || null;

			if (!errorMsgEle) {
				errorMsgEle = new Strand.FormMessage();
				errorMsgEle.type = 'error';

				errorMsgEle.message = msg;
				Polymer.dom(parentEle).appendChild(errorMsgEle);

				errorMsgEle.classList.add('_'+name+'-error-msg');
				this.data[name].errorMsgEle = errorMsgEle;					
			} else {
				errorMsgEle.message = msg;
			}
		},

		_createLabel:function(name, parentEle, field, label) {
			var labelEle = Polymer.dom(parentEle).querySelector('._'+name+'-label') || null,
				labelTxt = null;

			if (!labelEle) {
				labelTxt = document.createTextNode(label);
				labelEle = new Strand.Header();

				labelEle.size = 'medium';
				labelEle.setAttribute('name', name);

				Polymer.dom(labelEle).appendChild(labelTxt);
				Polymer.dom(parentEle).insertBefore(labelEle, field);

				labelEle.classList.add('_'+name+'-label');
				this.data[name].labelEle = labelEle;
			} else {
				labelEle.innerHTML = null;

				labelTxt = document.createTextNode(label);
				Polymer.dom(labelEle).appendChild(labelTxt);
			}
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
			// console.log('_handleChanged: ', e.detail.value);
			var field 			= e.target,
				name 			= e.target.getAttribute('name'),
				value 			= e.detail.value,
				validation		= this.data[name].validation,
				isFormElement 	= this._formData.hasOwnProperty(name);

			if (isFormElement) {
				this._updateData(name, value);
				this.unsaved = this._diffData();
				this._validateField(name, validation, value, field);

				// trigger an unsaved warning message in the footer
				if (this.unsaved && this.showUnsavedMessage) {
					this._footerMessage = this.footerMessages.warning;
					this._footerType = 'warning';
					this._showFooterMessage = true;
				}
			}
		},

		_updateData: function(name, value) {
			this._formData[name] = value;
			this._setFormData(this._formData);
			// console.log('_formData', this._formData);
			// console.log('formData', this.formData);
			// console.log('*******************************');
		},

		_diffData: function() {
			var diff = [];
			for (var key in this.formData) {
				if (key !== this.data[key].value) {
					diff.push(key);	
				}
			}
			return diff.length > 0;
		},

		// *******************************
		// form validation
		// validate per field:
		_validateField: function(name, validation, value, field) {
			var valid = false;

			if (typeof(validation) === 'string') {
				var testSet = validation.replace(/\s/g, '').split("|"),
					result = [];

				result = testSet.map(function(item) {
					return rules[item](value);
				}, this).filter(function(item) {
					return item === true;
				});

				valid = result.length === testSet.length;
			} else if (typeof(validation) === 'function') {
				valid = validation(name, value, this.formData);
			}
			
			this._showError(name, valid);

			return valid;
		},

		_showError: function(name, valid) {
			var field = this.data[name].field,
				errorMsg = this.data[name].errorMsgEle;

			field.error = errorMsg.visible = !valid;
		},

		serializeForm: function() {
			// var invalid = [],
			// 	valid = [];

			// // validation pass:
			// for (var key in this.formItems) {
			// 	var item 			= this.formItems[key]
			// 		value 			= item.field.value,
			// 		validation		= item.validation,
			// 		isValid 		= false;

			// 	this._updateData(item.field, value);
			// 	this.unsaved = this._diffData();

			// 	// validate UI:
			// 	isValid = this._validateField(validation, value);

			// 	// track invalid & valid fields
			// 	if (!isValid) {
			// 		invalid.push(key);
			// 		item.errorMsgEle.style.display = 'block'; 
			// 	} else {
			// 		valid.push(key);
			// 		item.errorMsgEle.style.display = 'none';
			// 	}

			// 	// show error state:
			// 	item.field.error = !isValid;
			// }

			// if (invalid.length > 0) {
			// 	// show messaging in the footer
			// 	if (this.unsaved) {
			// 		this.footerType = 'error';
			// 		this.footerMessage = this.footerMessages.error;
			// 		this._showFooterMessage = true;
			// 	}
			// } else {
			// 	// show messaging in the footer
			// 	if (this.unsaved) {
			// 		this.footerType = 'success';
			// 		this.footerMessage = this.footerMessages.success;
			// 		this._showFooterMessage = true;
			// 	}
			// }

			// // fire a serialize-form event:
			// this.fire('serialize-form', {
			// 	isValid: !invalid.length > 0,
			// 	invalidFields: invalid,
			// 	validFields: valid,
			// 	data: this.formData 
			// });
		},
		
		// *******************************
		// TODO: handle the response data object
		// should be some key value pairs (same)
		
		// reconfigure based on the response - display more error messaging
		// or change the error messaging, etc - for if backend error wasn't
		// caught on the UI validation pass				
	});

})(window.Strand = window.Strand || {});