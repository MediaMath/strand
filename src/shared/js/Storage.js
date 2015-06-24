(function (scope) {
	
	function Storage(key, mode) {
		this.mode = mode;
		this.key = key;
	}

	Storage.prototype = {

		save: function(value) {
			this.value = value;
		},

		load:function() {
			return this.value;
		},

		hasKey: function(key) {
			return this.store.getItem(key) !== null;
		},

		clear: function() {
			this.value = null;
		},

		clearAll: function() {
			this.storage.clear();
		},

		destroy: function() {
			window.removeEventListener("storage", this.handleStorage);
			delete this.mode;
			delete this.key;
		},

		get value() {
			var item = this.store.getItem(this.key);
			if (item === null) {
				return null;
			} else {
				try {
					return JSON.parse(item);
				} catch (e) {
					return item;
				}
			}
			return item;
		},

		set value(input) {
			this.store.setItem(this.key, JSON.stringify(input));
		},

		get store() {
			return this.mode === "session" ? sessionStorage : localStorage;
		},
	};

	scope.Storage = Storage;
})(window.StrandLib = window.StrandLib || {}); 