/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
Polymer('mm-dropdown', {
	ver: "<<version>>",
	selectedItem: null,
	STATE_OPENED: "opened",
	STATE_CLOSED: "closed",
	LAYOUT_TYPE: "dropdown",
	SECONDARY_ICON_COLOR: Colors.A2,

	publish: {
		value: { value: "", reflect:true },
		placeholder: "Select",
		maxItems: 0,
		overflow: "hidden",
		overflowWidth: 0,
		disabled: { value: false, reflect: true },
		fitparent: { value: false, reflect: true },
		data: null,
		error: false,
		skinless: false,
		size: 'normal'
	},

	created: function() {
		this.state = this.STATE_CLOSED;
	},

	ready: function() {
		if (this.hasAttribute("value")) {
			this.initialValue = true;
		}

		// Bugfix hack for attribute selector css: 
		this.style.webkitTransform = this.style.webkitTransform;
	},

	attached: function() {
		WindowNotifier.addInstance(this);
	},

	detached: function() {
		WindowNotifier.removeInstance(this);
	},
	
	domReady: function() {
		if (!this.fitparent && !this.skinless) {		
			this.btnWidth = this.btnWidth + this.borderWidth;		
		}

		// set input layout default - is there an input?
		var search = this.$.search.getDistributedNodes();

		if (search.length) {
			search[0].setAttribute("layout", this.LAYOUT_TYPE);
		}

		this.resize();
	},

	// Called by WindowNotifier on window resize - also used to batch display updates
	resize: function() {
		this.job("resize", this.updateDisplay, 0);
	},

	updateDisplay: function() {
		var actualMax,
			item,
			panelWidth;

		// Handle scroll container Height if maxItems:
		if (this.maxItems) {
			actualMax = Math.min(this.items.length, this.maxItems);
			this.$.list.style.height = Math.min((this.itemHeight * actualMax), window.innerHeight) + "px";
			if(this.data) {
				this.$.list.querySelector("#recycler").resizeViewport();
			}
		}

		// Handle closePanel width:
		if (this.overflow === "visible") {
			if(this.overflowWidth) {
				panelWidth = this.overflowWidth + "px";
			} else if (this.items.length > 0 && this.scrollbarWidth || this.data) {
				item = this.items[0];

				if(this.data) {
					var recycler = this.$.list.querySelector("#recycler");
					item = recycler._physicalPanels[0].items[0];
				}

				var borderWidth = Measure.getBorderWidth(this.$.closePanel.$.container);
				panelWidth = Math.ceil(item.textBounds.width + this.scrollbarWidth + item.paddingWidth + borderWidth) + "px";
			} else {
				panelWidth = "auto";
			}
			this.$.closePanel.style.minWidth = this.btnWidth + "px";
		} else {
			panelWidth = this.btnWidth + "px";
		}

		this.$.closePanel.style.width = panelWidth;

		// Truncate the label if necessary:
		this.updateTitle();
	},

	set btnWidth(i) {		
		this.$.buttonMain.style.width = i + "px";
 	},

	get btnWidth() {
		if (this.$)
		return Math.ceil(parseFloat(Measure.getComputedStyle(this.$.buttonMain).width));
	},

	get btnPaddingWidth() {
		return Measure.getPaddingWidth(this.$.buttonMain);
	},

	get borderWidth() {
		return Measure.getBorderWidth(this.$.buttonMain);
	},

	get scrollbarWidth() {
		return Measure.getScrollbarWidth(this);
	},

	get itemHeight() {
		if(this.data) {
			return this.$.list.querySelector("#recycler").itemHeight;
		} else if(this.items.length) {
			return this.items[0].offsetHeight;
		}
		return 0;
	},

	get items() {
		return this.data ? this.data : Array.prototype.slice.call(this.$.items.getDistributedNodes());
	},

	open: function(e) {
		this.state = this.STATE_OPENED;
	},

	close: function(e) {
		this.state = this.STATE_CLOSED;
	},

	reset: function() {
		this.value = "";
	},

	// Note: this is called from the scope of the close-manager
	closeFilter: function(instance, e) {
		if(Array.prototype.slice.call(e.path).indexOf(this) > -1){
			e.stopImmediatePropagation();
		} else {
			instance.closeHandler();
		}
	},

	toggle: function(e) {
		if (this.state === this.STATE_OPENED) {
			this.close();
		} else {
			this.resize();
			this.open();
		}
	},

	onSelectItem: function(e, detail, sender) {
		if (e.target !== sender) {
			this.selectedFlag = true;
			this.selectedItem = this.data ? e.target.templateInstance.model.model : e.target;
			this.close();

			// Bugfix hack for attribute selector css:
			e.target.style.webkitTransform = e.target.style.webkitTransform;
		}
	},

	selectedItemChanged: function(oldItem, newItem) {
		if(oldItem) {
			oldItem.selected = false;
		}

		if(newItem) {
			newItem.selected = true;
			this.value = newItem.value;

			this.fire("selected", {
				item: newItem,
				index: this.items.indexOf(newItem),
				value: newItem.value,
				selected: newItem.selected
			});
		}
		this.async(this.updateTitle);
	},

	dataChanged: function() {
		this.resize();
		this.selectItemByValue(this.value);
	},

	valueChanged: function(oldValue, newValue) {
		if (this.initialValue) {
			this.initialValue = false;
		} else {
			this.fire("changed", {value:this.value});
			this.updateModel();
		}

		if(!this.selectedFlag) {
			this.selectItemByValue(this.value);
		}

		this.selectedFlag = false;
	},

	selectItemByValue: function(value) {
		var selectedIndex = this.items.map(this.getItemValue).indexOf(String(value));
		this.selectedItem = this.items[selectedIndex];
	},

	getItemValue: function(item) {
		return String(item.value);
	},

	// Add a title attr if the new value is longer than the button
	placeholderChanged: function(oldPlace, newPlace) {
		this.async(this.updateTitle);
	},

	updateTitle: function() {
		var textBounds = Measure.getTextBounds(this.$.labelText),
			availableTxtArea = (this.btnWidth + this.borderWidth) - this.btnPaddingWidth;

		if(textBounds.width >= availableTxtArea) {
			this.displayTitle = this.selectedItem ? this.selectedItem.label : this.placeholder;
		} else {
			this.displayTitle = "";
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