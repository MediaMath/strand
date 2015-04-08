Polymer('mm-action', {
	ver:"<<version>>",
	PRIMARY_ICON_COLOR: Colors.D0,

	publish: {
		underline: false
	},

	ready: function() {
		// set layout defaults - is there an icon?
		if (this.items.length) {
			this.items[0].setAttribute("primaryColor", this.PRIMARY_ICON_COLOR);
		}
	},

	get items() {
		var items = Array.prototype.slice.call(this.$.icon.getDistributedNodes());
		return items.filter(function(item) { return item.nodeName !== "TEMPLATE"; });
	}

});