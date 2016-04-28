/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Checkbox = Polymer({
		is: 'strand-checkbox',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Stylable,
			StrandTraits.Validatable,
			StrandTraits.Refable
		],

		properties: {
			icon: {
				type: String,
				value: false,
				reflectToAttribute: true,
			},
			state: {
				type: String,
				value: "unchecked",
				observer: "_stateChanged"
			},
			checked: { 
				type: Boolean,
				reflectToAttribute: true,
				value: null,
				notify: true,
				observer: "_checkedChanged",
			},
			disabled: { 
				type: Boolean,
				value: false, 
				reflectToAttribute: true 
			},
			_partial: { 
				type: Boolean,
				computed: "_partialState(state)"
			}
		},

		UNCHECKED_STATE: "unchecked",
		CHECKED_STATE: "checked",
		PARTIAL_STATE: "partial",

		// for validation and jQuery
		value: null,

		listeners: {
			"tap" : "_toggleChecked"
		},

		_partialState: function(state) {
			return state === this.PARTIAL_STATE;
		},

		_checkedChanged: function(newVal, oldVal) {
			if (newVal !== null) {
				this.debounce("stateChecked", this._handleCheckedChange);

				// also handle value - which should mirror "checked"
				this.value = newVal;
				if (this.validation) this.fire("value-changed", { value: this.value }, true);
			}
		},

		_handleCheckedChange: function() {
			if (!this.checked) {
				this.state = this.UNCHECKED_STATE;
			} else if (this.checked) {
				this.state = this.CHECKED_STATE;
			}
		},

		_stateChanged: function(newVal, oldVal) {
			this.debounce("stateChecked", this._handleStateChange);
			this.fire("changed", { state: this.state }, true);
		},

		_handleStateChange: function() {
			if (this.state === this.PARTIAL_STATE) {
				this.checked = null;
			} else if (this.state === this.UNCHECKED_STATE) {
				this.checked = false;
			} else if (this.state === this.CHECKED_STATE) {
				this.checked = true;
			}
		},

		_toggleChecked: function(e) {
			this.checked = !this.checked;
		},

		_updateClass: function(icon, state) {
			var o = {};
			o.checkbox = !icon ? true : false;
			o["checkbox-icon"] = icon ? true : false;
			o.selected = (state === this.CHECKED_STATE) ? true : false;
			o.partial = (state === this.PARTIAL_STATE) ? true : false;
			return this.classBlock(o);
		}

	});

})(window.Strand = window.Strand || {});