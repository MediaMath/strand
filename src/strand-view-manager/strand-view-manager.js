/**
 * @license
 * Copyright (c) 2016 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.ViewManager = Polymer({
		is: "strand-view-manager",

		behaviors: [
			StrandTraits.Refable
		],

		properties: {

			index: {
				type:Number,
				value: 0,
				notify:true
			},
			views:{
				type:Array,
				value: function() {
					return [];
				},
				notify:true
			}
		},

		listeners:{
			'dom-change':'_domChanged'
		},

		_domChanged: function(e) {
			var idx = this.index;
			var name = this.get('views.' + idx + '.name');
			if (e.target && e.target.id === 'view-'+ name) {
				this.async(function() {
					this.fire('selected', {index:idx});
				});
			}
		},

		_getSelected: function(idx, index) {
			return idx === index;
		},

		_getValue: function(name) {
			return this.get(name);
		},

		_getSelector: function(item, splices) {
			return item.selector || '.' + item.name;
		},

		switchView: function(numOrString) {
			if (typeof numOrString === 'string') {
				this.index = this.views.map(function(v) { return v.name; }).indexOf(numOrString);
			} else if (typeof numOrString === 'number') {
				this.index = numOrString;
			}
		}

	});

})(window.Strand = window.Strand || {});
