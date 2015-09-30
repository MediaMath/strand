/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
Polymer({
	is: 'mm-grid-item',

	properties: {
		model: {
			type: Object,
			value: null
		},
		scope: Object,
		_columns: Object,
	},

	observers: [
		"_expansionChanged(model.expanded)",
	],

	_expansionChanged: function (expanded) {
		this.toggleClass("expanded", !!expanded, this.$.carat);
	},

	_columnsFromScope: function () {
		return this._columns = this.scope.getColumns(this._columns || null);
	},

	_computeColumnValue: function(field, model, modelChange) {
		return model ? model[field] : "";
	},

	_computeColumnStyle: function(value) {
		return 'width: ' + value;
	},

	_onItemSelected: function(e, detail, sender) {
		e.stopImmediatePropagation();
		this.fire("item-selected", this.model);
	},

	_onItemExpanded: function(e, detail, sender) {
		e.stopImmediatePropagation();
		this.set("model.expanded", !this.model.expanded);
		this.async(function () {
			this.fire("item-resized", this.model.expanded);
		});
	}
});