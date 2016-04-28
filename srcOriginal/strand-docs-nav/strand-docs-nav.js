/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.DocsNav = Polymer({

		is: 'strand-docs-nav', 

		behaviors: [
			StrandTraits.Stylable
		],

		properties: {
			expanded: { 
				type: Boolean,
				value: false, 
				reflectToAttribute: true,
				observer: "_expandedChanged"
			}
		},

		_labelTap: function(e) {
			e.preventDefault();
			this.expanded = !this.expanded;
		},

		_listTap: function(e) {
			e.preventDefault();
			this.fire("docs-nav-selected", { target: e.target, value: e.target.value });
		},

		_expandedChanged: function(newVal, oldVal) {
			if (newVal) {
				this.$.expandArea.style.height = this.$.expandArea.scrollHeight + "px";
			} else {
				this.$.expandArea.style.height = "0px";
			}
		},

		_updateClass: function(expanded) {
			var o = {};
			o.opened = expanded;
			return this.classBlock(o);
		}

	});

})(window.Strand = window.Strand || {});