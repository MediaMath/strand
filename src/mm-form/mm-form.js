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
			},
			// config/initial data & settings:
			config: {
				type: Object,
				observer: '_configChanged',
				value: function() { return {}; }
			},
			data: {
				type: Object,
				observer: '_dataChanged'
			}
		},

		_initialData: {},
		_invalidFields: null,
		_validFields: null,

		listeners: {
			'changed' : '_handleChanged'
		},

		_dataChanged: function(newVal, oldVal) {
			console.log('_dataChanged:', newVal);
			this.debounce('init', this._initForm);
		},

		_configChanged: function(newVal, oldVal) {
			console.log('_configChanged:', newVal);
			this.debounce('init', this._initForm);
		},

		_selectEle: function(ele, parent) {
			var scope = this || parent;
			return Polymer.dom(scope).querySelector(ele);
		},

		_initForm: function() {
			if (!this.data) return;

			for (var key in this.data) {
				var cfgKey = this.config[key] ? this.config[key] : null,
					field = this._selectEle('[name='+key+']'),
					validation = null,
					label = null,
					errorMsg = null,
					errorMsgEle = null,
					parentEle = null,
					value = this.data[key] || null;

				if (!field) {
					throw 'There must be a corresponding DOM element for data[\''+key+'\']';
				}

				// a config was or was not supplied - if one was supplied,
				// use it, if not create one
				if (cfgKey) {
					validation = cfgKey.validation ? cfgKey.validation : null,
					label = cfgKey.label ? cfgKey.label : null,
					errorMsg = cfgKey.errorMsg ? cfgKey.errorMsg : null,
					errorMsgEle	= cfgKey.errorMsgEle ? this._selectEle('#'+cfgKey.errorMsgEle) : null,
					parentEle = cfgKey.parentEle ? this._selectEle('#'+cfgKey.parentEle) : Polymer.dom(field).parentNode;
				} else {
					this.config[key] = {};
				}

				// If there was an initial value set in markup, use that
				// However, values set in the config will always 'win'
				if (field.value && value === null) {
					value = field.value;
				}

				// Store everything for reference later, assumes it's possible
				// to have a config which didn't include ALL of these items
				this.config[key].field = field;
				this.config[key].validation = validation; 
				this.config[key].label = label; 		
				this.config[key].errorMsg = errorMsg;
				this.config[key].errorMsgEle = errorMsgEle;
				this.config[key].parentEle = parentEle;

				// update data and DOM
				this._updateData(key, value);
				this._initialData[key] = value;

				if (errorMsg && !errorMsgEle) { 
					this._createErrorMsg(key, errorMsg, errorMsgEle, parentEle);
				} else {
					errorMsgEle.message = errorMsg;
				}

				if (label) this._createLabel(key, label, field, parentEle);

				// Populate the fields if necessary
				if (value && field.value !== value) {
					field.value = value;
				}
			}
		},

		_createErrorMsg:function(key, errorMsg, errorMsgEle, parentEle) {
			var existingMsgEle = this._selectEle('._'+key+'-error-msg') || null;

			if (!existingMsgEle) {
				// create one:
				errorMsgEle = new Strand.FormMessage();
				errorMsgEle.type = 'error';

				errorMsgEle.message = errorMsg;
				errorMsgEle.classList.add('_'+key+'-error-msg');
				Polymer.dom(parentEle).appendChild(errorMsgEle);

				// store the formMessage ref to config
				this.config[key].errorMsgEle = errorMsgEle;		
			} else {
				existingMsgEle.message = errorMsg;
			}
		},

		_createLabel:function(key, label, field, parentEle) {
			var existingLblEle = this._selectEle('._'+key+'-label') || null,
				formLabel = null, 
				labelTxt = null;

			if (!existingLblEle) {
				// create one:
				labelTxt = document.createTextNode(label);
				formLabel = new Strand.Header();

				formLabel.size = 'medium';
				formLabel.setAttribute('name', name);
				formLabel.classList.add('_'+key+'-label');

				Polymer.dom(formLabel).appendChild(labelTxt);
				Polymer.dom(parentEle).insertBefore(formLabel, field);

				// store the formLabel ref to config
				this.config[key].formLabel = formLabel;
			} else {
				labelEle.innerHTML = null;

				labelTxt = document.createTextNode(label);
				Polymer.dom(formLabel).appendChild(labelTxt);
			}
		},

		// handle changes within the form
		_handleChanged: function(e) {
			var field = e.target,
				key = field.getAttribute('name'),
				value = null,
				validation = null,
				isFormElement = this.data.hasOwnProperty(key);

			if (isFormElement) {
				value = e.detail.value;
				validation = this.config[key].validation;

				this._updateData(key, value);
				this.unsaved = this._diffData();

				if (validation) this._validateField(key, value);

				// show messaging in the footer
				if (this.unsaved && this.showUnsavedMessage) {
					this._handleFooter(this.footerMessages.warning, 'warning', true);
				} else {
					this._showFooterMessage = false;
				}
			}
		},

		_updateData: function(key, value) {
			this.data[key] = value;
		},

		_diffData: function() {
			var diff = [];
			for (var key in this.data) {
				if (this.data[key] !== this._initialData[key]) {
					diff.push(key);	
				}
			}
			return diff.length > 0;
		},

		// form validation
		validateFields: function(data) {
			this._invalidFields = [];
			this._validFields = [];

			for (var key in this.data) {
				var value 		= this.data[key],
					validation 	= this.config[key].validation,
					valid 		= false;
				
				if (validation) {
					valid = this._validateField(key, value);

					// Store valid and invalid for this validation pass
					if (valid) {
						this._validFields.push(key);
					} else {
						this._invalidFields.push(key);
					}
				}
				
				// show messaging in the footer
				if (this._invalidFields.length > 0) {
					this._handleFooter(this.footerMessages.error, 'error', true);
				} else {
					this._handleFooter(this.footerMessages.success, 'success', true);
				}
			}
		},

		// // TODO: Secondary validation pass returned from server-side validation
		// // Will need to assume that the front end validation rules were wrong
		// // and there needs to be a new method to bypass the current infrastructure
		// // to display this messaging...
		// updateInvalidFields: function(data) {
		// 	// TODO: This is also a bad assumption... the old validation infrastructure
		// 	// remains so all we're doing here is showing the messaging...
		// 	// not feasible to update the 'actual' validation rules unless there is a
		// 	// new config passed, with new rules
		// 	for (var key in data) {
		// 		var field = this.data[key].field,
		// 			errorMsgEle = this.data[key].errorMsgEle,
		// 			errorMsg = data[key];

		// 		// this.data[key].errorMsg = errorMsg;
		// 		errorMsgEle.message = errorMsg;
		// 		field.error = errorMsgEle.visible = true;
		// 	}

		// 	this._handleFooter(this.footerMessages.error, 'error', true);
		// },

		_validateField: function(key, value) {
			var valid 			= false,
				field 			= this.config[key].field,
				validation 		= this.config[key].validation,
				errorMsgEle 	= this.config[key].errorMsgEle;

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
				valid = validation(key, value, this.data);
			}
			
			// show or hide messaging in the ui
			field.error = errorMsgEle.visible = !valid;
			
			return valid;
		},

		serializeForm: function() {
			this.validateFields();

			this.fire('serialize-form', {
				valid: !this._invalidFields.length > 0,
				invalidFields: this._invalidFields,
				validFields: this._validFields,
				data: this.formData 
			});

			return this.formData;
		},

		cancel: function(e, host) {
			this.fire('cancel-form');
		},

		// footer and footer actions:
		_validType: function(type) {
			return type === 'primary' || type === 'secondary';
		},

		_handleClick: function(e) {
			e.preventDefault();
			e.model.item.callback(e,this);
		},

		_handleFooter: function(message, type, show) {
			this._footerMessage = message;
			this._footerType = type;
			this._showFooterMessage = show;
		},

		_displayMessage: function(_showFooterMessage, showFooterMessages) {
			return _showFooterMessage && showFooterMessages;
		}			
	});

})(window.Strand = window.Strand || {});