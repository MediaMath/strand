/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {
	scope.Model = Polymer({

		is:"strand-model",

		properties: {
			collection:{
				type:Strand.Collection,
				value:null,
			}
		},

		behaviors: [
			StrandLib.Sync.getBehavior(),
			StrandTraits.Model,
			StrandTraits.DomSyncable,
			StrandTraits.Refable
		],

	});
})(window.Strand = window.Strand || {});
