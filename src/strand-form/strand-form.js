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
			_dataInitialized: {
				type: Boolean,
				value: false
			},
			_configInitialized: {
				type: Boolean,
				value: false
			},
			_initialized: {
				type: Boolean,
				computed: '_computeInitalized(_dataInitialized, _configInitialized)'
			},
			config: {
				type: Object,
				observer: '_configChanged',
				value: function() { return {}; }
			},
			data: {
				type: Object,
				observer: '_dataChanged',
				value: function() { return {}; }
			},
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
				this._dataInitialized = false;
			}
		},

		_configChanged: function(newVal, oldVal) {
			if (!this._isEmpty(newVal)) {
				this.debounce('initConfig', this._initConfig);
				this._configInitialized = false;
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
			var config = this.config;

			if (namedFields.length <= 0) throw 'No DOM elements with a [name] attribute were found';

			// Construct domConfig from the light DOM
			namedFields.forEach(function(field) {
				var attrs = StrandLib.DataUtils.objectifyAttributes(field);
				var key = attrs.name;

				domConfig[key] = {
					field: 			field,
					validation: 	attrs.validation || null,
					noValidate: 	attrs.novalidate || false,
					label: 			attrs.label || null,
					labelEle: 		attrs['label-ele'] || null,
					labelEleDOM: 	this._select('#'+attrs['label-ele']) || null,
					errorMsg: 		attrs['error-msg'] || null,
					errorMsgEle: 	attrs['error-msg-ele'] || null,
					errorMsgEleDOM: this._select('#'+attrs['error-msg-ele']) || null,
					parentEle: 		attrs['parent-ele'] || null,
					parentEleDOM: 	this._select('#'+attrs['parent-ele']) || Polymer.dom(field).parentNode,
					exclude: 		attrs.exclude || false
				};
			}, this);
			
			// If there was an intent to configure the form via DOM, this.config
			// must be set, as it is used heavily for DOM manipulations later
			if (this._isEmpty(this.config)) this.config = domConfig;

			// Update config and mux the domConfig with the developer supplied
			// config - values from config override domConfig
			for (var key in config) {
				var field = config[key].field || this._select('[name='+key+']');
				var cfg = config;
				var existingLblEle = this._select('._'+key+'-label') || null;
				var existingMsgEle = this._select('._'+key+'-error-msg') || null;


				if (!field) throw 'There must be a corresponding DOM element for config[\''+key+'\']';

				cfg[key] = StrandLib.DataUtils.copy(domConfig[key], cfg[key]);
				cfg[key].errorMsgEleDOM = this._select('#'+cfg[key].errorMsgEle) || existingMsgEle;
				cfg[key].labelEleDOM = this._select('#'+cfg[key].labelEle) || existingLblEle;
				cfg[key].parentEleDOM = this._select('#'+cfg[key].parentEle) || Polymer.dom(field).parentNode;

				// Create error message element (if one was not specified already)
				// or update the dev provided / existing error msg element:
				if (cfg[key].errorMsg && !existingMsgEle && !cfg[key].errorMsgEleDOM) {
					this._createErrorMsg(key, cfg[key].errorMsg, cfg[key].parentEleDOM);
				} else if (cfg[key].errorMsg && cfg[key].errorMsgEleDOM) {
					this._updateErrorMsg(key, cfg[key].errorMsg, cfg[key].errorMsgEleDOM);
				}

				// Create or update label (same as errorMsg)
				if (cfg[key].label && !existingLblEle && !cfg[key].labelEleDOM) {
					this._createLabel(key, cfg[key].label, field, cfg[key].parentEleDOM);
				} else if (cfg[key].label && cfg[key].labelEleDOM) {
					this._updateLabel(key, cfg[key].label, cfg[key].labelEleDOM);
				}
			}

			this._configInitialized = true;
		},

		_initData: function() {
			if(this._isEmpty(this.config)) return;

			for (var key in this.config) {
				var field 	= this.config[key].field || this._select('[name='+key+']');

				if (!field) {
					throw 'There must be a corresponding DOM element for data[\''+key+'\']';
				}

				var exclude	= this.config[key].exclude || false;
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

			this._dataInitialized = true;
		},

		_computeInitalized: function(_dataInitialized, _configInitialized) {
			return _dataInitialized && _configInitialized;
		},

		_createErrorMsg:function(key, errorMsg, parentEleDOM) {
			errorMsgEleDOM = new Strand.FormMessage();
			errorMsgEleDOM.type = 'error';

			errorMsgEleDOM.message = errorMsg;
			errorMsgEleDOM.classList.add('_'+key+'-error-msg');
			Polymer.dom(parentEleDOM).appendChild(errorMsgEleDOM);

			this.config[key].errorMsgEleDOM = errorMsgEleDOM;
		},

		_updateErrorMsg:function(key, errorMsg, errorMsgEleDOM) {
			if (errorMsgEleDOM) errorMsgEleDOM.message = errorMsg;
		},

		_createLabel:function(key, label, field, parentEleDOM) {
			var labelTxt = document.createTextNode(label);
			var labelEleDOM = null;
			
			labelEleDOM = new Strand.Header();
			labelEleDOM.size = 'medium';
			labelEleDOM.setAttribute('name', name);
			labelEleDOM.classList.add('_'+key+'-label');
			// TODO: strand-form-header element(?)
			labelEleDOM.setAttribute('form-header', true);

			Polymer.dom(labelEleDOM).appendChild(labelTxt);
			Polymer.dom(parentEleDOM).insertBefore(labelEleDOM, field);

			this.config[key].labelEleDOM = labelEleDOM;
		},

		_updateLabel: function(key, label, labelEleDOM) {
			if (labelEleDOM) {
				var labelTxt = document.createTextNode(label);

				Polymer.dom(labelEleDOM).textContent = null;
				Polymer.dom(labelEleDOM).appendChild(labelTxt);
			}
		},

		// handle changes within the form
		_handleChanged: function(e) {
			if (this._initialized) {
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
				var noValidate  	= this.config[key].noValidate || false;
				var field 			= this.config[key].field;
				var tagName 		= this.config[key].field.tagName.toLowerCase();
				var valid 			= false;
				var value 			= null;

				// If the field is excluded, it's value will not be in the flat 'this.data' object
				// and will need to be retrieved from the field itself
				value = exclude ? field.value : this.data[key];

				// Need to check the field for 'no-validate' attr - as it may have a bind,
				// which could be updated at any time... presence of the attr === true
				if (field.hasAttribute('no-validate')) noValidate = true;

				if (validation && !noValidate) {
					valid = this._validateField(key, value);
				} else if (tagName === 'strand-repeater' && !noValidate) {
					// special case - strand-repeater will handle it's own validation
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
			if (errorMsgEleDOM) {
				errorMsgEleDOM.message = errorMsg;
				errorMsgEleDOM.visible = !valid;
			}

			field.error = !valid;

			return valid;
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

		// TODO: public - needs doc
		clearValidationState: function() {
			for (var key in this.config) {
				this.resetFieldValidation(key);
			}
		},

		// footer and footer actions:
		clearFooterMsg: function() {
			this._handleFooter(undefined, undefined, false);
		},

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