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

	Ajax.prototype = {

		GET:StrandLib.Request.GET,
		POST:StrandLib.Request.POST,
		PUT:StrandLib.Request.PUT,
		DELETE:StrandLib.Request.DELETE,

		queue: function(data, options, queueName) {
			var req = _requestFactory(data, options);
			_getQueue(queueName).push(req);

			return req.promise;
		},

		runQueue: function(queueName) {
			var q = _getQueue(queueName);
			var rq = new RequestQueue(q, this.options.concurrency, function(r) {
				this.recent = r;
			}.bind(this));
			rq.run();
			q.running = rq;
			return rq.promise;
		},

		exec: function(data, options) {

			var req = _requestFactory(data, options);

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
			} else if (queueName) {
				return this.requests;
			}
		},

		_requestFactory: function(data, options) {

			options = StrandLib.DataUtils.copy({}, options, this.options);

			var url = this.serializeUrl(options.url, this.urlParams);
			url = this.serializeParams(url, this.params);
			data = setRequestData(this.method, this.contentType, this.body);

			return req = new Request(StrandLib.DataUtils.copy({
				url:url,
				body:data,
			}, options));
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
			this.headers = this.headers || [];
			this.headers.push({name:name, value:value});
		},

		addParam: function(name, value) {
			this.params = this.params || [];
			this.params.push({name:name, value:value});
		},

		addUrlParam: function(param) {
			this.urlParams = this.urlParams || [];
			this.urlParams.push(param);
		},

		setRequestData: function(method, contentType, body) {
			var data;
			if (method.match(/(POST|PUT|DELETE)/i)) {
				if (contentType === "application/json") {
					data = data || body;
				} else if(contentType === "multipart/form-data") {
					if (body instanceof FormData) {
						data = data || body;
					} else {
						var fd = new FormData();
						this.serialize(body, fd.append.bind(fd));
						data = fd;
					}
				} else {
					data = this.serialize( body ).join("&");
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
