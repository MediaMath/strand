/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.Tabs = Polymer({
		is: "mm-tabs",

		behaviors: [
			StrandTraits.Stylable
		],

		listeners: {
			'tabBar.tap': '_handleTap'
		},

		properties: {
			inner: Boolean,
			tabBarOffset: {
				type: Number,
				value: 20
			},
			tabBarPosition: {
				type: String,
				value: 'top',
			},
			tabs: {
				type: Array,
				value: [],
			}
		},

		attached: function() {
			this.async(function() {
				this.tabs = this._collectTabs();
				if (this.tabs.length > 0) {
					var defaultTab = this.querySelector('mm-tab[active]') || this.tabs[0];
					this.tabs.map(function(t) { t.active = false; });
					this.$.selector.select(defaultTab);
					this.$.selector.selected.active = true;
				}
			});
		},

		_tabIsActive: function(a) {
			return a ? 'active' : '';
		},

		_handleTap: function(e) {
			var tabItem = this.$.tabs.itemForElement(e.target);
			if(tabItem) {
				this.$.selector.selected.active = false;
				this.classFollows('active', e.target.closest('li'), this.$$('.active'));
				this.$.selector.select(tabItem);
				this.$.selector.selected.active = true;
			}
		},

		_updateStyle: function(pos,offset) {
			return this.styleBlock({
				paddingTop: (pos === 'left') ? offset+'px' : '',
				paddingLeft: (pos === 'left') ? '' : offset+'px'
			});
		},

		_collectTabs: function() {
			return Polymer.dom(this).childNodes
				.filter(function(el) { return el.localName === 'mm-tab' });
		},

	});
	
})(window.Strand = window.Strand || {});