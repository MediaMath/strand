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
			StrandTraits.DomSyncable
		],

		ready: function() {
			this.linkPaths("data","_collection.data");
			this.linkPaths("_collection.data","data");
		},

		// publish: {
		// 	batchSync:false,
		// 	adapter:"",
		// 	adapterInstance:{},
		// 	//paging
		// 	dirtyFetch:false,
		// 	isLoading: false,
		// 	page:0,
		// 	pageSize:10,
		// 	index:0,
		// 	indexOffset:0,
		// 	auto:false,
		// 	sparse: false,
		// 	data:null,
		// },

		// ready: function() {
		// 	// if (!this.data) this.data = [];
		// 	// this._silent = false;
		// 	this._initialPage = this.page;
		// },

		create: function(init, silent) {
			return this._collection.create(init, silent);
		},

		// adapterChanged: function(oldAdapter, newAdapter) {
		// 	if (typeof newAdapter === "string" && window[newAdapter]) {
		// 		this.adapterInstance = new window[newAdapter]();
		// 		this.adapterInstance.addEventListener("sync-pending", this.handleStartLoad.bind(this));
		// 		this.adapterInstance.addEventListener("sync-ready", this.handleStopLoad.bind(this));
		// 		this.adapterInstance.target = this;
		// 		this.adapterInstance.auto = this.auto;
		// 	}
		// },

		add: function(model, silent, force) {
			return this._collection.add(model, silent, force);
		},

		//** namespace conflict **
		// get: function(index) {
		// 	return this.data[index];
		// },

		getDataAt: function(index) {
			return this._collection.getDataAt(index);
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
		
		// handleStartLoad: function() {
		// 	this.isLoading = true;
		// },

		// handleStopLoad: function() {
		// 	this.isLoading = false;
		// },

		// batchSyncChanged: function(oldBatch, newBatch) {
		// 	if (this.batchSync) {
		// 		this.adapterInstance.mode = "batch";
		// 	} else {
		// 		this.adapterInstance.mode = "multiple";
		// 	}
		// },

		// pageChanged: function(oldPage, newPage) {
		// 	if (this.page < 0) this.page = 0;
		// 	if (this.adapterInstance) {
		// 		this.adapterInstance.page = this.page;
		// 	}
		// 	if (this.index !== this.page*this.pageSize) {
		// 		this.index = this.page*this.pageSize;
		// 	}
		// },

		// pageSizeChanged: function() {
		// 	if (this.adapterInstance) {
		// 		this.adapterInstance.pageSize = this.pageSize;
		// 	}
		// },

		// indexChanged: function(old, young) {
		// 	if (this.adapterInstance) {
		// 		var offset = 0,
		// 			delta = Math.floor(Math.log10(Math.abs(old - young)));
		// 		if (delta == 0) {
		// 			if (old > young) { 
		// 				offset = -this.indexOffset;
		// 			} else {
		// 				offset = this.indexOffset; 
		// 			}
		// 		} 
		// 		this.page = Math.floor((this.index+offset) / this.pageSize) | 0;
		// 	}
		// },

		get data() {
			return this._collection.data;
		},

		set data(input) {
			this._collection.data = input;
			//TODO: evented
		},

		// invalidate: function() {
		// 	this.dirtyFetch = true;
		// 	this.page = 0;
		// },

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