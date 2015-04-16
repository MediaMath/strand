/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt
*/
/* test.js */
Polymer('mm-icon', {
	
	ver:"<<version>>",

	publish: {
		type: { value:"plus", reflect:true },
		width:28,
		height:28,
		primaryColor: Colors.A2,
		hoverColor: null,
		uid: null
	},

	iconStyle: {},

	observe: { "width height type width height" : "updateStyleJob" },

	ready: function() {
		// this was added to allow hover color/state, 
		// while still supporting the established api:
		this.uid = this.createId();
	},

	attached: function() {
		this.updateStyleJob();
	},

	updateStyleJob: function() {
		this.job("style", this.updateStyle, 0);
	},

	updateStyle: function() {
		this.iconStyle = {
			minWidth: this.width + "px",
			minHeight: this.height + "px", 
			lineHeight: this.height + "px",
			fontSize: this.height + "px"
		};
	},

	createId: function() {
		var timestamp = new Date().valueOf(),
			rndNum	= Math.floor((Math.random()*99)+1),
			id = 'id_' + rndNum + '_' + timestamp;
		return id;
	}
});