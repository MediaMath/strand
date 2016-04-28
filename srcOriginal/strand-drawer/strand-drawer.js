/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Drawer = Polymer({
		is: 'strand-drawer',

		properties: {
			label: {
				type: String,
				value:''
			},
			openedLabel: {
				type: String,
				value:''
			},
			closedLabel: {
				type: String,
				value:''
			},
			openedHeight: {
				type: Number,
				value: 0,
			},
			closedHeight: {
				type: Number,
				value: 0
			},
			forceMeasure: {
				type: Boolean,
				value: false
			},
			expanded: {
				type: Boolean,
				value: false,
				notify: true,
				observer: '_expandedChanged'
			},
			_height: {
				type: Number,
				computed: '_computeDrawerHeight(expanded,openedHeight,closedHeight)'
			},
			_showLabel: {
				type: Boolean,
				computed: '_hasLabel(label,openedLabel,closedLabel)'
			}
		},

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Stylable,
			StrandTraits.Refable
		],

		_hasLabel: function(label,openedLabel,closedLabel) {
			return label || (openedLabel && closedLabel);
		},

		_computeDrawerHeight: function(expanded,openedHeight,closedHeight) {
			return (expanded) ? openedHeight : closedHeight;
		},

		_computeLabel: function(label,openedLabel,closedLabel,expanded) {
			if (openedLabel && closedLabel) {
				return (expanded) ? openedLabel : closedLabel;
			} else {
				return label;
			}
		},

		_expandedChanged: function(expanded) {
			if(!this.openedHeight || this.forceMeasure)
				this.openedHeight = this.$.content.offsetHeight;

			this.fire("toggled", this.expanded);
		},

		open: function () {
			this.expanded = true;
		},

		close: function () {
			this.expanded = false;
		},

		toggle: function () {
			this.expanded = !this.expanded;
		},

		_computeClass: function(expanded) {
			var o = {};
			o["expanded"] = expanded;
			return this.classBlock(o);
		},

		_computeStyle: function(_height) {
			return this.styleBlock({
				height: _height + 'px'
			});
		}
	});

})(window.Strand = window.Strand || {});