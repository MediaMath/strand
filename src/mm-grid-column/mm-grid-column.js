/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.GridColumn = Polymer({
		is: 'mm-grid-column',

		properties: {

			SORT_ICON_COLOR: {
				type: String,
				value: Colors.A2,
			},
			INFO_ICON_COLOR: {
				type: String,
				value: Colors.A4,
			},

			SORT_DEFAULT: {
				type: Number,
				value: 0,
			},
			SORT_ASCENDING: {
				type: Number,
				value: 1,
			},
			SORT_DESCENDING: {
				type: Number,
				value: -1,
			},
			SORT_EVENT: {
				type: String,
				value: "column-sort",
			},
			RESIZE_EVENT: {
				type: String,
				value: "column-resize",
			},
			RESIZE_START_EVENT: {
				type: String,
				value: "column-resize-start",
			},
			RESIZE_END_EVENT: {
				type: String,
				value: "column-resize-end",
			},

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
			resize: {
				type: Boolean,
				value: false
			},
			align: {
				type: String,
				value: "left"
			},
			width: {
				type: String,
				notify: true,
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

		_toggleSort: function() {
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
				this._toggleSort();
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
			this.set('width', this.desiredWidth + 'px');
			this.fire(this.RESIZE_END_EVENT, { field: this.field, val: this.desiredWidth - this.startWidth });
		}

	});

})(window.Strand = window.Strand || {});