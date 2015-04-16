/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt
*/
Polymer('mm-pulldown-button', {
	
	ver:"<<version>>",
	state: 'closed',	// valid values: closed, opened
	overflow: 'hidden', // button width takes precedence by label
	STATE_OPENED: "opened",
	STATE_CLOSED: "closed",
	PRIMARY_ICON_COLOR: Colors.D0,
	SECONDARY_ICON_COLOR: Colors.A2,

	publish: {
		disabled: { value: false, reflect: true },
		fitparent: { value: false, reflect: true },
		error: false
	},
	
	domReady: function() {
		// set icon layout default - is there an icon?
		var iconColor = (this.type !== "primary") ? this.SECONDARY_ICON_COLOR : this.PRIMARY_ICON_COLOR;

		if (this.icon.length) {
			this.icon[0].primaryColor = iconColor;
		}

		this.$.caratIcon.primaryColor = iconColor;
		this.async(this.btnWidthChanged);
	},

	attached: function() {
		WindowNotifier.addInstance(this);
	},

	detached: function() {
		WindowNotifier.removeInstance(this);
	},

	resize: function() {
		this.job("resize", this.btnWidthChanged, 0);
	},

	btnWidthChanged: function() {
		if (this.overflow === "visible") {
			this.$.closePanel.style.width = "auto";
			this.$.closePanel.style.minWidth = this.btnWidth + "px";
		} else {
			this.$.closePanel.style.width = this.btnWidth + "px";
		}
	},

	get btnWidth() {
		if (this.$)
		return parseFloat(getComputedStyle(this.$.buttonMain).width);
	},

	get icon() {
		var icon = Array.prototype.slice.call(this.$.icon.getDistributedNodes());
		return icon.filter(function(item) { return item.nodeName !== "TEMPLATE"; });
	},

	open: function(e) {
		this.state = this.STATE_OPENED;
	},

	close: function(e) {
		this.state = this.STATE_CLOSED;
	},

	toggle: function(e) {
		if (this.state === this.STATE_OPENED) {
			this.state = this.STATE_CLOSED;
		} else {
			this.state = this.STATE_OPENED;
		}
	},

	closeFilter: function(instance, event) {
		if (event.target === this || event.target === this.$.buttonMain) {
			event.preventDefault();
		} else {
			instance.fire('close');
		}
	}
});