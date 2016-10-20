/**
 * @license
 * Copyright (c) 2016 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.Timeformat = Polymer({
		is: "strand-timeformat",

		behaviors: [
			StrandTraits.Refable
		],

		properties: {
			value:{
				type:Date,
				value:null
			},
			format:{
				type:String,
				value:"L"
			}
		},

		_formatDateTime: function(value, format) {
			moment.locale();
			return moment(value).format(format);
		}

	});

})(window.Strand = window.Strand || {});
