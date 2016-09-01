/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	function arrayToMap(arr, key){
		return arr.reduce(function(map, obj) {
			map[ obj[key] ] = obj;
			return map;
		}, {});
	}

	scope.Table = Polymer({

		is: 'strand-table',

		properties: {
			data: Array,
			expandable: {
				type: Boolean,
				value: false
			},
			scope: {
				type: Object,
				notify: true,
				value: function() {
					return this;
				}
			},
			index: {
				type: Number,
				notify: true
			},
			_selectAllState: {
				type: String,
				value: 'unchecked'
			},
			sortField: {
				type: String,
				notify:true
			},
			sortOrder: {
				type: Number,
				value: 1,
				notify:true
			},
			indicate: {
				type: String,
				value: "loading  measuring",
			},
			_indications: {
				type: Object,
				value: null,
				computed: "_computeIndications(indicate)",
			},
			_loaderStyle: {
				type: String,
				computed: "_styleLoader(_indications, isLoading, _measuring)",
			},
			isLoading: {
				type: Boolean,
				value: false
			},
			_measuring: {
				type: Boolean,
			},
			selectable: {
				type: Boolean,
				value: false,
				observer: "_selectableChanged",
			},
			_columns: {
				type: Array,
				value: function() {
					return [];
				},
				notify: true,
				observer: "_columnsChanged",
			},
			_columnCount: {
				type:Number,
				value:0,
				notify:true
			},
			mutationTarget: {
				type: Object,
				value: function () {
					return this.$.columnContainer;
				},
			},
			icon: {
				type: String,
				value: null,
				notify: true
			}
		},

		behaviors: [
			StrandTraits.Falsifiable,
			StrandTraits.Resolvable,
			StrandTraits.Refable,
			StrandTraits.DomMutable,
		],

		listeners: {
			'column-resize-start': '_onColumnResizeStart',
			'column-resize': '_onColumnResize',
			'column-resize-end': '_onColumnResizeEnd',
			'column-sort': "_onColumnSort",
			'item-selected': '_onItemSelected',
			'added': '_initialize',
			'removed': '_initialize',
			'modified': '_initialize',
		},

		observers: [
			"_onSortChanged(sortField, sortOrder, _columnCount)",
		],

		attached: function() {
			this.async(this._initialize);

		},

		_initialize: function() {
			this._initializeColumns();
			this._setInitialColumnWidth();
			this._columnCount++;
		},

		_initializeColumns: function() {
			var nodes = Polymer.dom(this.$.columns).getDistributedNodes();
			if(nodes.length > 0) {
				this._columns = Array.prototype.slice.call(nodes);
				this._columnsMap = arrayToMap(this._columns, "field");
			}
		},

		_columnsChanged: function() {
			this._columnsMap = arrayToMap(this._columns, "field");
			this.notifyPath("scope._columns", this._columns);
		},

		_selectableChanged: function () {
			this.notifyPath("scope.selectable", this.selectable);
		},

		_setInitialColumnWidth: function() {
			var setInitialWidth = this._columns.every(function(column){
				return column.width === null || column.width === undefined;
			});

			if(setInitialWidth) {
				var initialWidth = 100 / this._columns.length;
				this._columns.forEach(function(column) {
					column.width = initialWidth + "%";
				});
			}
		},

		////// Selection //////
		_onItemSelected: function(e, d, sender) {
			var selected = this.selected,
				model = d,
				index = Array.isArray(this.data) ? this.data.indexOf(model) : -1,
				state = "unchecked";

			if(selected.length > 0) {
				state = "partial";
			}

			if(selected.length === this.data.length) {
				state = "checked";
			}

			if (model && index > -1) {
				this.set("data."+index+".selected", model.selected);
			}

			this._selectAllState = state;
		},

		_toggleAllSelections: function(e) {
			this.setAllSelections(e.target.checked);
		},

		setAllSelections: function (checked) {
			var value = !!checked;
			this._selectAllState = value ? "checked" : "unchecked";
			if (this.data) {
				this.data.forEach(function(item, i) {
					var path = 'data.'+i+'.selected';
					this.set(path, value);
				}, this);
			}
		},

		get selected() {
			return this.data && this.data.filter(function(item) {
				return item.selected;
			});
		},

		////// Resizing //////
		_onColumnResizeStart: function(e) {
			this._columnOffset = e.detail.val;
		},

		_onColumnResize: function(e){
			var x = this._columnOffset + e.detail.val - this.$.viewport.scrollLeft;
			this.translate3d(x + "px", 0, 0, this.$.separator);
			this._showSeparator();
		},

		_showSeparator: function() {
			this.$.separator.classList.add("visible");
			document.body.style.cursor = "col-resize";
		},

		_hideSeparator: function() {
			this.$.separator.classList.remove("visible");
			document.body.style.cursor = "";
		},

		_onColumnResizeEnd: function(e) {
			this._resizeColumns(e.detail.field, e.detail.val);
			this._hideSeparator();
		},

		_resizeColumns: function(field, val) {
			var target = this._columnsMap[field];
			var targetIndex = this._columns.indexOf(target);

			////// Overflow Resizing //////
			this._columns.forEach(function(column, index) {
				if(column.width.indexOf("%") !== -1){
					column.set('width', column.offsetWidth + 'px');
				}
				this.notifyPath("scope._columns."+index+".width", column.width);
			}, this);
		},

		////// Sorting //////
		_onSortChanged: function() {
			this.sortBy(this.sortField, this.sortOrder);
		},

		_onColumnSort: function(e) {
			this.sortField = e.detail.field;
			this.sortOrder = e.detail.val;
		},

		sortBy: function(field, order) {
			var sortOrder = arguments.length > 1 ? order : null;
			this._columns.forEach(function(column){
				column.sortOrder = column.SORT_DEFAULT;

				if (column.sortField === field) {
					if (sortOrder === column.SORT_ASCENDING ||
						sortOrder === column.SORT_DESCENDING) {
						column.sortOrder = sortOrder;
					} else if (sortOrder === null) {
						column.sortOrder = column.SORT_ASCENDING;
					}
				}
			});
		},

		_computeIndications: function () {
			var list = (this.indicate || "").split(/\s+/);

			return list.reduce(function (indications, key) {
				indications[key] = 0|true;
				return indications;
			}, {});
		},

		_styleLoader: function (_indications, isLoading, _measuring, _deferring, _initializing) {
			var show = "";
			var hide = "display: none;";
			var style = (isLoading && _indications.loading) ?
				show : (_measuring && _indications.measuring) ?
				show : (_deferring && _indications.deferring) ?
				show : (_initializing && _indications.initializing) ?
				show : hide;

			return style;
		},

		_showLoader: function (_indications, isLoading, _measuring) {
			return (isLoading && _indications.loading) || (_measuring && _indications.measuring);
		},


		////// Util //////
		createId: function(string, id) {
			return string + id;
		},

		getAllColumns: function () {
			return Array.apply(null, Polymer.dom(this).querySelectorAll("strand-grid-column"));
		},

		getColumnByField: function (field) {
			return Polymer.dom(this).querySelector("strand-grid-column[field="+field+"]") || null;
		},

		insertBeforeColumn: function (column, referenceColumn) {
			return Polymer.dom(this).insertBefore(column, referenceColumn);
		},

		removeColumn: function (column) {
			return Polymer.dom(this).removeChild(column);
		},
	});

})(window.Strand = window.Strand || {});
