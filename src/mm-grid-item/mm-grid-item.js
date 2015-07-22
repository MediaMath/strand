/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
Polymer({
	is: 'mm-grid-item',

	properties: {
		model: Object,
		scope: Object
	},

	observers: [
		'_columnsChanged(scope.columns.*)',
		'_modelChanged(model.*)'
	],

	_computePathValue: function(model, field) {
		// var path = Path.get(field),
		// 	dataPath = Path.get("data." + field),
		// 	val = path.getValueFrom(model);

		// val = val !== undefined && val !== "" ? val : dataPath.getValueFrom(model);
		// return val;
		return model[field];
	},

	_computeColumnStyle: function(width) {
		return 'width: ' + width;
	},

	_columnsChanged: function(changeRecord) {
		// console.log(changeRecord);
	},

	_modelChanged: function(changeRecord) {
		console.log("modelChanged", changeRecord);
	},

	onItemSelected: function(e, detail, sender) {
		e.stopImmediatePropagation();
		this.fire("item-selected", this.model);
	},

	onItemExpanded: function(e, detail, sender) {
		e.stopImmediatePropagation();
		this.model.expanded = !this.model.expanded;
		this.asyncFire("item-resized", this.model.expanded);
	}
});