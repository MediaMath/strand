/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.Input = Polymer({
		is: 'strand-input',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Stylable,
			StrandTraits.Validatable,
			StrandTraits.Refable
		],

		properties: {
			direction: {
				type: String,
				value: false
			},
			size: {
				type: String,
				value: 'normal',
				reflectToAttribute: true,
				notify: true
			},
			placeholder: {
				type: String,
				reflectToAttribute: true
			},
			type: {
				type: String,
				value: "text",
				reflectToAttribute: true,
				observer: "_typeChanged"
			},
			icon: {
				type: String,
				value: false,
				reflectToAttribute: true
			},
			readonly: {
				type: Boolean,
				value: false,
				reflectToAttribute: true
			},
			search: {
				type: Boolean,
				value: false,
				reflectToAttribute: true,
				observer: "_searchChanged"
			},
			clear: {
				type: Boolean,
				value: false,
				reflectToAttribute: true
			},
			width: {
				type: Number,
				value: false,
				reflectToAttribute: true,
				// notify: true
			},
			maxlength: { 
				type: Number,
				value: false, 
				reflectToAttribute: true 
			},
			value: {
				type: String,
				observer: "_valueChanged",
				notify: true
			},
			disabled: { 
				type: Boolean,
				value: false, 
				reflectToAttribute: true 
			},
			fitparent: { 
				type: Boolean,
				value: false, 
				reflectToAttribute: true
			},
			layout: { 
				type: String,
				value: false, 
				reflectToAttribute: true 
			},
			_clearVisible: {
				type: Boolean,
				value: false
			}
		},

		DIRECTION_TOP:  "top",
		DIRECTION_BOTTOM: "bottom",

		_typeChanged: function(newVal, oldVal) {
			var types = /(text|password|email|number|tel|search|url)/ig;
			if (!types.test(newVal)) {
				this.type = "text";
			}
		},

		_searchChanged: function(newVal, oldVal) {
			if (newVal) { 
				this.icon = "search";
			} else if (!newVal && this.icon === "search") {
				this.icon = false;
			}
		},

		_updateIcon: function(icon, _clearVisible) {
			var visible = icon && !_clearVisible;
			return this.styleBlock({
				display: visible ? "block" : "none"
			});
		},

		_updateClear: function(_clearVisible) {
			return this.styleBlock({
				display: _clearVisible ? "block" : "none"
			});
		}, 
		
		_valueChanged: function(newVal, oldVal) {
			if (newVal && String(newVal).length > 0) {
				this._clearVisible = this.clear;
			} else {
				this._clearVisible = false;
			}
			this.fire("changed", { value: newVal });	
		},

		focus: function() {
			this.$.input.focus();
			// this.$.input.select();
		},

		blur: function() {
			this.$.input.blur();
		},

		clearInput: function(e) {
			this.value = null;
			this._clearVisible = false;
		},

		_updateStyle: function(width, fitparent) {
			var f = fitparent ? '100%' : false,
				w = width ? width + 'px' : null,
				style = {};

			if(w) style.width = f ? f : w;
			return this.styleBlock(style);
		},

		_updateClass: function(direction, error) {
			var o = {};
			o['text-input'] = true;
			o.invalid = error;
			o.top = (direction === this.DIRECTION_TOP);
			o.bottom = (direction === this.DIRECTION_BOTTOM);
			return this.classBlock(o);
		},

		_iconSize: function(size) {
			switch(size) {
				case 'large':
					return 16;
				case 'small':
					return 11;
				default:
					return 14;
			}
		}

	});

})(window.Strand = window.Strand || {});
