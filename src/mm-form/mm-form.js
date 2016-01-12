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
			StrandTraits.Resolvable,
			StrandTraits.Columnable
		],


		/*
			// TODO: new direction for this

			// data
			{
				key: value,
				key: value,
				key: value
			}

			// validation
			{
				key: function(name, value, data, validators)
			}

		*/	

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

			// what comes in:
			data: {
				type: Object,
				observer: '_dataChanged'
			},

			// will store updates/serialize - data becomes:
			_formData: {
				type: Object,
				value: function() { return {}; }
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

		// // common validation rules
		// rules: {
		// 	email: function(i) {
		// 		// var regEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		// 		// return regEx.test(i);
		// 		return validator.isEmail(i);
		// 	},
		// 	alpha: function(i) {
		// 		// var regEx = /^\w+$/;
		// 		// return regEx.test(i);
		// 		return validation.isAlpha(i);
		// 	},
		// 	int: function(i) {
		// 		// var regEx = /^\d+$/;
		// 		// return regEx.test(i);
		// 		return validator.isInt(i); 
		// 	},
		// 	decimal: function(i) {
		// 		// var regEx = /^\d*[.]\d+$/;
		// 		// return regEx.test(i);
		// 		return validator.isDecimal(i);
		// 	},
		// 	whitespace: function(i) {
		// 		// var regEx = /\s/;
		// 		// return i.length > 0 && !regEx.test(i);
		// 		return validator.isWhitespace(i);
		// 	},
		// 	checked: function(i) {
		// 		return validator.isChecked(i);
		// 	},
		// 	empty: function(i) {
		// 		return validator.isEmpty(i);
		// 	},
		// 	blank: function(i) {
		// 		return validator.isBlank(i);
		// 	}
		// },

		// *******************************
		// collect all the things (and data)
		// _canInit: false,

		attached: function() {
			// this._canInit = true;
			// this._initForm(this.data);
		},
		
		_dataChanged: function(newVal, oldVal) {
			// if (this._canInit) this._initForm(newVal); 
			this._initForm(newVal);
		},

		_initForm: function(data) {
			for (var key in data) {
				var name 			= key,
					label 			= this.data[key].label,
					errorMsg 		= this.data[key].errorMsg,
					ele 			= Polymer.dom(this).querySelector('[name='+name+']'),
					parentEle 		= Polymer.dom(ele).parentNode,
					// TODO: if there was an initial value in markup - handle it
					value			= null;

				if (ele.value || this.data[key].value) {
					value = ele.value || this.data[key].value;
				}

				this._updateData(name, value);
				this._createLabel(name, parentEle, ele, label);
				this._createErrorMsg(name, parentEle, errorMsg);
			}
		},

		_createErrorMsg:function(name, parentEle, msg) {
			var errorMsgEle = Polymer.dom(parentEle).querySelector('mm-form-message[name='+name+']') || null;

			if (!errorMsgEle) {
				errorMsgEle = new Strand.FormMessage();
				errorMsgEle.type = 'error';
				errorMsgEle.setAttribute('name', name);
				errorMsgEle.message = msg;
				Polymer.dom(parentEle).appendChild(errorMsgEle);					
			} else {
				errorMsgEle.message = msg;
			}
		},

		_createLabel:function(name, parentEle, ele, label) {
			var labelEle = Polymer.dom(parentEle).querySelector('mm-header[name='+name+']') || null,
				labelTxt = null;

			if (!labelEle) {
				labelTxt = document.createTextNode(label);
				labelEle = new Strand.Header();
				labelEle.size = 'medium';
				labelEle.setAttribute('name', name);
				Polymer.dom(labelEle).appendChild(labelTxt);
				Polymer.dom(parentEle).insertBefore(labelEle, ele);
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
			console.log('_handleChanged: ', e, e.detail.value);
			
			// var name = e.target.getAttribute('name'),
			// 	value = e.detail.value,
			// 	item = this.formItems[name]; // make sure it's an item we actually care about

			// if (item && value) {
			// 	this._updateData(name, item.value);
			// 	this.unsaved = this._diffData();

			// 	// trigger a warning message in the footer
			// 	if (this.unsaved && this.showUnsavedMessage) {
			// 		this.footerMessage = this.footerMessages.warning;
			// 		this.footerType = 'warning';
			// 		this._showFooterMessage = true;
			// 	}
			// }
		},

		_updateData: function(name, value) {
			this._formData[name] = value;
			console.log(this._formData);
		},

		_diffData: function() {
			// var diff = [];
			
			// for (var key in this.formData) {
			// 	if (key !== this._initialFormData[key]) {
			// 		diff.push(key);	
			// 	}
			// }
			// return diff.length > 0;
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