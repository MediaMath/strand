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
			contentType:{
				type:String,
				value: 'application/x-www-form-urlencoded',
				observer:"_updateAjax"
			},
			method: {
				type:String,
				value: "GET",
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
			}
		},

		ready: function() {
			if (this.auto && this.url && this.method) {
				this.ajax.exec();
			}
		},

		_updateAjax: function() {
			//TODO(dlasky): expose binds for additional prefs
			this.ajax.options = DataUtils.copy(this.ajax.options, {
				contentType:this.contentType,
				method:this.method,
				body:this.body,
				withCredentials:this.withCredentials,
				timeout:this.timeout
			});
		},

		_validateAjax: function() {
			if (!this.method) return false;
			if (this.method === StrandLib.Ajax.GET) {
				if (this.url) return true;
			} else {
				if (this.url && this.body) return true;
			}
			return false;
		},

		abort: function() {
			this.ajax.abort();
			if (this.ajax.current) {
				this.ajax.current.promise.then(handleAbort, handleAbort);
			}
		},

		handleAbort: function(e) {
			this.fire("data-abort");
			if (this.promise) {
				this.promise(false, [this, this.promise, 'aborted']);
			}
		},

		handleProgress: function(e) {
			this.fire("data-progress", {
				percent: e.totalSize/e.position,
				total: e.totalSize,
				current: e.position
			});
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
