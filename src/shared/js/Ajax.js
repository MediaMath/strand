(function (scope) {

	function _paramaterize(name, value) {
		return encodeURIComponent(name) + "=" + encodeURIComponent(value);
	}

	function _serialize(data, parent, depth, paramaterize) {

		paramaterize = paramaterize || _paramaterize;
		var obj,
			output = [];
		parent = parent || "";
		depth = depth || 0;

		for(var i in data) {
			obj = data[i];
			name = (depth === 0) ? i : "[" + i + "]";
			if (typeof obj === "object") {
				output = output.concat( _serialize(obj, parent + name, depth+1) );
			} else {
				output.push( paramaterize(parent + name, obj) );
			}
		}
		return output;
	}

	function Ajax(options) {

		this.recent = {};
		this.requests = [];
		this.options = StrandLib.DataUtils.copy({},{
			"contentType":"application/x-www-form-urlencoded",
			"method":StrandLib.Request.GET,
			"withCredentials":false,
			"timeout":10000
		}, options);
	}

	Ajax.GET = StrandLib.Request.GET;
	Ajax.POST = StrandLib.Request.POST;
	Ajax.PUT = StrandLib.Request.PUT;
	Ajax.DELETE = StrandLib.Request.DELETE;

	Ajax.prototype = {

		queue: function(data, options, queueName) {
			var req = this._requestFactory(data, options);
			this._getQueue(queueName).push(req);

			return req.promise;
		},

		execQueue: function(queueName) {
			var q = this._getQueue(queueName);
			var rq = new StrandLib.RequestQueue(q, this.options.concurrency, function(r) {
				this.recent = r;
			}.bind(this));
			rq.exec();
			q.running = rq;
			return rq.promise;
		},

		exec: function(data, options) {

			var req = this._requestFactory(data, options);

			this.requests.push(req);
			this.recent = req;
			req.exec();

			return req.promise;

		},

		_getQueue: function(queueName, init) {
			if (queueName) {
				if (this[queueName]) {
					return this[queueName];
				} else if (init) {
					this[queueName] = [];
					return this[queueName];
				}
			} else {
				return this.requests;
			}
		},

		_requestFactory: function(data, options) {

			var copy = StrandLib.DataUtils.copy;

			options = copy({}, this.options, options);

			var url = this.serializeUrl(options.url, options.urlParams);
			url = this.serializeParams(url, options.params);
			data = this.setRequestData(options.method, options.contentType, data, options.body);

			return new StrandLib.Request(copy(options, {
				url:url,
				body:data,
			}));
		},

		abort: function() {
			if (this.current) {
				this.current.abort();
			}
		},

		abortQueue: function(queueName) {
			_getQueue(queueName).running.abort();
		},

		handleProgress: function(e) {
			// this.fire("data-progress", {
			// 	percent: e.totalSize/e.position,
			// 	total: e.totalSize,
			// 	current: e.position
			// });
		},

		addHeader: function(name, value) {
			this.options.headers = this.options.headers || [];
			this.options.headers.push({name:name, value:value});
		},

		addParam: function(name, value) {
			this.options.params = this.params || [];
			this.options.params.push({name:name, value:value});
		},

		addUrlParam: function(param) {
			this.options.urlParams = this.urlParams || [];
			this.options.urlParams.push(param);
		},

		setRequestData: function(method, contentType, override, body) {
			var input;
			var data;

			if (override) {
				if (typeof override === "string") {
					return override;
				} else {
					input = StrandLib.DataUtils.copy({}, body, override);
				}
			} else {
				input = body;
			}

			//ignores for GET requests
			if (method.match(/(POST|PUT|DELETE)/i)) {
				if (contentType === "application/json") {
					data = input;
				} else if(contentType === "multipart/form-data") {
					if (input instanceof FormData) {
						data = input;
					} else {
						var fd = new FormData();
						this.serialize(input, fd.append.bind(fd));
						data = fd;
					}
				} else {
					data = this.serialize( input ).join("&");
				}
			}

			return data;
		},

		serializeUrl: function(url, urlParams) {

			url = url || "";

			if (urlParams && urlParams.length > 0) {
				if (url.slice(-1) !== "/") {
					url += "/";
				}
				url += urlParams.join("/");
			}

			return url;
		},

		serializeParams: function(url, params) {
			if (params && params.length) {
				if (url.indexOf("?") !== -1) {
					var last = url.slice(-1);
					if (last !== "&" && last !== "?") {
						url += "&";
					}
				} else {
					url += "?";
				}
				url += this.serialize(params).join("&");
			}
			return url;
		},

		serialize: function(data, paramaterize) {

			paramaterize = paramaterize || _paramaterize;
			var i, obj, output = [];
			if (typeof data === "string") {
				try {
					data = JSON.parse(data);
				} catch(e) {
					// this.fire("data-error", {error: e.message, instance: this});
				}
			}
			if ( StrandLib.DataUtils.isType(data, "array") ) {
				for (i = data.length - 1; i >= 0; i--) {
					obj = data[i];
					if (obj.name !== null && obj.value !== null) {
						output.push( paramaterize(obj.name, obj.value) );
					}
				}

			} else {
				output = _serialize(data, null, null, paramaterize);
			}

			return output;
		},

		get status() {
			return this.current && this.current.xhr.status;
		},

		get state() {
			return this.current && this.current.readyState;
		},

		get xhr() {
			return this.current && this.current.xhr;
		}
	};

	scope.Ajax = Ajax;

})(window.StrandLib = window.StrandLib || {});
