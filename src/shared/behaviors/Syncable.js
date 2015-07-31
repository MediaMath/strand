/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var DataUtils = StrandLib.DataUtils;
	var Storage = StrandLib.Storage;
	var Ajax = StrandLib.Ajax;

	var __csrf;

	function _getParamBase(obj) {
		return {
			params: obj.queryparam || [],
			urlParams: obj.urlparam || [],
			headers: obj.header || []
		};
	}

	var Syncable = {
		properties: {
			_csrf: {
				type:Object,
				value: function() {
					return new Storage("csrf","localStorage");
				}
			},
			_globals: {
				type:Object,
				value: function() {
					return new Storage("globals","localStorage");
				}
			},

			_ajax: {
				type:Object,
				value: function() {
					return new Ajax(this.options);
				}
			},

			endpoint:{
				type:String,
				value:"/"
			},

			auto:{
				type:Boolean,
				value:true
			},

			options:{
				type:Object,
				value:function() {
					return {
						contentType:"application/x-www-form-urlencoded",
						timeout:10000,
						withCredentials:false,
						concurrency:4
					};
				}
			},

			data: {
				type:Object,
				value: function() {
					return {};
				},
				observe:"_dataChanged"
			},

			cacheGlobals: {
				type:Boolean,
				value:false,
			},

			cacheCsrf:{
				type:Boolean,
				value:false
			},
			csrfHeader:{
				type:String,
				value:"X-CSRF-Token"
			},

			page: {
				type:Number,
				value:0,
				notify:true
			},
			pageSize:{
				type:Number,
				value:10,
				notify:true
			},

			cacheBuster: {
				type:Boolean,
				value:true,
			},

			inputParams:{
				type:Object,
				value:_getParamBase,
			},
			outputParams:{
				type:Object,
				value:_getParamBase,
			},

			_inputParams: {
				type:Object,
				value:_getParamBase,
			},
			_outputParams: {
				type:Object,
				value:_getParamBase,
			}
		},

		get: function(data, options) {
			return this.sync(Ajax.GET, data, options);
		},

		post: function(data, options) {
			return this.sync(Ajax.POST, data, options);
		},

		put: function(data, options) {
			return this.sync(Ajax.PUT, data, options);
		},

		delete: function (data, options) {
			return this.sync(Ajax.DELETE, data, options);
		},

		sync: function(method, data, options) {
			method = method || Ajax.GET;
			data = data || this.body;

			var configOpts = this._getDomConfig(method, this.domObject);

			options = DataUtils.copy({method:method, url:this.endpoint}, options, configOpts, this.options);

			this._getCacheBuster(this.cacheBuster, options.params);
			var promise = this._ajax.exec( data, options );
			promise.then(this._handleResult, this._handleError);

			return promise;
		},

		_getDomConfig: function(method, domObject) {
			var domConfig = method === Ajax.GET ? this.domObject["input-params"] : this.domObject["output-params"];
			domConfig = _getParamBase(domConfig) || _getParamBase();

			return {
				headers: domConfig.headers.map(DataUtils.nodeToParam),
				params: domConfig.params.map(DataUtils.nodeToParam),
				urlParams: domConfig.urlParams.map(DataUtils.nodeInnerValue)
			};
		},

		domObjectChanged: function(domObject) {
			// console.log(domObject);
			if (this.auto && this.auto !== "save") {
				this.get();
			}
		},

		_dataChanged:function(oldData, newData) {
			if (this.auto && this.auto !== "load") {
				this.post();
			}
		},

		_getCacheBuster: function(cacheBuster, queryParams) {
			if (this.cacheBuster) {
				queryParams = queryParams || [];

				var name = "nocache";
				if (typeof this.cacheBuster === "string" && this.cacheBuster.length > 0) {
					name = this.cacheBuster;
				}
				queryParams.push({
					name: name,
					value: Date.now()
				});
			}
		},

		_getCSRFHeader: function(result) {

			if (this.csrf) {
				var headReg = new Regexp(this.csrfHeader,"ig");
				var headers = ajax.xhr.getAllResponseHeaders().match(this.headReg);
				if (headers) {
					var csrf = ajax.xhr.getResponseHeader(headers[0]);
					__csrf = csrf;
					if (this.cacheCsrf) {
						this._csrf.save(csrf);
						// this.$.csrf.save(csrf);
					}
					// this.csrfHeader = csrf;
				}
			}
		},

		_setCSRFHeader: function(method, headers) {
			if (this.csrf && __csrf) {
				var csrf = DataUtils.param(this.csrfHeader, __csrf );
				if (method === Ajax.GET) {
					headers.push(csrf);
				} else {
					headers.push(csrf);
				}
			}
		},

		_handleResult: function(result) {
			console.warn("result",result);
			this._getCSRFHeader(result);
			this.fire("data-result",result);
			//TODO: things
		},

		_handleError: function(error) {
			console.warn("error",error);
			this.fire("data-error",error);
		},

		setGlobal: function(key, value) {
			this._globals[key] = value;
			this._globals.save();
		},

		getGlobal: function(key) {
			return this._globals[key];
		}
	};
	scope.Syncable = [
		scope.DomGettable,
		Syncable,
	];
}(window.StrandTraits = window.StrandTraits || {}));
