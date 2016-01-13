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
				value: true,
				notify: true
			},
			showUnsavedMessage: {
				type: Boolean,
				value: true,
				notify: true
			},
			// config/initial data & settings:
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
								host.cancel();
							}
						},
						{
							label: 'Save',
							type: 'primary',
							callback: function(e,host) {
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

		_invalidFields: null,
		_validFields: null,

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

		// footer and footer actions:
		_validType: function(type) {
			return type === 'primary' || type === 'secondary';
		},

		_handleClick: function(e) {
			e.preventDefault();
			e.model.item.callback(e,this);
		},

		_displayMessage: function(_showFooterMessage, showFooterMessages) {
			return _showFooterMessage && showFooterMessages;
		},

		// handle changes within the form
		_handleChanged: function(e) {
			var field 			= e.target,
				name 			= e.target.getAttribute('name'),
				value 			= e.detail.value,
				validation		= this.data[name].validation,
				isFormElement 	= this.data.hasOwnProperty(name);

			if (isFormElement) {
				this._updateData(name, value);
				this.unsaved = this._diffData();
				this._validateField(name, value);

				// show messaging in the footer
				if (!this.unsaved && this.showUnsavedMessage) {
					this._footerMessage = this.footerMessages.warning;
					this._footerType = 'warning';
					this._showFooterMessage = true;
				}
			}
		},

		_updateData: function(name, value) {
			this._formData[name] = value;
			this._setFormData(this._formData);
		},

		_diffData: function() {
			var diff = [];
			for (var key in this.formData) {
				if (key !== this.data[key].value) {
					diff.push(key);	
				}
			}
			return !diff.length > 0;
		},

		// form validation
		validateFields: function(data) {
			this._invalidFields = [];
			this._validFields = [];

			for (var key in data) {
				var name = key,
					value = this._formData[key],
					valid = this._validateField(name, value);

				// Store valid and invalid for this validation pass
				if (valid) {
					this._validFields.push(name);
				} else {
					this._invalidFields.push(name);
				}
				
				// show messaging in the footer
				if (this._invalidFields.length > 0) {
					this._footerMessage = this.footerMessages.error;
					this._footerType = 'error';
					this._showFooterMessage = true;
				} else {
					this._footerMessage = this.footerMessages.success;
					this._footerType = 'success';
					this._showFooterMessage = true;
				}
			}
		},

		// TODO: Secondary validation pass returned from server-side validation
		// Will need to assume that the front end validation rules were wrong
		// and there needs to be a new method to bypass the current infrastructure
		// to display this messaging 

		_validateField: function(name, value) {
			var valid = false,
				field = this.data[name].field,
				validation = this.data[name].validation,
				errorMsgEle = this.data[name].errorMsgEle,
				errorMsg = this.data[name].errorMsg;

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
			
			// show or hide messaging in the ui
			errorMsgEle.message = errorMsg;
			field.error = errorMsgEle.visible = !valid;

			return valid;
		},

		serializeForm: function() {
			this.validateFields(this._formData);

			// fire a serialize-form event:
			this.fire('serialize-form', {
				valid: !this._invalidFields.length > 0,
				invalidFields: this._invalidFields,
				validFields: this._validFields,
				data: this.formData 
			});

			return this.formData;
		},

		cancel: function(e, host) {
			// fire a cancel-form event:
			this.fire('cancel-form');
		}			
	});

})(window.Strand = window.Strand || {});