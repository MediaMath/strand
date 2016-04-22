/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	var DataUtils = StrandLib.DataUtils;
	var Sync = StrandLib.Sync;
	var Collection = StrandLib.Collection;

	scope.Collection = Polymer({

		is:"strand-collection",

		_cidIndex: 0,

		properties: {

		},

		behaviors: [
			// StrandLib.Sync.getBehavior(), //interhited from pageable
			StrandTraits.Collection,
			StrandTraits.Pageable,
			StrandTraits.Refable
		],


	});
})(window.Strand = window.Strand || {});
