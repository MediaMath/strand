/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
/*jshint -W030 */
(function (scope) {

	var BehaviorUtils = StrandLib.BehaviorUtils,
		_ajax = StrandLib.Ajax.getBehavior();

	scope.Ajax = Polymer({
		is: 'strand-ajax',

		GET: StrandLib.Ajax.GET,
		POST: StrandLib.Ajax.POST,
		PUT: StrandLib.Ajax.PUT,
		DELETE: StrandLib.Ajax.DELETE,

		behaviors: [
			_ajax,
			StrandTraits.Refable
		],

		properties: {
			url: {
				type:String,
				value:"",
				observer:"_updateOpts"
			},
			query: {
				type: String,
				value: "",
				observer:"_updateOpts"
			},
			method: {
				type:String,
				value:"GET",
				observer:"_updateOpts"
			},
			responseType: {
				type:String,
				value:"",
				observer:"_updateOpts"
			},
			response:{
				type:Object,
				value:function() { return {}; },
				notify:true,
			},
			contentType:{
				type:String,
				value: 'application/x-www-form-urlencoded',
				observer:"_updateOpts"
			},
			auto: {
				type:Boolean,
				value:false,
				observer:"_updateOpts"
			},
			body: {
				type:Object,
				value: null,
				observer:"_updateOpts"
			},
			withCredentials: {
				type: Boolean,
				value: false,
				observer:"_updateOpts"
			},
			timeout: {
				type:Number,
				value: 10000,
				observer:"_updateOpts"
			},
			concurrency: {
				type:Number,
				value:4,
				observer:"_updateOpts"
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

		_updateOpts: function() {
			//TODO(dlasky): expose binds for additional prefs
			this.debounce("options", function() {
				this.options = StrandLib.DataUtils.copy(this.options, {
					contentType:this.contentType,
					responseType:this.responseType,
					method:this.method,
					url:this.url,
					body:this.body,
					query:this.query,
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
			var inherited = BehaviorUtils.findSuper(_ajax, 'exec');
			var p = inherited.apply(this, arguments);
			this.current.progress = this._handleProgress.bind(this);
			p.then(this._handleResponse.bind(this), this._handleError.bind(this));
			return p;
		},

		abort: function() {
			var inherited = BehaviorUtils.findSuper(_ajax, 'abort');
			inherited.apply(this, arguments);
			if (this.current) {
				this.current.promise.then(this._handleAbort.bind(this), this._handleAbort.bind(this));
			}
		},

		_handleAbort: function(e) {
			this.fire("data-abort", e);
		},

		_handleResponse: function(resp) {
			if (resp.response) {
				this.set("response", resp.response);
			}
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
		}
	});

})(window.Strand = window.Strand || {});
