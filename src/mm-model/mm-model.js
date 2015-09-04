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

		observers: [
			"_dataId(data.id)",
			"_modelId(mId)"
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

		getData: function(path) {
			return this.get("data."+path);
		},

		setData: function(path, value) {
			this.set("data."+path,value);
		},

		toJSON: function() {
			return JSON.stringify(this.data);
		},

		get connection() {
			return this.adapterInstance;
		},

		_modelId: function(mid) {
			// this.debounce("mid", Function("this.data.id = " + String(mid)));
			this.debounce("mid", function() {
				this.data.id = mid;
			});
		},

		_dataId: function(did) {
			// this.debounce("mid", Function("this.mid = " + String(this.data.id)));
			this.debounce("mid", function() {
				this.mId = this.data.id;
			});
		},

	});
})(window.Strand = window.Strand || {}); 
