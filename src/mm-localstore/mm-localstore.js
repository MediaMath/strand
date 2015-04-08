Polymer('mm-localstore', {
	ver:"<<version>>",

	publish: {
		auto: true,
		name: '',
		value: null,
		mode: "local"
	},

	modes: {
		local: localStorage,
		session: sessionStorage
	},

	ready: function() {
		if (this.auto) {
			this.load();
		}
		window.addEventListener("storage", this.handleStorage.bind(this));
	},

	sync: function() {
		if (this.value) {
			this.load();
		} else {
			this.save();
		}
	},

	save: function(value) {
		if (value) this.value = value;
		this.store.setItem(this.name, JSON.stringify(this.value));
	},

	load: function() {
		var item = this.store.getItem(this.name);
		if (item === null) {
			this.value = null;
		} else {
			try {
				this.value = JSON.parse(item);
			} catch (e) {
				this.fire("data-error", e);
				this.value = null;
			}
		}
		return this.value;
	},

	clear: function() {
		this.store.setItem(this.name, null);
	},

	hasKey: function(key) {
		return this.store.getItem(key) !== null;
	},

	get store() {
		return this.modes[this.mode];
	},

	handleStorage: function(e) {
		//update from changes to another window
		this.load();
	},

	valueChanged: function(oldValue, newValue) {
		if (this.auto) {
			this.store.setItem(this.name, JSON.stringify(this.value));
		}
	},
	
});