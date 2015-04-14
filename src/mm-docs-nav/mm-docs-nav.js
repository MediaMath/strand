Polymer('mm-docs-nav', {
	ver:"<<version>>",

	publish: {
		expanded: { value: false, reflect: true }
	},

	labelTap: function(e) {
		e.preventDefault();
		this.expanded = !this.expanded;
	},

	listTap: function(e) {
		e.preventDefault();
		this.fire("docs-nav-selected", { target: e.target, value: e.target.value });
	},

	expandedChanged: function(oldVal, newVal) {
		if (newVal === true) {
			this.$.expandArea.style.height = this.$.expandArea.scrollHeight + "px";
		} else {
			this.$.expandArea.style.height = "0px";
		}
	}

});