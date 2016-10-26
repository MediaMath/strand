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
				notify:true,
				observer:'_indexChanged'
			},
			views:{
				type:Array,
				value: function() {
					return [];
				},
				notify:true,
				observer:'_viewsChanged'
			}
		},

		listeners:{
			'dom-change':'_domChanged'
		},

		_indexChanged: function(index, old) {
			this.set('views.'+old+".selected",false);
			this.set('views.'+index+".selected",true);
		},

		_viewsChanged: function() {
			var sel = this.views.some(function(v) {
				return v.selected;
			});
			if (!sel) {
				this.set('views.0.selected',true);
			}
		},

		_domChanged: function(e) {
			if (e.target && e.target.id.indexOf('view-') !== -1) {
				this.async(function() {
					this.fire('selected', {index:this.index});
				});
			}
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
				this.index = num;
			}
		}

	});

})(window.Strand = window.Strand || {});
