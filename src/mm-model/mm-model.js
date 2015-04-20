/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
Polymer('mm-model', {
	ver:"<<version>>",

	publish: {
		mid: "",
		cid: "",
		collection: null,
		// recursiveChanges: false,
		adapter: "",
		adapterInstance: {},
		defaults:null,
		data:null,
		auto:false,
	},

	// deepPublish: {
	// 	data:{},
	// },

	ready: function() {
		if (!this.data) this.data = {};
	},

	observe: {
		"data.id mid":"idHandler"
	},

	init: function() {
		if (Object.keys(this.data).length === 0) {
			this.data = this.defaults;
		}
	},
	
	adapterChanged: function(oldAdapter, newAdapter) {
		if (typeof newAdapter === "string" && window[newAdapter]) {
			this.adapterInstance = new window[newAdapter]();
			this.adapterInstance.target = this;
			this.adapterInstance.auto = this.auto;
		}
	},

	autoChanged: function(oldAuto, newAuto) {
		if (this.adapterInstance)
			this.adapterInstance.auto = newAuto;
	},

	save: function() {
		return this.connection.post();
	},

	update: function() {
		return this.connection.put();
	},

	fetch: function() {
		return this.connection.get();
	},
	
	destroy: function() {
		return this.connection.delete();
	},

	clear: function() {
		this.data = {};
	},

	get: function(property, obj) {
		obj = obj || this.data;

		var p = Path.get(property);
		return p.getValueFrom(obj);
	},

	set: function(property, value, obj) {
		obj = obj || this.data;

		var p = Path.get(property);
		return p.setvalueFrom(obj, value);
	},

	toJSON: function() {
		return JSON.stringify(this.data);
	},

	get connection() {
		return this.adapterInstance;
	},

	idHandler: function(oldValue, newValue) {
		if (this.mid !== newValue) {
			this.mid = newValue;
		}

		if (this.data && this.data.id !== newValue) {
			this.data.id = newValue;
		}
	},

});