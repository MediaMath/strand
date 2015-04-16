/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt
*/
Polymer('mm-textarea', {
	ver:"<<version>>",
	placeholder:'',

	publish: {
		disabled: { value: false, reflect: true },
		value: { value: '', reflect: true },
		fitparent: { value: false, reflect: true },
		error: false
	},

	ready: function() {
		this.email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		this.alpha = /^\w+$/;
		this.inter = /^\d+$/;
		this.floater = /^\d*[.]\d+$/;
	},

	valueChanged: function(oldVal, newVal) {
		//update model if needed
		this.updateModel();
		this.validate();
	},

	widthChanged: function (oldVal, newVal) {
		this.$.text.style.width = newVal + "px";
	},

	heightChanged: function (oldVal, newVal) {
		this.$.text.style.height = newVal + "px";	
	},

	validate: function() {
		var valid = this.validator();

		if (valid) {
			// this.$.text.classList.remove("invalid");
			this.error = false;
		} else {
			//TODO: show box?
			// this.$.text.classList.add("invalid");
			this.error = true;
		}

		return valid;
	},

	validator: function() {
		switch(this.validation) {
			case "empty":
				return this.value.length > 0;
			case "int":
				return this.inter.test(this.value);
			case "decimal":
				return this.floater.test(this.value);
			case "email":
				return this.email.test(this.value);
			case "alpha":
				return this.alpha.test(this.value);
			default:
				return true;
		}
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