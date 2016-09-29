/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.Tabs = Polymer({
		is: "strand-tabs",

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Selectable,
			StrandTraits.Stylable,
			StrandTraits.Refable
		],

		properties: {
			_filterElementType: {
				type: String,
				value: "strand-tab"
			},
			inner: {
				type: Boolean,
				value: false,
			},
			tabBarOffset: {
				type: Number,
				value: 20
			},
			tabBarPosition: {
				type: String,
				value: 'top',
			},
			_tabs: {
				type: Array,
				value: function() { return [] },
			},
			_forceUpdate: {
				type: Boolean,
				value: false
			}
		},

		_selectedIndexChanged: function(newIndex, oldIndex) {
			if(this._tabs && newIndex !== oldIndex) {
				this.set('_tabs.'+oldIndex+'.active', false);
				this.set('_tabs.'+newIndex+'.active', true);
				this.attributeFollows('active', this._tabs[newIndex], this._tabs[oldIndex])
			}
		},

		_activeChanged: function(e) {
			if(e.detail.value) this.selectedIndex = this._tabs.indexOf(e.target);
		},

		_addListeners: function () {
			if (this._tabs && this._tabs.length) {
				this._tabs.forEach(function(tab) {
					this.listen(tab, "active-changed", "_activeChanged");
				}, this);
			}
		},

		_removeListeners: function () {
			if (this._tabs && this._tabs.length) {
				this._tabs.forEach(function(tab) {
					this.unlisten(tab, "active-changed", "_activeChanged");
				}, this);
			}
		},

		detached: function () {
			this._removeListeners();
		},

		attached: function() {
			if(!this._tabs || this._tabs.length <= 0 || this._forceUpdate) {
				this._removeListeners();
				this._tabs = this.items;
			}

			if (this._tabs.length > 0) {
				this._addListeners();
				var activeTabs = Polymer.dom(this).querySelectorAll('strand-tab[active]'),
					active = activeTabs.shift();
				for(var i=0; i<activeTabs.length; i++) {
					activeTabs[i].active = false;
				}
				this.selectedIndex = this.selectedIndex || Math.max(this._tabs.indexOf(active), 0);
			}
		},

		_tabIsActive: function(a) {
			return a ? 'active' : '';
		},

		_handleTap: function(e) {
			this.selectedIndex = this.$.tabList.indexForElement(e.target);
		},

		_updateStyle: function(pos,offset) {
			return this.styleBlock({
				paddingTop: (pos === 'left') ? offset+'px' : '',
				paddingLeft: (pos === 'left') ? '' : offset+'px'
			});
		},

	});
	
})(window.Strand = window.Strand || {});
