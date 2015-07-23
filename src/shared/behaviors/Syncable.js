/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var DataUtils = StrandLib.DataUtils;
	var Storage = StrandLib.Storage;
	var Ajax = StrandLib.Ajax;

	function _getParamBase() {
		return {
			queryParams:[],
			urlParams:[],
			headers:[]
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
						concurrency:4,
					};
				}
			},

			data: {
				type:Object,
				value: function() {
					return {};
				}
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
			return this._ajax.exec( data, DataUtils.copy({method:Ajax.POST}, options));
		},

		put:function(data,options) {
			return this._ajax.exec( data, DataUtils.copy({method:Ajax.PUT}, options));
		},

		delete: function (data, options) {
			return this.sync(Ajax.DELETE, data, options);
		},

		sync: function(method, data, options) {
			method = method || Ajax.GET;
			data = data || this.body;
			options = DataUtils.copy({}, options, this.options);
			if (this.cacheBuster) {
				options.params = options.params || [];
				options.params.push(this.getCacheBuster());
			}


			return this._ajax.exec( data, DataUtils.copy({method:method}, options));
		},

		domObjectChanged: function(domObject) {
			console.log(domObject);
			if (this.auto) {
				//do things
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

		getCSRFHeader: function(result) {
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

		handleResult: function(result) {

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
		Syncable,
		scope.DomGettable
	];
}(window.StrandTraits = window.StrandTraits || {}));
