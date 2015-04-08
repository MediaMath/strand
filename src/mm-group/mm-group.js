Polymer('mm-group', {
	
	ver:"<<version>>",
	HALIGN: "horizontal",
	VALIGN: "vertical",
	HALIGN_LEFT: "hgroup-left",
	HALIGN_CENTER: "hgroup-center",
	HALIGN_RIGHT: "hgroup-right",
	VALIGN_TOP: "vgroup-top",
	VALIGN_CENTER: "vgroup-center",
	VALIGN_BOTTOM: "vgroup-bottom",
	type: null,

	publish: {
		fitparent: { value: false, reflect: true },
		group: { value: null, reflect: true },
		align: { value: null, reflect: true },
		value: { value: "", reflect: true }
	},

	ready: function() {
		// if no group ID is specified, generate a UID
		if(!this.group){
			this.group = this.createId();
		}

		if (!this.align) {
			this.align = "horizontal";
		}

		this.itemsByTagName = {};

		// set type immediately
		function setType(item, index) {
			var key = item.tagName.toLowerCase();
			this.itemsByTagName[key] = (this.itemsByTagName[key] || []);
			this.itemsByTagName[key].push(item);
		}
		this.items.forEach(setType.bind(this));

		// infer that only one unique key means only one tag type
		var numKeys = Object.keys(this.itemsByTagName).length;
		if (numKeys === 1){
			var tag = Object.keys(this.itemsByTagName)[0];
			this.type = tag;
		}
	},

	get items() {
		var items = Array.prototype.slice.call(this.$.groupItems.getDistributedNodes());
		return items.filter(function(item) { return item.nodeName !== "TEMPLATE"; });
	},

	fitparentChanged: function(oldVal, newVal) {
		function setItemFit(item) {
			item.setAttribute("fitparent", true);
		}
		if (this.fitparent !== null && this.type === "mm-button") {
			this.items.forEach(setItemFit.bind(this));
		}
	},

	alignChanged: function(oldVal, newVal){
		function setItemAlign(item, index) {
			var alignFirst	= (this.align !== this.HALIGN) ? this.VALIGN_TOP : this.HALIGN_LEFT,
				alignCenter = (this.align !== this.HALIGN) ? this.VALIGN_CENTER : this.HALIGN_CENTER,
				alignLast	= (this.align !== this.HALIGN) ? this.VALIGN_BOTTOM : this.HALIGN_RIGHT;

			// set layout on all items
			if (index === 0) {
				item.setAttribute("layout", alignFirst);
			} else if (index === this.items.length-1) {
				item.setAttribute("layout", alignLast);
			} else {
				item.setAttribute("layout", alignCenter);
			}
		}
		this.items.forEach(setItemAlign.bind(this));
	},

	groupChanged: function(oldVal, newVal) {

		function setItemGroup(item) {
			item.setAttribute("group", this.group);
		}
		this.items.forEach(setItemGroup.bind(this));
		if (oldVal) {
			if (this._handleUpdate) {
				this.removeEventListener("mousedown", this._handleUpdate);
			}
		}
		if (newVal && this.type === "mm-radio") {
			if (!this._handleUpdate) {
				this._handleUpdate = this.handleUpdate.bind(this);
			}
			this.addEventListener("selected", this._handleUpdate);
			this.handleUpdate();
		}
	},

	handleUpdate: function(e) {

		this.async(function() {
			var checked = this.items.filter(function(item) { 
				return item.hasAttribute("checked"); 
			})[0];
			if (checked) {
				this.value = checked.getAttribute("value") || checked.textContent.trim();
			}
		}.bind(this));
	},

	valueChanged: function(oldVal, newVal) {
		this.fire("changed", {value: this.value});
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
	},

	createId: function() {
		var timestamp = new Date().valueOf(),
			rndNum	= Math.floor((Math.random()*99)+1),
			groupId = 'g' + rndNum + '_' + timestamp;
		return groupId;
	}

});