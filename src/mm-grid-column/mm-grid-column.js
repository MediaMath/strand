/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt
*/
Polymer('mm-grid-column', {
	ver: "<<version>>",
	SORT_ICON_COLOR: Colors.A2,
	INFO_ICON_COLOR: Colors.A4,

	publish: {
		field: null,
		label: null,
		sortField: null,
		sortOrder: null,
		sort: false,
		info: false,
		resize: false,
		align: "left",
		width: null,
		minWidth: 75
	},

	SORT_DEFAULT: 0,
	SORT_ASCENDING: 1,
	SORT_DESCENDING: -1,
	
	SORT_EVENT: "column-sort",
	RESIZE_EVENT: "column-resize",
	RESIZE_START_EVENT: "column-resize-start",
	RESIZE_END_EVENT: "column-resize-end",

	created: function() {
		this.sortOrder = this.SORT_DEFAULT;
	},

	ready: function() {
		this.sortField = this.sortField || this.field;
		this.label = this.label || this.innerText || this.textContent;
		this.$.label.innerHTML = this.label.split("\n").join("<br/>");
		this.$.label.setAttribute("title", this.label);
	},

	attached: function() {
		if(this.sort) {
			PolymerGestures.addEventListener(this, "tap", this.onClicked);
		}
	},

	detached: function() {
		PolymerGestures.removeEventListener(this, "tap", this.onClicked);
	},

	toggleSort: function() {
		this.sortOrder = this.sortOrder === this.SORT_ASCENDING ? this.SORT_DESCENDING : this.SORT_ASCENDING;
	},

	widthChanged: function(oldVal, newVal) {
		this.style.width = newVal;
	},

	onClicked: function() {
		this.toggleSort();
		this.fire(this.SORT_EVENT, { field: this.sortField, val: this.sortOrder });
	},

	preventClick: function(e) {
		e.stopImmediatePropagation();
	},

	onTrackStart: function(e) {
		e.preventDefault();
		this.startWidth = this.offsetWidth;
		var offset = this.offsetLeft;
		this.fire(this.RESIZE_START_EVENT, { field: this.field, val: offset });
	},

	onTrack: function(e) {
		e.preventDefault();
		var width = Math.max(this.minWidth, this.startWidth + e.dx);
		this.desiredWidth = width;
		this.fire(this.RESIZE_EVENT, { field: this.field, val: width });
	},

	onTrackEnd: function(e) {
		e.preventDefault();
		e.preventTap();
		this.fire(this.RESIZE_END_EVENT, { field: this.field, val: this.desiredWidth - this.startWidth });
		this.width = this.desiredWidth + "px";
	}

});