/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Checkbox = Polymer({
		is: 'mm-checkbox',

		behaviors: [
			StrandTraits.Stylable,
			StrandTraits.Validatable
		],

		properties: {
			PRIMARY_ICON_COLOR: {
				type: String,
				value: Colors.D0
			},
			icon: {
				type: String,
				value: false,
				reflectToAttribute: true,
			},
			iconColor: {
				type: String,
				value: false,
				reflectToAttribute: true,
			},
			state: {
				type: String,
				value: "unchecked",
				observer: "stateChanged"
			},
			checked: { 
				type: Boolean,
				reflectToAttribute: true,
				value: null,
				notify: true,
				observer: "checkedChanged",
			},
			disabled: { 
				type: Boolean,
				value: false, 
				reflectToAttribute: true 
			},
			partial: { 
				type: Boolean,
				computed: "_partialState(state)"
			},
			checkedIconColor: {
				type: String,
				computed: "_checkedIconColor(checked)"
			}
		},

		UNCHECKED_STATE: "unchecked",
		CHECKED_STATE: "checked",
		PARTIAL_STATE: "partial",

		// for validation and jQuery
		value: null,

		listeners: {
			"tap" : "toggleChecked"
		},

		_partialState: function(state) {
			return state === this.PARTIAL_STATE;
		},

		_checkedIconColor: function(checked) {
			return checked ? this.iconColor : false;
		},

		checkedChanged: function(newVal, oldVal) {
			if (newVal !== null) {
				this.debounce("stateChecked", this.handleCheckedChange);

				// also handle value - which should mirror "checked"
				this.value = newVal;
				if (this.validation) this.fire("value-changed", { value: this.value }, true);
			}
		},

		handleCheckedChange: function() {
			if (!this.checked) {
				this.state = this.UNCHECKED_STATE;
			} else if (this.checked) {
				this.state = this.CHECKED_STATE;
			}
		},

		stateChanged: function(newVal, oldVal) {
			this.debounce("stateChecked", this.handleStateChange);
			this.fire("changed", { state: this.state }, true);
		},

		handleStateChange: function() {
			if (this.state === this.PARTIAL_STATE) {
				this.checked = null;
			} else if (this.state === this.UNCHECKED_STATE) {
				this.checked = false;
			} else if (this.state === this.CHECKED_STATE) {
				this.checked = true;
			}
		},

		toggleChecked: function(e) {
			this.checked = !this.checked;
		},

		updateClass: function(icon, state) {
			var o = {};
			o.checkbox = !icon ? true : false;
			o["checkbox-icon"] = icon ? true : false;
			o.selected = (state === this.CHECKED_STATE) ? true : false;
			o.partial = (state === this.PARTIAL_STATE) ? true : false;
			return this.classBlock(o);
		}

	});

})(window.Strand = window.Strand || {});