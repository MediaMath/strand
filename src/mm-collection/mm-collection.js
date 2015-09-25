/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	// function _generateCid(collection, model) {
	// 	model.cid = ++collection._cidIndex;
	// }

	// function _triggerDataEvent(instance) {
	// 	if (!instance._silent) {
	// 		instance.fire("data-changed", {
	// 			data:instance.data
	// 		});
	// 	} else {
	// 		instance._silent = false;
	// 	}
	// }

	var DataUtils = StrandLib.DataUtils;

	scope.Collection = Polymer({

		is:"mm-collection",

		_cidIndex: 0,

		properties: {
			// adapter:{},
			// _adapterInstance:{},
			// dirtyFetch:{},
			// data:{
			// 	type:Array,
			// 	value: function() {
			// 		return [];
			// 	}
			// }
			_sync: {
				type:StrandLib.Sync,
				value: function() {
					return new StrandLib.Sync();
				}
			},
			_collection: {
				type:StrandLib.Collection,
				value: function() {
					return new StrandLib.Collection(null, null, this._sync);
				}
			},
			adapter:{
				type:String,
				value:"Sync",
			}
		},

		behaviors: [
			StrandTraits.Pageable
		],

		ready: function() {
			this.linkPaths("data","_collection.data");
			this.linkPaths("_collection.data","data");
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
			this._collection.each(callback)
		},

		where: function(obj, matchValues) {
			return this._collection.where(obj,matchValues);
		},

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