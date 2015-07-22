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

	_computePathValue: function(model, field) {
		// var path = Path.get(field),
		// 	dataPath = Path.get("data." + field),
		// 	val = path.getValueFrom(model);

		// val = val !== undefined && val !== "" ? val : dataPath.getValueFrom(model);
		// return val;
		return model[field];
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