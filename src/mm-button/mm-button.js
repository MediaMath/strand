/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
Polymer('mm-button', {
	
	ver: "<<version>>",
	type: "primary",
	PRIMARY_ICON_COLOR: Colors.D0,
	SECONDARY_ICON_COLOR: Colors.A2,

	publish: {
		disabled: { value: false, reflect: true },
		fitparent: { value: false, reflect: true },
		layout: { value: null, reflect: true },
		error: false
	},
	
	ready: function() {
		// set layout defaults - is there an icon?
		if (this.items.length) {
			var primaryColor = (this.type !== "primary") ? this.SECONDARY_ICON_COLOR : this.PRIMARY_ICON_COLOR;
			this.items[0].setAttribute("primaryColor", primaryColor);
		}
	},

	get items() {
		var items = Array.prototype.slice.call(this.$.icon.getDistributedNodes());
		return items.filter(function(item) { return item.nodeName !== "TEMPLATE"; });
	},

});