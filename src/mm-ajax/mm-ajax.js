/*jshint -W030 */
(function () {

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
				output = output.concat( _serialize(obj, name, depth+1) );
			} else {
				output.push( paramaterize(parent + name, obj) );
			}
		}
		return output;
	}

	Polymer('mm-ajax', {
		ver:"<<version>>",

		GET: "GET",
		POST: "POST",
		PUT: "PUT",
		DELETE: "DELETE",

		publish: {
			contentType: 'application/x-www-form-urlencoded',
			method: "GET",
			auto: false,
			debug: false,
			body: null,
			withCredentials: false,
			timeout: 10000
		},

		created: function() {
			this.reset();
		},

		ready: function() {
			if (this.auto && this.url && this.method) {
				this.exec();
			}
		},

		reset: function() {
			this._xhr = new XMLHttpRequest();
			this.promise = pinkySwear();
			this.headers = [];
			this.params = [];
			this.urlParams = [];
		},

		exec: function() {
			var data,
				fd,
				message,
				url = this.url;

			if (!this.method || !url) {
				message = "url and method are required!!";
				this.fire("data-error", {message:message});
				this.promise(false, [this, this.promise, message]);
				return this.promise;
			}

			if (this.urlParams && this.urlParams.length > 0) {
				if (url.slice(-1) === "/") {
					url += this.serializeUrl(this.urlParams);
				} else {
					url += "/" + this.serializeUrl(this.urlParams);
				}
			}

			if (this.method.match(/(POST|PUT|DELETE)/i)) {
				if (this.contentType === "application/json") {
					data = this.body;
				} else if(this.contentType === "multipart/form-data") {
					if (this.body instanceof FormData) {
						data = this.body;
					} else {
						//TODO: expose this outside of body
						fd = new FormData();
						if (this.body instanceof FormData) {
							data = this.body;
						} else {
							this.serialize(this.body, fd.append);
							data = fd;
						}
					}
				} else {
					data = this.serialize( this.body ).join("&");
				}
			} 

			if (this.params && this.params.length) {
				if (url.indexOf("?") !== -1) {
					var last = url.slice(-1);
					if (last !== "&") {
						url += "&";
					}
				} else {
					url += "?";
				}
				url += this.serialize(this.params).join("&");
			}

			//open(DOMString method, DOMString url, optional boolean async, optional DOMString? user, optional DOMString? password);
			this.xhr.open(this.method, url, true, this.username, this.password);

			this.xhr.timeout = this.timeout || 10000;
			this.xhr.withCredentials = this.withCredentials;
			this.xhr.onreadystatechange = this.readyStateChange.bind(this);
			this.xhr.addEventListener("abort", this.handleAbort.bind(this));
			this.xhr.addEventListener("progress", this.handleProgress.bind(this));

			this.contentType && this.addHeader("content-type",this.contentType);

			this.headers && this.headers.forEach(function(header) { 
				this.xhr.setRequestHeader(header.name, header.value); 
			}.bind(this));

			this.xhr.send(data);

			return this.promise;

		},
		
		abort: function() {
			if (this.xhr) {
				this.xhr.abort();
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

		serializeUrl: function(array) {
			return array.join("/");
		},

		serialize: function(data, paramaterize) {

			paramaterize = paramaterize || _paramaterize;
			var i, obj, output = [];
			if (typeof data === "string") {
				try {
					data = JSON.parse(data);
				} catch(e) {
					this.fire("data-error", {error: e.message, instance: this});
				}
			}
			if ( DataUtils.isType(data, "array") ) {
				for (i = data.length - 1; i >= 0; i--) {
					obj = data[i];
					if (obj.name !== null && obj.value !== null) {
						output.push( paramaterize(obj.name, obj.value) );
					}
				}

			} else {
				output = _serialize(data, null);
			}
			
			return output;
		},

		readyStateChange: function() {
			var result = {};
			if (this.xhr.readyState === 4) {
				this.fire("data-result");
				this.response = this.responseHandler[this.responseType || 'json'].call(this);
				if (!this.xhr.status || (this.xhr.status >= 200 && this.xhr.status < 300)) {
					result = {response: this.response, instance: this};
					this.fire("data-ready", result);
					if (this.promise) {
						this.promise(true, [this, this.promise, result]);
					}
				} else {
					result = {error: this.xhr.status, instance: this, response: this.response};
					this.fire("data-error", result);
					if (this.promise) {
						this.promise(false, [this, this.promise, result]);
					}
				}
			}
		},

		responseHandler: {

			xml: function() {
				return this.xhr.responseXML;
			},

			text: function() {
			return this.xhr.responseText;
			},

			json: function() {
				var response = this.xhr.responseText;
				try {
					return JSON.parse(response);
				} catch (e) {
					this.fire("data-error", {error: e.message, instance: this});
					return response;
				}
			},

			document: function() {
				return this.xhr.response;
			},

			blob: function() {
				return this.xhr.response;
			},

			arrayBuffer: function() {
				return this.xhr.response;
			},

		},

		get status() {
			return this.xhr && this.xhr.status;
		},

		get state() {
			return this.xhr && this.xhr.readyState;
		},

		get xhr() {
			return this._xhr;
		}
	});

})(); 