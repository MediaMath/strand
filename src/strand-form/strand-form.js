/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.Form = Polymer({
		is: 'strand-form',

		behaviors: [
			StrandTraits.Stylable,
			StrandTraits.LightDomGettable,
			StrandTraits.Resolvable,
			StrandTraits.Columnable,
			StrandTraits.Refable,
			StrandTraits.Falsifiable
		],

		properties: {
			view: {
				type: Object
			},
			unsaved: {
				type: Boolean,
				value: true,
				notify: true,
				readOnly: true
			},
			showUnsavedMessage: {
				type: Boolean,
				value: true,
				notify: true
			},
			autoValidate: {
				type: Boolean,
				value: true
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
			footerFixed: {
				type: Boolean,
				value: true,
				notify: true
			},
			footerLeft: {
				type: Number,
				value: 0,
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
				observer: '_dataChanged',
				value: function() { return {}; }
			}
		},

		_initialData: {},
		_invalidFields: null,
		_validFields: null,

		listeners: {
			'changed' : '_handleChanged'
		},

		// Temp warning message
		created: function() {
			console.warn('This component contains experimental features. The configuration and API are subject to change. Please use at your own risk.');
		},

		attached: function() {
			if (this._isEmpty(this.config)) this.debounce('initConfig', this._initConfig);
			if (this._isEmpty(this.data)) this.debounce('initData', this._initData);
		},

		_dataChanged: function(newVal, oldVal) {
			if(!this._isEmpty(newVal)) {
				this.debounce('initData', this._initData);
			}
		},

		_configChanged: function(newVal, oldVal) {
			if (!this._isEmpty(newVal)) {
				this.debounce('initConfig', this._initConfig);
			}
		},

		_isEmpty: function(obj) {
			return !(Object.getOwnPropertyNames(obj).length > 0);
		},

		_select: function(ele, parent) {
			var scope = this || parent;
			return Polymer.dom(scope).querySelector(ele);
		},

		_initConfig: function() {
			var namedFields = Polymer.dom(this).querySelectorAll('[name]');
			var domConfig 	= {};
			var config 		= this._isEmpty(this.config) ? domConfig : this.config;

			if (namedFields.length <= 0) throw 'No DOM elements with a [name] attribute were found';

			// Construct domConfig from the light DOM
			namedFields.forEach(function(field) {
				var attrs = StrandLib.DataUtils.objectifyAttributes(field);
				var key = attrs.name;

				domConfig[key] = {
					field: 			field,
					validation: 	attrs.validation || null,
					noValidate: 	null,
					label: 			attrs.label || null,
					errorMsg: 		attrs['error-msg'] || null,
					errorMsgEle: 	attrs['error-msg-ele'] || null,
					errorMsgEleDOM: this._select('#'+attrs['error-msg-ele']) || null,
					parentEle: 		attrs['parent-ele'] || null,
					parentEleDOM: 	this._select('#'+attrs['parent-ele']) || Polymer.dom(field).parentNode,
					exclude: 		attrs.exclude || null
				};
			}, this);

			// Update config and mux the domConfig with the developer supplied
			// config - values from config override domConfig
			for (var key in config) {
				var field = config[key].field || this._select('[name='+key+']');
				var cfg = config;

				if (!field) throw 'There must be a corresponding DOM element for config[\''+key+'\']';

				cfg[key].errorMsgEleDOM = this._select('#'+cfg[key].errorMsgEle) || null;
				cfg[key].parentEleDOM = this._select('#'+cfg[key].parentEle) || Polymer.dom(field).parentNode;
				cfg[key] = StrandLib.DataUtils.copy(domConfig[key], cfg[key]);

				// Create error message element
				if (cfg[key].errorMsg && !cfg[key].errorMsgEle) {
					this._createErrorMsg(key, cfg[key].errorMsg, cfg[key].parentEleDOM);
				}

				// Create the field label
				if (cfg[key].label) {
					this._createLabel(key, cfg[key].label, field, cfg[key].parentEleDOM);
				}
			}
		},

		_initData: function() {
			if(this._isEmpty(this.config)) return;

			for (var key in this.config) {
				var field 	= this.config[key].field || this._select('[name='+key+']');

				if (!field) {
					throw 'There must be a corresponding DOM element for data[\''+key+'\']';
				}

				var exclude	= this.config[key].exclude || null;
				var value = this.data[key] || null;
				
				// If there was an initial value set in markup, use it
				if (field.value && value === null) {
					value = field.value;
				}

				// Update data
				if (!exclude) this._updateData(key, value);
				this._initialData[key] = value;

				// Populate the fields if necessary
				if (value && field.value !== value) {
					field.value = value;
				}
			}
		},

		_createErrorMsg:function(key, errorMsg, parentEleDOM) {
			var existingMsgEle = this._select('._'+key+'-error-msg') || null;

			if (!existingMsgEle) {
				// create one:
				errorMsgEleDOM = new Strand.FormMessage();
				errorMsgEleDOM.type = 'error';

				errorMsgEleDOM.message = errorMsg;
				errorMsgEleDOM.classList.add('_'+key+'-error-msg');
				Polymer.dom(parentEleDOM).appendChild(errorMsgEleDOM);

				this.config[key].errorMsgEleDOM = errorMsgEleDOM;		
			} else {
				existingMsgEle.message = errorMsg;
				
				this.config[key].errorMsgEleDOM = existingMsgEle;	
			}
		},

		_createLabel:function(key, label, field, parentEleDOM) {
			var existingLblEle 	= this._select('._'+key+'-label') || null;
			var labelTxt 		= document.createTextNode(label);
			var formLabel 		= null;

			if (!existingLblEle) {
				// create a new label
				formLabel = new Strand.Header();

				formLabel.size = 'medium';
				formLabel.setAttribute('name', name);
				formLabel.classList.add('_'+key+'-label');
				formLabel.setAttribute('form-header', true);

				Polymer.dom(formLabel).appendChild(labelTxt);
				Polymer.dom(parentEleDOM).insertBefore(formLabel, field);

				this.config[key].formLabel = formLabel;
			} else {
				Polymer.dom(existingLblEle).textContent = null;
				Polymer.dom(existingLblEle).appendChild(labelTxt);

				this.config[key].formLabel = existingLblEle;
			}
		},

		// handle changes within the form
		_handleChanged: function(e) {
			var field 			= e.target;
			var key				= field.getAttribute('name');
			var value 			= null;
			var validation 		= null;
			var exclude			= null;
			var isFormElement 	= this.config.hasOwnProperty(key);

			if (isFormElement) {
				exclude 		= this.config[key].exclude ? this.config[key].exclude : false;
				value 			= e.detail.value;
				validation 		= this.config[key].validation;

				if (!exclude) {
					this._updateData(key, value);
					this._setUnsaved(this._diffData());
				}

				if (validation && this.autoValidate) this._validateField(key, value);

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
			return Object.keys(this.data).filter(function(key) {
				return this.data[key] !== this._initialData[key];
			}, this).length > 0;
		},

		// form validation
		validate: function() {
			this._invalidFields = [];
			this._validFields = [];

			for (var key in this.config) {
				var exclude 		= this.config[key].exclude;
				var validation 		= this.config[key].validation;
				var noValidateFunc 	= typeof this.config[key].noValidate === 'function';
				var noValidate  	= this.config[key].noValidate || false;
				var field 			= this.config[key].field;
				var tagName 		= this.config[key].field.tagName.toLowerCase();
				var valid 			= false;
				var value 			= null;

				// If the field is excluded, it's value will not be in the flat 'this.data' object
				// and will need to be retrieved from the field itself
				value = exclude ? this.config[key].field.value : this.data[key];
				
				if (noValidateFunc) {
					// Call the function to derive true or false
					noValidate = this.config[key].noValidate(key, value, this.data, this.view);
				} else if (this.config[key].field.hasAttribute('no-validate')) {
					// Need to check the field for 'no-validate' attr - as it may have a bind,
					// which could be updated at any time... presence of the attr === true
					noValidate = true;
				}

				if (validation && !noValidate) {
					valid = this._validateField(key, value);
				} else if (tagName === 'strand-repeater') {
					// special case for strand-repeater
					// strand-repeater will handle it's own validation
					valid = field.validate();
				} else if (validation && noValidate) {
					// clean up prior validations if they were there
					this.resetFieldValidation(key);
				}

				// Store valid and invalid for this validation pass
				if (validation && !noValidate || tagName === 'strand-repeater' && !noValidate) {
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

		_validateField: function(key, value) {
			var valid 			= false;
			var field 			= this.config[key].field;
			var validation 		= this.config[key].validation;
			var errorMsg 		= this.config[key].errorMsg;
			var errorMsgEleDOM 	= this.config[key].errorMsgEleDOM;

			if (typeof(validation) === 'string') {
				var testSet = validation.replace(/\s/g, '').split("|"),
					result = [];

				result = testSet.map(function(item) {
					return StrandLib.Validator.rules[item](value);
				}, this).filter(function(item) {
					return item === true;
				});

				valid = result.length === testSet.length;
			} else if (typeof(validation) === 'function') {
				valid = validation(key, value, this.data, field, this.view);
			}
			
			// show or hide messaging in the ui
			errorMsgEleDOM.message = errorMsg;
			field.error = errorMsgEleDOM.visible = !valid;

			return valid;
		},

		updateFieldErrors: function(data) {
			for (var key in data) {
				var field 			= this.config[key].field;
				var errorMsgEleDOM 	= this.config[key].errorMsgEleDOM;
				var errorMsg 		= data[key];

				// update the stored messaging
				this.config[key].errorMsg = errorMsg;

				// display the messaging
				errorMsgEleDOM.message = errorMsg;
				field.error = errorMsgEleDOM.visible = true;
			}

			this._handleFooter(this.footerMessages.error, 'error', true);
		},

		resetFieldValidation: function(key) {
			var field 			= this.config[key].field;
			var errorMsgEleDOM 	= this.config[key].errorMsgEleDOM;

			// Views could trigger this via bindings prior to the
			if (field) field.error = false;
			if (errorMsgEleDOM) errorMsgEleDOM.visible = false;
		},

		serializeForm: function() {
			this.validate();

			this.fire('serialize-form', {
				valid: !this._invalidFields.length > 0,
				invalidFields: this._invalidFields,
				validFields: this._validFields,
				data: this.data 
			});

			return this.data;
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
		},

		_footerStyle: function(footerFixed, footerLeft) {
			if (footerFixed) {
				return this.styleBlock({
					position: 'fixed',
					left: footerLeft + 'px',
					bottom: '0px'
				});
			} else {
				return this.styleBlock({
					position: 'relative',
					marginTop: '10px'
				});
			}
		}		
	});

})(window.Strand = window.Strand || {});