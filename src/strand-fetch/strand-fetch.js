/**
 * @license
 * Copyright (c) 2016 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.Fetch = Polymer({
		is: "strand-fetch",

		behaviors: [
			StrandTraits.Refable,
			StrandTraits.DomGettable,
			StrandTraits.Falsifiable
		],

		properties: {
			url:{
				type:String,
				notify:true
			},
			auto:{
				type:Boolean,
				value:true
			},
			//see https://developer.mozilla.org/en-US/docs/Web/API/GlobalFetch/fetch
			fetchOptions:{
				type:Object,
				value: function() {
					return {
						mode:'same-origin',
						credentials:'same-origin',
						redirect:'follow'
					};
				}
			},
			data: {
				type:Object,
				notify:true
			},
			body:{
				type:String,
				observer:'_bodyChanged'
			}
		},

		domObjectChanged: function(domObject) {
			if (this.auto) {
				this.url = domObject.url[0].inner;
				this.debounce('action', this.get, 200);
			}
		},

		_bodyChanged: function() {
			if (this.auto) {
				this.url = domObject.url[0].inner;
				this.debounce('action', this.post, 200);
			}
		},

		_responseHandler: function(response) {
			this.fire('fetch-success', response);
			response.json().then(function(data) {
				this.fire('fetch-data', data);
				this.set('data', data);
			}.bind(this), function(err) {
				this.fire('fetch-parse-error', err);
			}.bind(this));
		},

		_errorHandler: function(response) {
			this.fire('fetch-error', response);
		},

		fetch: function(url, method, opts) {
			var m = {method:method || 'GET'};
			if (this.body) m.body = this.body;
			return fetch(url || this.url, Object.assign(m, opts, this.fetchOptions))
				.then(this._responseHandler.bind(this), this._errorHandler.bind(this));
		},

		get: function(url, opts) {
			return this.fetch(url, 'GET', opts);
		},

		post: function(url, opts) {
			return this.fetch(url, 'POST', opts);
		},

		put: function(url, opts) {
			return this.fetch(url, 'PUT', opts);
		},

		delete: function(url, opts) {
			return this.fetch(url, 'DELETE', opts);
		}

	});

})(window.Strand = window.Strand || {});
