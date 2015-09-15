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
		scope: Object
	},

	_computeColumnValue: function(field, model, modelChange) {
		// var path = Path.get(field),
		// 	dataPath = Path.get("data." + field),
		// 	val = path.getValueFrom(model);

		// val = val !== undefined && val !== "" ? val : dataPath.getValueFrom(model);
		// return val;
		return model ? model[field] : "";
	},

	_computeColumnStyle: function(value) {
		return 'width: ' + value;
	},

	onItemSelected: function(e, detail, sender) {
		e.stopImmediatePropagation();
		this.fire("item-selected", this.model);
	},

	onItemExpanded: function(e, detail, sender) {
		e.stopImmediatePropagation();
		this.set("model.expanded", !this.model.expanded);
		this.async(function () {
			this.fire("item-resized", this.model.expanded);
		});
	}
});