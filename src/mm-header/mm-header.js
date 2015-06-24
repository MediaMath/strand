/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {
 
	scope.Header = Polymer({
		is:"mm-header",

		properties: {
			ver:{
				value:"<<version>>",
				type:String
			},
			size: {
				value:"large",
				type:String,
				reflectToAttribute:true
			}
		},

		headerClass: function(size) {
			return "header-"+size;
		}
	});
	
})(window.Strand = window.Strand || {});