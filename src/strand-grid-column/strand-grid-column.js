/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.GridColumn = Polymer({
		is: 'strand-grid-column',

		behaviors: [
			StrandTraits.Refable
		],

		SORT_DEFAULT: 0,
		SORT_ASCENDING: 1,
		SORT_DESCENDING: -1,
		SORT_EVENT: "column-sort",
		RESIZE_EVENT: "column-resize",
		RESIZE_START_EVENT: "column-resize-start",
		RESIZE_END_EVENT: "column-resize-end",

		properties: {
			field: {
				type: String,
				reflectToAttribute: true,
				notify: true,
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
			info: {
				type: String,
				value: null,
				notify: true,
				observer: '_infoChanged'
			},
			alignColumn: {
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
			},
			tipWidth: {
				type: Number,
				value: 150
			}
		},

		listeners: {
			'tap': '_handleTap'
		},

		ready: function() {
			this.sortField = this.sortField || this.field;
			this.label = Polymer.dom(this).innerHTML.replace(/<\/?[^>]+(>|$)/g, " ");
		},

		_toggleSort: function() {
			this.sortOrder = this.sortOrder === this.SORT_ASCENDING ? this.SORT_DESCENDING : this.SORT_ASCENDING;
		},

		_isSorted: function() {
			return this.sort && this.sortOrder !== this.SORT_DEFAULT;
		},

		_computeSortClass: function(sortOrder) {
			return sortOrder === this.SORT_ASCENDING ? 'asc' : 'des';
		},

		_computeColumnClass: function (alignColumn) {
			return "_mm_container " + (alignColumn || "");
		},

		_widthChanged: function(newVal, oldVal) {
			this.style.width = newVal;
		},

		_infoChanged: function(newVal, oldVal) {
			if (newVal) {
				this.async(function() {
					// Set up the tooltip once the dom has settled
					// Otherwise, the tip may not be able to find it's target
					var tooltip = this.$$('#infoTip');
					tooltip.target = this.findById('info');
				});
			}
		},

		_handleTap: function(e) {
			if(this.sort) {
				this._toggleSort();
				this.fire(this.SORT_EVENT, { field: this.sortField, val: this.sortOrder });
			}
		},

		_handleGrabberTap: function(e) {
			// Prevent toggling "sort" when resizing:
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