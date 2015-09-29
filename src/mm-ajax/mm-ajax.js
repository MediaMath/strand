/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
/*jshint -W030 */
(function (scope) {

	scope.Ajax = Polymer({
		is: 'mm-ajax',

		GET: StrandLib.Ajax.GET,
		POST: StrandLib.Ajax.POST,
		PUT: StrandLib.Ajax.PUT,
		DELETE: StrandLib.Ajax.DELETE,

		properties: {
			ajax: {
				type:StrandLib.Ajax,
				value: function() {
					return new StrandLib.Ajax();
				}
			},
			url: {
				type:String,
				value:"",
				observer:"_updateAjax"
			},
			method: {
				type:String,
				value:"GET",
				observer:"_updateAjax"
			},
			responseType: {
				type:String,
				value:"",
				observer:"_updateAjax"
			},
			response:{
				type:Object,
				value:function() { return {}; },
				notify:true,
			},
			contentType:{
				type:String,
				value: 'application/x-www-form-urlencoded',
				observer:"_updateAjax"
			},
			auto: {
				type:Boolean,
				value:false,
				observer:"_updateAjax"
			},
			body: {
				type:Object,
				value: null,
				observer:"_updateAjax"
			},
			withCredentials: {
				type: Boolean,
				value: false,
				observer:"_updateAjax"
			},
			timeout: {
				type:Number,
				value: 10000,
				observer:"_updateAjax"
			},
			concurrency: {
				type:Number,
				value:4,
				observer:"_updateAjax"
			},
			progress: {
				type:Object,
				value: function() {
					return {
						percent:0,
						total:0,
						current:0
					};
				},
				notify:true
			},

		},

		ready: function() {
			this.async(function() {
				if (this._validateAjax()) {
					this.exec();
				}
			});
		},

		_updateAjax: function() {
			//TODO(dlasky): expose binds for additional prefs
			this.debounce("options", function() {
				this.ajax.options = StrandLib.DataUtils.copy(this.ajax.options, {
					contentType:this.contentType,
					responseType:this.responseType,
					method:this.method,
					url:this.url,
					body:this.body,
					withCredentials:this.withCredentials,
					timeout:this.timeout,
					concurrency:this.concurrency
				});
			}.bind(this));
		},

		_validateAjax: function() {
			if (!this.method || !this.auto) return false;
			if (this.method === StrandLib.Ajax.GET) {
				if (this.url) return true;
			} else {
				if (this.url && this.body) return true;
			}
			return false;
		},

		exec: function(data, options) {
			var p = this.ajax.exec(data, options);
			this.ajax.current.progress = this.handleProgress;
			p.then(this._handleResponse.bind(this), this._handleError.bind(this));
			return p;
		},

		queue: function(data, options, name) {
			return this.ajax.queue(data, options, name);
		},

		execQueue: function(name) {
			return this.ajax.execQueue(name);
		},

		abort: function() {
			this.ajax.abort();
			if (this.ajax.current) {
				this.ajax.current.promise.then(handleAbort, handleAbort);
			}
		},

		_handleAbort: function(e) {
			this.fire("data-abort", e);
		},

		_handleResponse: function(resp) {
			if (resp.response)
				this.set("response", resp.response);
			this.fire("data-ready", resp);
		},

		_handleError: function(error) {
			if(error.response)
				this.set("response", error.response);
			this.fire("data-error", error);
		},	

		_handleProgress: function(progress) {
			this.progress = progress;
			this.fire("data-progress", progress);
		},

		addHeader: function(name, value) {
			this.ajax.addHeader(name, value);
		},

		addParam: function(name, value) {
			this.ajax.addParam(name,value);
		},

		addUrlParam: function(param) {
			this.ajax.addUrlParam(param);
		},

		get status() {
			return this.ajax.status;
		},

		get state() {
			return this.ajax.state;
		},

		get xhr() {
			return this.ajax.xhr;
		}
	});

})(window.Strand = window.Strand || {});
