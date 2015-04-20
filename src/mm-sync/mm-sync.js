/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function () {

	var _csrf = null,
		_globals = null,
		_evtPrefix = "sync-",
		_empty = {},
		_store;

	function _getParamBase() {
		return {
			queryParams:[],
			urlParams:[],
			headers:[]
		};
	}

	Polymer('mm-sync', {
		ver:"<<version>>",

		get MODE_SINGLE() { return "single"; },
		get MODE_MULTIPLE() { return "multiple"; },

		publish: {
			endpoint: "//",
			auto: true,
			autoDebounce: 200,
			autoIgnoreNodes:[],

			target:_empty,
			targetType: "",
			syncMode: "single",
			contentType: "application/x-www-form-urlencoded",
			timeout: 10000,

			cacheBuster:null,
			inputParams: null, //user facing (js api)
			outputParams: null, 
			_inputParams: null,  //internal caching
			_outputParams: null, 

			saveResponse: true, //save response back to data
			
			csrf:true,
			csrfHeader:"",
			cacheCsrf:false,
			cacheGlobals: false,
			
			data: null,

			silentData: true,
			withCredentials: false,

			requestQueue: null,
			requestBuffer: null,
			requestConcurrency: 4,

			page:0,
			pageSize: 10
		},

		created: function() {
			this.requestQueue = [];
			this.requestBuffer = [];

			this.inputParams = this.inputParams || _getParamBase();
			this._inputParams = this._inputParams || _getParamBase();
			this.outputParams = this.outputParams || _getParamBase();
			this._outputParams = this.outputParams || _getParamBase();
		},

		ready: function() {

			this.silentData = false;
			if (this.cacheCsrf) {
				_csrf = this.$.csrf.load();
			}

			if (this.cacheGlobals) {
				_globals = this.$.globals.load() || {};
			} else {
				_globals = _globals || {};
			}

			if (!this.target || this.target === _empty ) {
				this.target = this;
			}
		},

		getLightDOM: function() {
			return DataUtils.clone(this.target.$.content.getDistributedNodes());
		},

		get: function() {
			return this.sync("get");
		},

		post: function() {
			return this.sync("post");
		},

		put: function() {
			return this.sync("put");
		},

		delete: function() {
			return this.sync("delete");
		},

		getDomParams: function() {

			function mapper(o) { 
				return {
					name: o.name,
					value: DataUtils.nodeInnerValue(o)
				};
			}

			var domProps = DataUtils.objectifyDistributedNodes( this.getLightDOM() ),
				keyMap = {
					"queryparam": { name: "queryParams", map: mapper},
					"urlparam":{ name:"urlParams", map: DataUtils.nodeInnerValue },
					"header": {name: "headers", map: mapper }
				},
				inputParams = domProps["input-params"] || {},
				outputParams = domProps["output-params"] || {};

				// try {
					Object.keys(keyMap).forEach(function(key) {
						//we have to do 3 sets of mappings here
						// 1) from the dom naming scheme to our js naming scheme whcih is what keyMap is for
						// 2) translate the dom node naming into a properCase js naming scheme
						// 3) merge the params from the dom and the userJS if they have set both (js wins)
						this._inputParams[keyMap[key].name] = DataUtils.mergeParamLists( (inputParams[key] || []).map(keyMap[key].map), this.inputParams[keyMap[key].name] );
						this._outputParams[keyMap[key].name] = DataUtils.mergeParamLists( (outputParams[key] || []).map(keyMap[key].map), this.outputParams[keyMap[key].name] );
					}, this);
				// } catch(e) {
				// 	throw( new Error("Malformed HTML Detected, check for proper closing tags."))
				// }

			return domProps;

		},

		setAjaxParams: function(ajax, mode, body) {
			this.fire(_evtPrefix + "pending", {mode:mode});

			if (ajax.state === 0 || ajax.state === 4) {
				
				if (ajax.state !== 0)
					ajax.reset();
				ajax.method = mode;
				ajax.contentType = this.contentType;
				ajax.timeout = this.timeout;
				ajax.url = this.endpoint; //rest is built from urlparams
				ajax.withCredentials = this.withCredentials;
				
				if (this.cacheBuster) {
					this._inputParams.queryParams.push(this.getCacheBuster());
					this._outputParams.queryParams.push(this.getCacheBuster());
				}

				this.setCSRFHeader(mode);
				
				switch(mode) {
					case "get":
						ajax.params = this._inputParams.queryParams;
						ajax.urlParams = this._inputParams.urlParams;
						ajax.headers = this._inputParams.headers;
						break;
					case "post":
					case "put":
					case "delete":
						if (this.cacheBuster) {
							ajax.params = this._outputParams.queryParams;
						}
						ajax.urlParams = this._outputParams.urlParams;
						ajax.headers = this._outputParams.headers;
						ajax.body = body;
						break;
					default:
						break;
				}

				return true;
			} else {
				//console.log("request in progress -- cannot set params ", ajax.status);
				return false;
			}
		},

		getCacheBuster: function() {
			var name = "nocache";
			if (typeof this.cacheBuster === "string" && this.cacheBuster.length > 0) {
				name = this.cacheBuster;			
			}
			return {
				name: name,
				value: Date.now()
			};
		},

		getCSRFHeader: function(ajax) {
			var headers = [],
				csrf = "";

			if (this.csrf) {
				headers = ajax.xhr.getAllResponseHeaders().match(/X-CSRF-Token/ig);
				if (headers) {
					csrf = ajax.xhr.getResponseHeader(headers[0]);
					_csrf = csrf;
					if (this.cacheCsrf) {
						this.$.csrf.save(csrf);
					}
					this.csrfHeader = csrf;
				}
			}
		},

		setCSRFHeader: function(mode) {
			var csrf;
			if (this.csrf && (this.csrfHeader || _csrf)) {
				csrf = DataUtils.param("X-CSRF-Token", this.csrfHeader || _csrf );
				if (mode === "get") {
					this._inputParams.headers.push(csrf);
				} else {
					this._outputParams.headers.push(csrf);
				}
			}
		},

		sync: function(mode) {
			var promise;
			this._inputParams = _getParamBase();
			this._outputParams = _getParamBase();
			//sanity check defaults
			if (!mode) mode = "GET";

			if (this.syncMode === this.MODE_SINGLE) {
				promise = this.appendQueue(mode, this.getOutputData());
			} else {
				promise = [];
				this.target.each(function(model) {
					promise.push(this.appendQueue(mode, this.getModelData(model)));
				});
			}

			return promise;
		},

		appendQueue: function(mode, body) {
			if (typeof MMAjax === "undefined") {
				throw(new Error("mm-ajax is a required import to use mm-sync"));
			}
			var a = new MMAjax(),
				pagePath = Path.get("target.page"),
				pageSizePath = Path.get("target.pageSize");
			this.getDomParams(mode);
			this.setAjaxParams(a, mode, body);
			var promise = a.promise;

			a.page = pagePath.getValueFrom(this);
			a.pageSize = pageSizePath.getValueFrom(this);
			
			var req = {
				ajax: a,
				promise: promise
			};
			this.requestQueue.push(req);
			this.manageQueue();
			return promise;
		},

		manageQueue: function() {
			if (this.requestQueue.length > 0 && this.requestBuffer.length < this.requestConcurrency) {
				var req = this.requestQueue.shift();
				req.ajax.exec()
					.then(this.handleResult.bind(this), this.handleError.bind(this))
					.then(this.manageQueue.bind(this), this.manageQueue.bind(this));
				this.requestBuffer.push(req);
			}
			this.requestBuffer = this.requestBuffer.filter(function(req) {
				return req.promise() === undefined;
			});
		},

		setData: function(data, silent) {
			this.silentData = silent;
			this.data = data;
		},

		handleResult: function(ajax, promise, result) {
			var csrf,
				response = result.response;

			if (this.saveResponse) {
				this.setData(response, true);
			}
			if (this.mode === this.MODE_SINGLE) {
				this.response = response;
			}
			if (this.target) {
				if (this.targetType === "collection") {
					this.setCollectionData(this.target, result, {
						page: ajax.page,
						pageSize: ajax.pageSize
					});
				} else {
					this.setModelData(this.target, result);
				}
			}

			this.getCSRFHeader(ajax);
			this.fire(_evtPrefix + "ready", {data: this.data });
		},
		
		handleError: function(ajax, promise, error, result) {
			this.fire(_evtPrefix + "error", {error:error, result:result});
			if (result && result.response && this.saveResponse) {
				this.setData(result.response, true);
			}
		},

		handleAuto: function(e) {
			if (this.auto && this.auto !== "save") {
				if (this.filterAuto(e).length === 0) {
					this.job("auto",this.get, this.autoDebounce);
				}
			}
		},

		filterAuto: function(e) {
			if (this.autoIgnoreNodes.length === 0) return [];
			var nlp = Path.get("detail.nodes"),
				nl = nlp.getValueFrom(e);
				if (nl) {
					return nl.filter(function(node) {
						var text = false;
						if (node.nodeType === Node.TEXT_NODE) {
							node = node.parentNode;
							text = true;
						}
						var o = this.autoIgnoreNodes.indexOf( node.nodeName.toLowerCase()) !== -1;
						if (o) {
							this.handleIgnoredNode(node, text);
						}
						return o;
					}.bind(this));
				}
		},

		handleIgnoredNode: function(node, isTextNode) {
			//STUB for parent class to implement as needed
		},

		targetChanged: function(oldTarget, newTarget) {
			if (window.MMCollection && window.MMModel) {

				if (newTarget instanceof MMCollection) {
					this.targetType = "collection";
					//OVERIDE WITH MODE_MULTIPLE if you need individual model saves
					this.syncMode = this.MODE_SINGLE; 
				}
				if (newTarget instanceof MMModel) {
					this.targetType = "model";
					this.syncMode = this.MODE_SINGLE;
				}

			}
			if (this.auto && this.auto !== "save") {
				this.job("auto",this.get, this.autoDebounce);
			}
		},
		
		getOutputData: function() {
			if (this.target === null) {
				return this.data;
			} else {
				if (this.targetType === "collection") {
					return this.getCollectionData(this.target);
				} else {
					return this.getModelData(this.target);
				}
			}
		},

		getCollectionData: function(collection) {
			return collection.data.map( function(model) {  return model.data; } );
		},

		getModelData: function(model) {
			return model.data;
		},

		setCollectionData: function(collection, result, paging) {
			if (this.target.dirtyFetch) {
				if (window.MMModel) {
					//assuming model/collection avail
					var m = new MMModel();
					m.data = result.response;
					if (collection.add)
						collection.add(m);
				} else {
					//assuming bare array
					collection = result.response; //reset since dirty
				}
			} else {
				if (window.MMModel) {
					collection.data = collection.data.concat(result.response.map(function(dataItem) {
						var m = new MMModel();
						m.data = dataItem;
						return m;
					}));
				} else {
					collection.data = collection.data.concat(this.data);
				}
			}
		},

		setModelData: function(model, result) {
			if (window.MMModel) {
				model.data = result.response;
			} else {
				model = result.response;
			}
		},
		
		//TODO: (dlasky) hook this up to deep-observe paradigm possibly
		dataChanged: function(oldData, newData) {
			if (this.auto && this.auto !== "load" && !this.silentData) {
				this.job("auto", this.post, this.autoDebounce);
			} else {
				this.silentData = false;
			}
		},

		pageChanged: function(oldPage, newPage) {
			if (this.auto && this.auto !== "save" && this.page >= 0) {
				this.job("auto",this.get, this.autoDebounce);
			}
		},
		//TODO: (dlasky) combine in observe block with above
		pageSizeChanged: function(oldPageSize, newPageSize) {
			if (this.auto && this.auto !== "Save" && this.pageSize > 0) {
				this.job("auto",this.get, this.autoDebounce);
			}
		},

		setGlobal: function(key, value) {
			_globals[key] = value;
			this.$.globals.save(_globals);
		},

		getGlobal: function(key) {
			return _globals[key];
		}

	});
})(); 