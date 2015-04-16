/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt
*/
/* mm-modal.js */
Polymer('mm-modal', {
	
	ver:"<<version>>",

	publish: {
		visible: false,
		dismiss: true,
		noscroll: false,
		width: 600
	},

	visibleChanged: function() {
		this.hidden = !this.visible;
	},
	
	show: function() {
		this.visible = true;

		if(this.noscroll) {
			document.body.style.overflow = "hidden";
		}
	},

	hide: function(e) {
		if (!e || this.dismiss && e.target === this.$.blocker || e.target === this.$.close) {
			// only dismiss the modal if this action is permitted:
			this.visible = false;
			document.body.style.overflow = "";
		}
	}
});