/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
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