/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Popover = Polymer({
		is: 'strand-popover',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.AutoTogglable,
			StrandTraits.Stackable,
			StrandTraits.PositionablePanel,
			StrandTraits.Refable
		],

		ready: function() {
			var hasFooter = Polymer.dom(this.$.footer).getDistributedNodes().length > 0;
			if(hasFooter) {
				this.classList.add('hasFooter');
			}
		}
		
	});

})(window.Strand = window.Strand || {});