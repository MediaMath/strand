/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
Polymer('mm-drawer', {
	publish: {
		expanded: false,
		closedHeight: 0,
		openedHeight: 0,
		forceMeasure: false,
		label: ""
	},

	ready: function() {
		if(!this.expanded) {
			this.height = this.closedHeight;
		}
	},

	getContentHeight: function() {
		if(!this.openedHeight || this.forceMeasure) {
			this.openedHeight = this.$.content.offsetHeight;
		}
		return this.openedHeight;
	},

	expandedChanged: function(){
		if(this.expanded) {
			this.open();
		} else {
			this.close();
		}
	},

	open: function() {
		this.height = this.getContentHeight();
		this.expanded = true;
	},
	
	close: function() {
		this.height = this.closedHeight;
		this.expanded = false;
	},
	
	toggle: function() {
		this.expanded = !this.expanded;
	}
});
