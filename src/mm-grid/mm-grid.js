/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function() {
	// Hack for grid flickering issue:
	// window.addEventListener("mousewheel", function(){});

	function arrayToMap(arr, key){
		return arr.reduce(function(map, obj) {
			map[ obj[key] ] = obj;
			return map;
		}, {});
	}

	Polymer({

		is: 'mm-grid',

		properties: {
			gpu: {
				type: String,
				value: "2d",
			},
			data: Array,
			columns: {
				type: Array,
				value: function() {
					return [];
				},
				notify: true,
			},
			scope: {
				type: Object,
				notify: true,
				value: function() {
					return this;
				}
			},
			index: Number,
			itemTemplate: String,
			itemTemplateElement: Object,
			viewportWidth: Number,
			_selectAllState: {
				type: String,
				value: 'unchecked'
			},
			selectable: {
				type: Boolean,
				value: false
			},
			expandable: {
				type: Boolean,
				value: false
			},
			sortField: String,
			sortOrder: {
				type: Number,
				value: 1
			},
			isLoading: {
				type: Boolean,
				value: false
			},
			expanded: {
				type: Boolean,
				value: false,
			}
		},

		listeners: {
			'column-resize-start': 'onColumnResizeStart',
			'column-resize': 'onColumnResize',
			'column-resize-end': 'onColumnResizeEnd',
			'item-selected': 'onItemSelected'
		},

		observers: [
			"_expansionChanged(expanded)",
		],

		_expansionChanged: function (expanded) {
			this.toggleClass("expanded", !!expanded, this.$.carat);
		},

		attached: function() {
			if(this.itemTemplate && typeof this.itemTemplate === "string") {
				this.itemTemplateElement = this.querySelector("#" + this.itemTemplate);
			}

			this.itemTemplateElement = this.itemTemplateElement || this.$.defaultTemplate;

			this.async(this.initialize);
		},

		initialize: function() {
			// this.$.list.style.paddingTop = this.$.header.offsetHeight + "px";
			this.initializeColumns();
			this.setInitialColumnWidth();
		},

		initializeColumns: function() {
			var nodes = Polymer.dom(this.$.columns).getDistributedNodes();
			if(nodes.length > 0) {
				this.columnsExist = true;
				this.columns = Array.prototype.slice.call(nodes);
				this.columnsMap = arrayToMap(this.columns, "field");

				// var item = this.itemTemplate.createInstance(this);
				// this.columnOverrideMap = this.columns.reduce(function(map, column){
				// 	map[column.field] = item.querySelector('[field="' + column.field + '"]') !== null;
				// 	return map;
				// }, {});
			}
		},
		
		columnsChanged: function() {
			this.columnsMap = arrayToMap(this.columns, "field");
		},

		setInitialColumnWidth: function() {
			var setInitialWidth = this.columns.every(function(column){
				return column.width === null || column.width === undefined;
			});

			if(setInitialWidth) {
				var initialWidth = 100 / this.columns.length;
				this.columns.forEach(function(column) {
					column.width = initialWidth + "%";
				});
			}
		},

		////// Selection //////
		onItemSelected: function(e, d, sender) {
			var selected = this.selected,
				state = "unchecked";

			if(selected.length > 0) {
				state = "partial";
			}

			if(selected.length === this.data.length) {
				state = "checked";
			}

			this._selectAllState = state;
		},

		selectAll: function(e) {
			var checked = e.target.checked;
			this.data.forEach(function(item, i) {
				this.set('data.'+i+'.selected', checked)
			}, this);
		},

		get selected() {
			return this.data && this.data.filter(function(item) {
				return item.selected;
			});
		},

		////// Resizing //////
		onColumnResizeStart: function(e) {
			this._columnOffset = e.detail.val;
		},

		onColumnResize: function(e){
			var x = this._columnOffset + e.detail.val - this.$.viewport.scrollLeft;
			this.translate3d(x + "px", 0, 0, this.$.separator);
			this.showSeparator();
		},

		showSeparator: function() {
			this.$.separator.classList.add("visible");
			document.body.style.cursor = "col-resize";
		},

		hideSeparator: function() {
			this.$.separator.classList.remove("visible");
			document.body.style.cursor = "";
		},

		onColumnResizeEnd: function(e) {
			this.resizeColumns(e.detail.field, e.detail.val);
			this.hideSeparator();
		},

		resizeColumns: function(field, val) {
			var target = this.columnsMap[field];
			var targetIndex = this.columns.indexOf(target);

			////// Overflow Resizing //////
			this.columns.forEach(function(column, index) {
				if(column.width.indexOf("%") !== -1){
					// column.width = column.offsetWidth + "px";
					column.set('width', column.offsetWidth + 'px');
				}
				this.notifyPath("scope.columns."+index+".width", column.width);
			}, this);

			if (!this.viewportWidth) {
				this.viewportWidth = this.$.header.offsetWidth;
			}

			this.viewportWidth += val;
		},

		_computeViewportWidth: function (viewportWidth) {
			var value = viewportWidth ? viewportWidth + 'px' : '100%';
			return 'width: ' + value;
		},

		////// Sorting //////
		onSortChanged: function() {
			this.sortBy(this.sortField, this.sortOrder);
		},

		onColumnSort: function(e) {
			this.sortField = e.detail.field;
			this.sortOrder = e.detail.val;
		},

		sortBy: function(field, order) {
			this.columns.forEach(function(column){
				if(column.sortField === field){
					column.sortOrder = order || column.SORT_ASCENDING;
				} else {
					column.sortOrder = column.SORT_DEFAULT;
				}
			});
		},

		////// Toggle //////
		expandAll: function(e, d, sender) {
			this.set("expanded", !this.expanded);
			this.$.viewport.inferOffviewHeightsAfterNextMutation();
			this.data.forEach(function(item, index) {
				this.set("data." + index + ".expanded", this.expanded);
			}.bind(this));
		},

		requestInitialization: function () {
			return this.$.viewport.initialize();
		},
	});
})();