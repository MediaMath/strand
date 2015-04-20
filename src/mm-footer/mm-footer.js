/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
Polymer('mm-footer', {
	ver:"<<version>>",
	publish: {
		message: "",
		type: "info"
	},

	messageChanged: function(oldVal, newVal) {
		// console.log("messageChanged: " + newVal);
	},

	typeChanged: function(oldVal, newVal) {
		// console.log("typeChanged: " + newVal);
	},

	showMessage: function() {
		this.$.messageBox.style.display = "block";
	},

	hideMessage: function() {
		this.$.messageBox.style.display = "none";
	}
});