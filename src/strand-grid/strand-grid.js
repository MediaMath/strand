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

	scope.Grid = Polymer({

		is: 'strand-grid',

		properties: {
			gpu: {
				type: String,
				value: "2d",
			},
			controller: Object,
			data: Array,
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
				value: "loading measuring",
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
			expanded: {
				type: Boolean,
				value: false,
			},
			selectable: {
				type: Boolean,
				value: false,
				observer: "_selectableChanged",
			},
			expandable: {
				type: Boolean,
				value: false,
				observer: "_expandableChanged",
			},
			_columns: {
				type: Array,
				value: function() {
					return [];
				},
				notify: true,
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
				type:String,
				value:null,
				notify: true
			},
			noResultsMessage: {
				type: String,
				value: null
			},
			_noResults: {
				type: Boolean,
				value: false
			}
		},

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.MixinFindable,
			StrandTraits.TemplateFindable,
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
			"_expansionChanged(expanded)",
			"_onSortChanged(sortField, sortOrder, _columnCount)",
		],

		_expansionChanged: function (expanded) {
			this.toggleClass("expanded", !!expanded, this.$.carat);
		},

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
			this._columns = Array.prototype.slice.call(nodes).map(function (node) {
				return {
					node: node,
				};
			});
			this.notifyPath("scope._columns");
		},

		_selectableChanged: function () {
			this.notifyPath("scope.selectable", this.selectable);
		},

		_expandableChanged: function () {
			this.notifyPath("scope.expandable", this.expandable);
		},

		_setInitialColumnWidth: function() {
			var setInitialWidth = this._columns.every(function(column){
				return column.node.width === null || column.node.width === undefined;
			});

			if(setInitialWidth) {
				var initialWidth = 100 / this._columns.length;
				this._columns.forEach(function(column, index) {
					column.node.width = initialWidth + "%";
					this.set("_columns."+index+".node.width", column.node.width);
				}, this);
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
			this.fire('select-all', {selected:value});
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
			var x = this._columnOffset + e.detail.val - this.$.viewport.getPaneScrollLeft();
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
			////// Overflow Resizing //////
			this._columns.map(function(column, index) {
				var width = column.node.width;
				if (!width) {
					width = column.node.minWidth;
				}

				if(width.indexOf("%") !== -1){
					width = column.node.offsetWidth + 'px';
				}
				return width;
			}, this).forEach(function (width, index) {
				var column = this._columns[index];
				column.node.set("width", width);
				this.notifyPath("scope._columns."+index+".node.width", width);
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
				column.node.sortOrder = column.node.SORT_DEFAULT;

				if (column.node.sortField === field) {
					if (sortOrder === column.node.SORT_ASCENDING ||
						sortOrder === column.node.SORT_DESCENDING) {
						column.node.sortOrder = sortOrder;
					} else if (sortOrder === null) {
						column.node.sortOrder = column.node.SORT_ASCENDING;
					}
				}
			});
		},

		////// Toggle //////
		_toggleAllExpansions: function(e, d, sender) {
			this.setAllExpansions(!this.expanded);
		},

		setAllExpansions: function (expanded) {
			var value = !!expanded;
			this.set("expanded", value);
			this.$.viewport.inferOffviewHeightsAfterNextMutation();
			if (this.data) {
				this.data.forEach(function(item, index) {
					this.set("data." + index + ".expanded", this.expanded);
				}, this);
			}
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

		requestInitialization: function () {
			return this.$.viewport.initialize();
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

		_showNoResults: function(noResultsMessage, data) {
			if (noResultsMessage) {
				return !data || data && !data.length;
			} else {
				return false;
			}
		}
	});

})(window.Strand = window.Strand || {});