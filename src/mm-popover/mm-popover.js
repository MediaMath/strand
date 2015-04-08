Polymer('mm-popover', {
	ver:"<<version>>",
	STATE_OPENED: "opened",
	STATE_CLOSED: "closed",
	MODE_DEFAULT: "default",
	MODE_MULTISELECT: "multiselect",
	publish: {
		target: { value: null, reflect:true },
		valign: { value: "bottom", reflect: true },
		align: { value: "center", reflect: true },
		state:'closed',
		mode: 'default'
	},

	attached: function() {
		if (!this.target) {
			this.target = this.parentNode;
		}
	},

	open: function(e) {
		this.state = this.STATE_OPENED;
	},

	close: function(e) {
		this.state = this.STATE_CLOSED;
	},

	stateChanged: function(oldVal, newValue) {
		if (oldVal === this.STATE_OPENED && newValue === this.STATE_CLOSED){
			this.fire('closed');
		}else if(newValue === this.STATE_OPENED){
			this.fire("opened");
		}
	},

	targetChanged: function(oldValue, newValue) {
		if (typeof newValue !== 'object') {
			this.$.closePanel.target = document.querySelector(newValue);
		} else {
			this.$.closePanel.target = newValue;
		}
	},

	modeChanged: function(oldVal, newVal) {
		// console.log("modeChanged :: newVal: ", newVal);
	},

	toggle: function(e) {
		this.$.closePanel.toggle();
	},

	closeFilter: function(instance, e) {
		function contains(rect, x, y) {
			return rect.left < x && rect.right > x && rect.top < y && rect.bottom > y;
		}

		//Use close panel to calculate bounding
		var rect = Measure(this.$.closePanel, this).getBoundingClientRect(),
			targetRect = Measure(this.$.closePanel.target, this).getBoundingClientRect();
			bounding = contains(rect, e.clientX, e.clientY) || contains(targetRect, e.clientX, e.clientY);

		if (bounding) {
			e.stopImmediatePropagation();
		} else {
			instance.closeHandler();
		}
	},
});