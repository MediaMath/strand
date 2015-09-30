/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.GridItem = Polymer({
		is: 'mm-grid-item',

		properties: {
			model: {
				type: Object,
				value: null
			},
			scope: Object,
			_overridden: {
				type: Object,
				value: function () {
					return {};
				},
			},
		},

		observers: [
			"_expansionChanged(model.expanded)",
		],

		_expansionChanged: function (expanded) {
			this.toggleClass("expanded", !!expanded, this.$.carat);
		},

		ready: function () {
			var contents = Polymer.dom(this.$.columnContainer).querySelectorAll("content");
			var c = this.$.catchall;
			var nodes = Polymer.dom(c).getDistributedNodes();
			var count = nodes.length;
			var index = 0;
			var n = null;
			var field = "";

			for (index = 0; index < count; index++) {
				n = nodes[index];
				if (field = n.getAttribute("field")) {
					this.set("_overridden."+field, 0|true);
				}
			}

			if (count = contents.length) {
				for (index = 0; index < count; index++) {
					c = contents[index];
					if (Polymer.dom(c).getDistributedNodes().length) {
						this.set("_overridden."+c.id, 0|true);
					}
				}
			}
		},

		_isOverridden: function (field) {
			return this._overridden[field];
		},

		_columnContentSelector: function (field) {
			return "[field='"+field+"']";
		},

		_computeColumnValue: function(field, model, modelChange) {
			return model ? model[field] : "";
		},

		_computeColumnClass: function (align) {
			return "_mm_column " + (align || "");
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

})(window.Strand = window.Strand || {});