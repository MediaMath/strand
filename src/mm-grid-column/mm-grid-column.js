/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
Polymer({
	is: 'mm-grid-column',

	SORT_ICON_COLOR: Colors.A2,
	INFO_ICON_COLOR: Colors.A4,

	SORT_DEFAULT: 0,
	SORT_ASCENDING: 1,
	SORT_DESCENDING: -1,
	
	SORT_EVENT: "column-sort",
	RESIZE_EVENT: "column-resize",
	RESIZE_START_EVENT: "column-resize-start",
	RESIZE_END_EVENT: "column-resize-end",

	properties: {
		field: {
			type: String
		},
		label: {
			type: String
		},
		sortField: {
			type: String
		},
		sortOrder: {
			type: Number,
			value: function() {
				return this.SORT_DEFAULT;
			}
		},
		sort: {
			type: Boolean,
			value: false
		},
		info: {
			type: String
		},
		resize: {
			type: Boolean,
			value: true
		},
		align: {
			type: String,
			value: "left"
		},
		width: {
			type: String,
			observer: '_widthChanged'
		},
		minWidth: {
			type: Number,
			value: 75
		}
	},

	listeners: {
		'tap': '_handleTap'
	},

	ready: function() {
		this.sortField = this.sortField || this.field;
		this.label = this.label || Polymer.dom(this).innerText || Polymer.dom(this).textContent;
		this.$.label.innerHTML = this.label.split("\n").join("<br/>");
		this.$.label.setAttribute("title", this.label);
	},

	toggleSort: function() {
		this.sortOrder = this.sortOrder === this.SORT_ASCENDING ? this.SORT_DESCENDING : this.SORT_ASCENDING;
	},

	_computeSortClass: function(sortOrder) {
		return sortOrder === this.SORT_ASCENDING ? 'asc' : 'des';
	},

	_widthChanged: function(newVal, oldVal) {
		this.style.width = newVal;
	},

	_handleTap: function() {
		if(this.sort) {
			this.toggleSort();
			this.fire(this.SORT_EVENT, { field: this.sortField, val: this.sortOrder });
		}
	},

	_handleGrabberTap: function(e) {
		//Prevent toggling "sort" when resizing:
		e.preventDefault();
		e.stopImmediatePropagation();
	},

	_handleGrabberDown: function(e) {
		e.preventDefault();
		this.startWidth = this.offsetWidth;
		var offset = this.offsetLeft;
		this.fire(this.RESIZE_START_EVENT, { field: this.field, val: offset });
	},

	_handleGrabberTrack: function(e) {
		e.preventDefault();
		switch(e.detail.state) {
			case 'track':
				this._onTrack(e);
				break;
			case 'end':
				this._onTrackEnd(e);
				break;
		}
	},

	_onTrack: function(e) {
		var width = Math.max(this.minWidth, this.startWidth + e.detail.dx);
		this.desiredWidth = width;
		this.fire(this.RESIZE_EVENT, { field: this.field, val: width });
	},

	_onTrackEnd: function(e) {
		this.fire(this.RESIZE_END_EVENT, { field: this.field, val: this.desiredWidth - this.startWidth });
		this.width = this.desiredWidth + "px";
	}

});