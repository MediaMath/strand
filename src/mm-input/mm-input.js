/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
Polymer('mm-input', {
	ver:"<<version>>",
	//defaults
	STATE_OPENED: "opened",
	STATE_CLOSED: "closed",
	PRIMARY_ICON_COLOR: Colors.A18,
	PADDING_ICON: 25,

	searchItems:[],
	state: "closed",
	placeholder:"",
	validation:"none",
	overflow: "hidden", // default width takes precedence
	type: "text", // input default type
	icon: "search", // default icon type 
	search: false,
	clear: false,
	error: false,
	autoItemSelected: false,
	autocomplete: false,
	paddingRight: 10,

	publish: {
		value: { value: "", reflect: true },
		disabled: { value: false, reflect: true },
		fitparent: { value: false, reflect: true },
		layout: { value: null, reflect: true },
		data: []
	},

	ready: function() {
		this.email = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		this.alpha = /^\w+$/;
		this.inter = /^\d+$/;
		this.floater = /^\d*[.]\d+$/;
	},

	dataChanged: function(oldData, newData) {
		if (typeof newData === "string") {
			try {
				this.data = JSON.parse(newData);
			} catch(e) {
				this.data = newData;
			}
		}
	},

	typeChanged: function(oldType, newType) {
		var types = /(text|password|email|number|tel|search|url)/ig;
		if (!types.test(newType)) {
			this.type = "text";
		}
	},

	searchChanged: function(oldVal, newVal) {
		if(this.icon === "search" && newVal) {
			this.paddingRight = this.PADDING_ICON;
			this.$.icon.style.display = "block";
		}
	},

	iconChanged: function(oldVal, newVal) {
		if(this.icon !== "search" && newVal) {
			this.paddingRight = this.PADDING_ICON;
			this.$.icon.style.display = "block";
		}
	},

	clearChanged: function(oldVal, newVal) {
		this.paddingRight = this.PADDING_ICON;
	},
	
	valueChanged: function(oldVal, newVal) {
		//update model if needed
		this.updateModel();
		this.fire("changed", { value: this.value });
		
		if (!this.autoItemSelected){
			// the user is typing
			this.validate();
			this.updateUI();
		} else {
			// the user selected an item from the autocomplete list
			this.autoItemSelected = false;
		}
	},

	inputWidthChanged: function (oldVal, newVal) {
		// set close panel width if the input width changed:
		if (this.$ && this.$.closePanel) {
			if (this.autocomplete && this.overflow === "visible") {
				this.$.closePanel.style.width = "auto";
				this.$.closePanel.style.minWidth = newVal + "px";
			} else {
				this.$.closePanel.style.width = newVal + "px";
			}
		}
	},

	validate: function() {
		var valid = this.validator();

		if (valid) {
			this.error = false;
		} else {
			this.error = true;
		}
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

	updateUI: function() {
		var dataFilter = function(a) {
			return a.name.indexOf(this.value) != -1;
		};

		//handle the clear and search state styling:
		if (this.value && this.value.length > 0) {
			if (this.clear) {
				this.$.clearBtn.style.display = "block";
			}
			if (this.icon === "search" && this.search && this.clear || this.icon && this.clear) {
				this.$.icon.style.display = "none";
			}
			if (this.autocomplete) {
				this.searchItems = this.data.filter(dataFilter.bind(this));
				if (this.searchItems.length > 0) {
					this.open();
				}
				// if (this.searchItems.length > this.maxItems) {
				// this.searchItems = this.searchItems.splice(0, this.maxItems);
				// }
			}
		} else {
			if (this.clear) {
				this.$.clearBtn.style.display = "none";
			}
			if (this.icon === "search" && this.search && this.clear || this.icon && this.clear) {
				this.$.icon.style.display = "block";
			}
			if (this.autocomplete) {
				this.close();
			}
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
	},

	clearInput: function(e) {
		this.value = "";
	},

	get inputWidth() {
		if (this.$)
		return parseFloat(Measure.getComputedStyle(this.$.input).width);
	},

	open: function(e) {
		this.state = this.STATE_OPENED;
	},

	close: function(e) {
		this.state = this.STATE_CLOSED;
	},

	onSelectItem: function(e) {
		this.autoItemSelected = true;
		this.value = e.detail.item.textContent.trim();
		this.close();
	},

	getWidth: function(value) {
		if(value && !this.fitparent) {
			return value + "px";
		} else {
			return "100%";
		}
	}
});