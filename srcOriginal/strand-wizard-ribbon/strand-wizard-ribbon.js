/**
 * @license
 * Copyright (c) 2016 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.WizardRibbon = Polymer({
		is: "strand-wizard-ribbon",

		behaviors: [
			StrandTraits.LightDomGettable,
			StrandTraits.Selectable
		],

		properties: {
			allowSkip: {
				type: Boolean,
				value: false,
				notify: true
			},
			steps: {
				type: Array,
				value: function() { return []; }
			},
			selectedIndex: {
				type: Number,
				notify: true,
				value: 0
			},
			maxIndex: {
				type: Number,
				computed: '_computeMaxIndex(steps)'
			}
		},

		_computeItemState: function(index, selectedIndex) {
			if(index === selectedIndex) return 'active';
			else if(index < selectedIndex) return 'complete';
			else return '';
		},

		_computeMaxIndex: function(steps) {
			return steps.length-1;
		},

		_selectByIndex: function(model) {
			if(this.allowSkip) {
				var index = this.$.repeat.indexForElement(model.target);
				this.selectedIndex = index;
			}
		},

		ready: function() {
			this.selectedIndex = 0;
			this.set('steps', this.getLightDOM().map(function(node) { return node.textContent; }));
		}
	});

})(window.Strand = window.Strand || {});
