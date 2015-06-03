/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
Polymer('mm-footer', {
	ver:"<<version>>",
	publish: {
		message: null,
		type: "info",
		messageVisible: false
	},

	showMessage: function() {
		this.messageVisible = true;
	},

	hideMessage: function() {
		this.messageVisible = false;
	}

});
