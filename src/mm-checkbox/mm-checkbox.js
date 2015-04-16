/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt
*/
/* test.js */
Polymer('mm-checkbox', {

	ver:"<<version>>",
	PRIMARY_ICON_COLOR: Colors.D0,
	UNCHECKED_STATE: "unchecked",
	CHECKED_STATE: "checked",
	PARTIAL_STATE: "partial",

	publish: {
		icon: null,
		iconColor: null,
		state: null,
		checked: { value: false, reflect:true },
		disabled: { value: false, reflect: true }
	},

	created: function() {
		this.state = this.UNCHECKED_STATE;
	},

	ready: function() {
		this.setAttribute('type', 'checkbox');
	},

	get value() {
		return this.checked;
	},

	set value(input) {
		this.checked = input;
		this.updateModel();
	},

	checkedChanged: function(oldValue, newValue) {
		if(newValue === false) {
			this.state = this.UNCHECKED_STATE;
		} else if(newValue === true) {
			this.state = this.CHECKED_STATE;
		}
	},

	stateChanged: function(oldState, newState) {
		if (newState === this.PARTIAL_STATE) {
			this.checked = null;
		} else if(newState === this.UNCHECKED_STATE) {
			this.checked = false;
		} else if(newState === this.CHECKED_STATE) {
			this.checked = true;
		}
		this.fire("changed", { state: newState });
	},

	toggleChecked: function(e) {
		this.checked = !this.checked;
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