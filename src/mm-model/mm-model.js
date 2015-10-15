/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {
	scope.Model = Polymer({

		is:"mm-model",

		properties: {
			_sync:{
				type:StrandLib.Sync,
				value:function() {
					return new StrandLib.Sync();
				}
			},
			_model:{
				type:StrandLib.Model,
				value:function() {
					return new StrandLib.Model(null, null, this._sync);
				}
			},
			collection:{
				type:Strand.Collection,
				value:null,
			},
			adapter:{
				type:String,
				value:"Sync",
			},
			defaults:{
				type:Object,
				value: function() {
					return {};
				}
			}
		},

		behaviors:[
			StrandTraits.DomSyncable
		],

		ready:function() {
			this._model.addEventListener("data-changed", function() { 
				this.fire("data-changed"); 
			}.bind(this));
		},

		init: function(data) {
			this._model.init(data || this.defaults);
		},
		
		adapterChanged: function(oldAdapter, newAdapter) {
			// if (typeof newAdapter === "string" && window[newAdapter]) {
			// 	this.adapterInstance = new window[newAdapter]();
			// 	this.adapterInstance.target = this;
			// 	this.adapterInstance.auto = this.auto;
			// }
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
			this._model.clear();
		},

		getData: function(path) {
			return this._model.get(path);
		},

		setData: function(path, value) {
			this._model.set(path, value);
		},

		toJSON: function() {
			return this._model.toJSON();
		},

		get connection() {
			return this._model.connection;
		},

		//proxy accessors to _model.data

		get mId() {
			return this._model.mId;
		},

		get cId() {
			return this._model.cId;
		},

		set mId(i) {
			this._model.mId = i;
		},

		set cId(i) {
			this._model.cId = i;
		},

		get data() {
			return this._model.data;
		},

		set data(i) {
			this._model.data = i;
			this.fire("data-changed");
		}

	});
})(window.Strand = window.Strand || {}); 
