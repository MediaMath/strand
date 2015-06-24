/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Checkbox = Polymer({
		is: 'mm-checkbox',

		behaviors: [
			StrandTraits.Stylable
		],

		properties: {
			ver: {
				type: String,
				value: "<<version>>"
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

		PRIMARY_ICON_COLOR: Colors.D0,
		UNCHECKED_STATE: "unchecked",
		CHECKED_STATE: "checked",
		PARTIAL_STATE: "partial",

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
			this.debounce("stateChecked", this.handleCheckedChange);
		},

		handleCheckedChange: function() {
			if (this.checked === false) {
				this.state = this.UNCHECKED_STATE;
			} else if (this.checked === true) {
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
			o["checkbox"] = !icon ? true : false;
			o["checkbox-icon"] = icon ? true : false;
			o["selected"] = (state === this.CHECKED_STATE) ? true : false;
			o["partial"] = (state === this.PARTIAL_STATE) ? true : false;
			return this.classBlock(o);
		},

		get value() {
			return this.checked;
		},

		set value(input) {
			this.checked = input;
			this.updateModel();
		},

		bindModel: function(model, property) {
			this.model = model;
			this.property = property;
		},

		updateModel: function() {
			if (this.model && this.property) {
				//check for BB models
				if (this.model.set) {
					var o = {};
					o[this.property] = this.value;
					this.model.set(o);
				} else {
					this.model[this.property] = this.value;
				}
			}
		}

	});

})(window.Strand = window.Strand || {});