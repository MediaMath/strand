/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt
*/
Polymer('mm-grid-item', {
	ver:"<<version>>",
	publish: {
		model: null,
		scope: null
	},

	getPathValue: function(item) {
		var path = Path.get(item.field),
			dataPath = Path.get("data." + item.field),
			val = path.getValueFrom(item.model);

		val = val !== undefined && val !== "" ? val : dataPath.getValueFrom(item.model);
		return val;
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