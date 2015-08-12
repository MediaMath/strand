/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
Polymer({
	is: 'mm-group',
	
	HALIGN: "horizontal",
	VALIGN: "vertical",

	properties: {
		fitparent: { 
			type: String,
			reflectToAttribute: true,
			observer: 'fitparentChanged'
		},
		group: { 
			type: String,
			reflectToAttribute: true,
			observer: 'groupChanged'
		},
		align: { 
			align: 'horizontal',
			type: String,
			reflectToAttribute: true,
			observer: 'alignChanged'
		},
		value: { 
			type: String,
			reflectToAttribute: true 
		}
	},

	listeners: {
		'tap':'toggleSelection'
	},

	ready: function() {
		// if no group ID is specified, generate a UID
		if(!this.group){
			this.group = this.createId();
		}

		if (!this.align) {
			this.align = "horizontal";
		}

		this.type = this.getType();
	},

	// ***********************
	// TODO: Handle selection(!)
	// needs selectable or similar
	// ***********************

	getType: function() {
		var type = "";
		function setType(map, item) {
			var key = item.tagName.toLowerCase();
			map[key] = (map[key] || []);
			map[key].push(item);
			return map;
		}
		
		var itemsByTagName = this.items.reduce(setType.bind(this), {});

		// infer that only one unique key means only one tag type
		var numKeys = Object.keys(itemsByTagName).length;
		if (numKeys === 1){
			type = Object.keys(itemsByTagName)[0];
		}

		return type;
	},

	toggleSelection: function(e) {

		var target = Polymer.dom(e).localTarget;

		if(!this.multi && this.selectedItem) {
			this.selectedItem.toggleAttribute('selected', false)
		}
		this.selectedItem = target;
		this.selectedItem.toggleAttribute('selected');
	},

	get items() {
		return Array.prototype.slice.call(Polymer.dom(this.$.items).getDistributedNodes());
	},

	fitparentChanged: function(newVal, oldVal) {
		function setItemFit(item) {
			item.setAttribute("fitparent", this.fitparent);
		}

		this.items.forEach(setItemFit, this);
	},

	alignChanged: function(newVal, oldVal){
		// ***********************
		// TODO: GO back to the 0.5 way cause there are
		// too many gotchas doing it this way
		// ***********************
		function setItemAlign(item, index) {
			item.setAttribute("layout", this.align);
		}

		this.items.forEach(setItemAlign.bind(this));
	},

	groupChanged: function(newVal, oldVal) {

		function setItemGroup(item) {
			item.setAttribute("group", this.group);
		}
		this.items.forEach(setItemGroup.bind(this));
		if (oldVal) {
			if (this._handleUpdate) {
				this.removeEventListener("selected", this._handleUpdate);
			}
		}
		if (newVal) {
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
		// this.updateModel();
	},

	// bindModel: function(model, property) {
	// 	this.model = model;
	// 	this.property = property;
	// },

	// updateModel: function() {
	// 	if (this.model && this.property) {
	// 		//check for BB models
	// 		if (this.model.set) {
	// 			var o = {};
	// 			o[this.property] = this.value;
	// 			this.model.set(o);
	// 		} else {
	// 			this.model[this.property] = this.value;
	// 		}
	// 	}
	// },

	createId: function() {
		var timestamp = new Date().valueOf(),
			rndNum	= Math.floor((Math.random()*99)+1),
			groupId = 'g' + rndNum + '_' + timestamp;
		return groupId;
	}

});