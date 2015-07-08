(function (scope) {

	function RequestQueue(requests, concurrency) {
		if (!requests) throw(new Error("request array is required"));

		this.work = requests.slice();
		this.results = [];
		this.failures = [];
		this.concurrency = concurrency;
		this.promise = new Zousan();

	}

	RequestQueue.prototype = {
		next: function(res) {
			if (res) {
				this.results = this.results.concat(res);
			}
			var chunk = this.work.splice(0,this.concurrency).map(function(req) {
				return req.exec();
			});

			if (chunk && chunk.length > 0) {
				var all = Zousan.all(chunk);
				all.then(this.next.bind(this), this.fail.bind(this));
			} else {
				this.promise.resolve(this.results);
			}
		},
		fail: function(val) {
			this.promise.reject(val);
			this.failures.push(val);
		},
		exec: function() {
			this.next();
		}
	};

	scope.RequestQueue = RequestQueue;

})(window.StrandLib = window.StrandLib || {}); 