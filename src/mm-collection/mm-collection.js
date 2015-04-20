/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function () {

	function _generateCid(collection, model) {
		model.cid = ++collection._cidIndex;
	}

	function _triggerDataEvent(instance) {
		if (!instance._silent) {
			instance.fire("data-changed", {
				data:instance.data
			});
		} else {
			instance._silent = false;
		}
	}

	Polymer('mm-collection', {
		ver:"<<version>>",

		_cidIndex: 0,

		publish: {
			batchSync:false,
			adapter:"",
			adapterInstance:{},
			//paging
			dirtyFetch:false,
			isLoading: false,
			page:0,
			pageSize:10,
			index:0,
			indexOffset:0,
			auto:false,
			sparse: false,
			data:null,
		},

		// deepPublish: {
		// 	data:[]
		// },

		ready: function() {
			if (!this.data) this.data = [];
			this._silent = false;
			this._initialPage = this.page;
		},

		create: function(init, silent) {

			if (window.MMModel) {
				var t = new MMModel();
				t.data = init;
				this.add(t, silent);
			}
			
		},

		adapterChanged: function(oldAdapter, newAdapter) {
			if (typeof newAdapter === "string" && window[newAdapter]) {
				this.adapterInstance = new window[newAdapter]();
				this.adapterInstance.addEventListener("sync-pending", this.handleStartLoad.bind(this));
				this.adapterInstance.addEventListener("sync-ready", this.handleStopLoad.bind(this));
				this.adapterInstance.target = this;
				this.adapterInstance.auto = this.auto;
			}
		},

		autoChanged: function(oldAuto, newAuto) {
			if (this.adapterInstance)
				this.adapterInstance.auto = newAuto;
		},

		add: function(model, silent, force) {
			this._silent = silent;

			if (!model.cid || force) {
				_generateCid(this, model);
				this.data.push(model);
			} else {
				//check for conflicts
				if (!this.data.indexOf(model)) {
					var check = this.data.filter(function(m) {
						return m.cid === model.cid || m.mid === model.mid;
					});
					if (check.length >= 1 && !force) {
						throw(new Error("Model Conflict - matching cIDs"));
					}
				} else if (!force) {
					throw(new Error("Model Conflict - object matches existing"));
				}
			}

			model.addEventListener("data-changed", function() {
				_triggerDataEvent(this);
			}.bind(this));
		},

		get: function(index) {
			return this.data[index];
		},

		getData: function(index) {
			return this.data[index].data;
		},

		delete: function(input) {
			if (input instanceof MMModel) {
				this.data.slice(this.data.indexOf(input), 1);
			} else {
				var d = this.data.slice(input, 1);
				if (!d) {
					this.data.filter(function(model) {
						return model.mid !== input && model.cId !== input;
					});
				}
			}
		},

		clear: function(silent) {
			this.empty(silent);
		},

		empty: function(silent) {
			this._silent = silent;
			var o = this.data.slice();
			this.data = [];
			return o;
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
			if(this.data && this.data.length) {
				this.data.forEach(callback, this);
			}
		},

		where: function(obj, matchValues) {
			if (this.data && this.data.length) {
				var objKeys = Object.keys(obj);
				return this.data.filter(function match(model) {
					var data = model.data;
					return objKeys.reduce(function(prev, key) {
						return prev && (matchValues ? data[key] === obj[key] : data.hasOwnProperty(key));
					}, true);
				});
			}
		},
		
		handleStartLoad: function() {
			this.isLoading = true;
		},

		handleStopLoad: function() {
			this.isLoading = false;
		},

		batchSyncChanged: function(oldBatch, newBatch) {
			if (this.batchSync) {
				this.adapterInstance.mode = "batch";
			} else {
				this.adapterInstance.mode = "multiple";
			}
		},

		pageChanged: function(oldPage, newPage) {
			if (this.page < 0) this.page = 0;
			if (this.adapterInstance) {
				this.adapterInstance.page = this.page;
			}
			if (this.index !== this.page*this.pageSize) {
				this.index = this.page*this.pageSize;
			}
		},

		pageSizeChanged: function() {
			if (this.adapterInstance) {
				this.adapterInstance.pageSize = this.pageSize;
			}
		},

		indexChanged: function(old, young) {
			if (this.adapterInstance) {
				var offset = 0,
					delta = Math.floor(Math.log10(Math.abs(old - young)));
				if (delta == 0) {
					if (old > young) { 
						offset = -this.indexOffset;
					} else {
						offset = this.indexOffset; 
					}
				} 
				this.page = Math.floor((this.index+offset) / this.pageSize) | 0;
			}
		},

		invalidate: function() {
			this.dirtyFetch = true;
			this.page = 0;
		},

		get connection() {
			return this.adapterInstance;
		},

		get length() {
			return this.data.length;
		},

		get count() {
			return this._count || this.length;
		},

		toJSON: function() {
			this.data.toJSON();
		}

	});
})(); 