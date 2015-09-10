/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Popover = Polymer({
		is: 'mm-popover',

		behaviors: [
			StrandTraits.AutoTogglable,
			StrandTraits.Stackable,
			StrandTraits.PositionablePanel
		],

		properties: {
			target: {
				type: Object,
				value: null,
				observer: '_positionableTargetChanged'
			},
		},

		ready: function() {
			var hasFooter = Polymer.dom(this.$.footer).getDistributedNodes().length > 0;
			if(hasFooter) {
				this.classList.add('hasFooter');
			}
		},

		_positionableTargetChanged: function() {
			// use the private target api
			this._target = this.target;
		}
	});

})(window.Strand = window.Strand || {});