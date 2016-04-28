/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.Sync = Polymer({
		is:"strand-sync",
		behaviors:[
			StrandLib.Sync.getBehavior(),
			StrandTraits.DomSyncable,
			StrandTraits.Refable
		],
	});

})(window.Strand = window.Strand || {});
