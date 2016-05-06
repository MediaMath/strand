/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.Wizard = Polymer({
		is: "strand-wizard",

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
			allowSkip: {
				type: Boolean,
				value: false
			},
			selectedIndex: {
				type: Number,
				notify: true,
				value: 0,
				observer: '_selectedIndexChanged'
			},
			_tabs: {
				type: Array,
				value: function() { return []; },
			},
			_forceUpdate: {
				type: Boolean,
				value: false
			}
		},

		next: function() {
			if(this.selectedIndex < this._tabs.length - 1) this.selectedIndex++;
		},

		prev: function() {
			if(this.selectedIndex > 0) this.selectedIndex--;
		},

		_selectedIndexChanged: function(newIndex, oldIndex) {
			if(this._tabs && newIndex !== oldIndex) {
				this.set('_tabs.'+oldIndex+'.active', false);
				this.set('_tabs.'+newIndex+'.active', true);
				this.attributeFollows('active', this._tabs[newIndex], this._tabs[oldIndex]);
			}
		},

		attached: function() {
			if(!this._tabs || this._tabs.length <= 0 || this._forceUpdate) {
				this._tabs = this.items;
				this._tabs.forEach(function(tab) {

					tab.addEventListener('active-changed', function(e) {
						if(e.detail.value) this.selectedIndex = this._tabs.indexOf(tab);
					}.bind(this));

				}, this);
			}

			if (this._tabs.length > 0) {
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
			if(this.allowSkip) this.selectedIndex = this.$.tabList.indexForElement(e.target);
		},

		_updateStyle: function(pos,offset) {
			return this.styleBlock({
				paddingTop: (pos === 'left') ? offset+'px' : '',
				paddingLeft: (pos === 'left') ? '' : offset+'px'
			});
		},

	});

})(window.Strand = window.Strand || {});
