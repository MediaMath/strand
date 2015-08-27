/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {
	scope.Model = Polymer({

		is:"mm-model",

		properties: {
			mid:{
				type:String,
				value:null,
				observer:"_modelId"
			},
			cid:{
				type:String,
				value:null,
			},
			collection:{
				type:Strand.Collection,
				value:null,
			},
			adapter:{
				type:String,
				value:"Sync",
			},
			data:{
				type:Object,
				value: function() {
					return {};
				}
			},
			defaults:{
				type:Object,
				value: function() {
					return {};
				}
			}
		},
		// publish: {
		// 	mid: "",
		// 	cid: "",
		// 	collection: null,
		// 	// recursiveChanges: false,
		// 	adapter: "",
		// 	adapterInstance: {},
		// 	defaults:null,
		// 	data:null,
		// 	auto:false,
		// },

		// deepPublish: {
		// 	data:{},
		// },

		observers: [
			"_dataId(data.id, mid)"
		],

		init: function(data) {
			if (Object.keys(this.data).length === 0) {
				this.data = data || this.defaults;
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

		// get: function(property, obj) {
		// 	obj = obj || this.data;

		// 	var p = Path.get(property);
		// 	return p.getValueFrom(obj);
		// },

		// set: function(property, value, obj) {
		// 	obj = obj || this.data;

		// 	var p = Path.get(property);
		// 	return p.setvalueFrom(obj, value);
		// },

		toJSON: function() {
			return JSON.stringify(this.data);
		},

		get connection() {
			return this.adapterInstance;
		},

		_modelId: function(newModelId, oldModelId ) {
			console.log("modelId",oldModelId,newModelId);

			if (newModelId !== this.get("data.id"));
				this._set("data.id", newModelId);
		},

		_dataId: function(dId, mId) {
			console.log("dataId",dId);
			if (dId !== mId)
				this.mid = dId;
		},

	});
})(window.Strand = window.Strand || {}); 
