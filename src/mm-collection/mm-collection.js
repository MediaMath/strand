/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	var DataUtils = StrandLib.DataUtils;
	var Sync = StrandLib.Sync;
	var Collection = StrandLib.Collection;

	scope.Collection = Polymer({

		is:"mm-collection",

		_cidIndex: 0,

		properties: {

			adapter:{
				type:String,
				value:"Sync",
				observer:"_adapterChanged"
			}
		},

		behaviors: [
			StrandTraits.Pageable
			// StrandTraits.DomSyncable
		],

		factoryImpl: function(auto) {
			this.auto = auto;
		},

		ready: function() {
			this._collection = new StrandLib.Collection(null, null, this._sync);
		},

		create: function(init, silent) {
			return this._collection.create(init, silent);
		},

		add: function(model, silent, force) {
			return this._collection.add(model, silent, force);
		},

		getDataAt: function(index) {
			return this._collection.getDataAt(index);
		},

		getModelAt: function(index) {
			return this._collection.getModelAt(index);
		},

		delete: function(input) {
			this._collection.delete(input);
		},

		clear: function(silent) {
			this._collection.empty(silent);
		},

		empty: function(silent) {
			this._collection.empty(silent);
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

		each: function(callback) {
			this._collection.each(callback);
		},

		where: function(obj, matchValues) {
			return this._collection.where(obj,matchValues);
		},

		_adapterChanged: function() {
			//TODO: (dlasky) update to new adapters
		},

		// _syncChanged: function() {
		// 	this._collection._sync = this._sync;
		// },

		// _collectionChanged: function() {
		// 	this._collection.addEventListener("data-changed", function() { 
		// 		this.fire("data-changed"); 
		// 	}.bind(this));
		// },

		get data() {
			return DataUtils.getPathValue("_collection.data", this);

		},

		set data(input) {
			DataUtils.setPathValue("_collection.data", this, input);
			//TODO: evented
		},

		get connection() {
			return this._collection.connection;
		},

		get length() {
			return this._collection.length;
		},

		get count() {
			return this._collection.count;
		},

		toJSON: function() {
			this._collection.toJSON();
		}

	});
})(window.Strand = window.Strand || {}); 