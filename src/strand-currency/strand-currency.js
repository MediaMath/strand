/**
 * @license
 * Copyright (c) 2016 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.Currency = Polymer({
		is: "strand-currency",

		behaviors: [
			StrandTraits.Refable
		],

		properties: {
			currency:{
				type:String,
				value:"USD"
			},
			precision:{
				type:Number,
				value:2
			},
			value:{
				type:Number,
				value:0
			},
			locale:{
				type:String,
				value: navigator.language
			},
			format:{
				type:Function,
				computed:"_createFormatter(locale, currency, precision)"
			}
		},

		_createFormatter: function(locale, currency, precision) {
			return Intl.NumberFormat(locale, {
				style: 'currency',
				currency: currency,
				minimumFractionDigits: precision,
			}) || {format:function(v) { return v; }};
		},

		_formatCurrency: function(value, format) {
			if (format) {
				return format.format(value === 0 ? Math.abs(value) : value);
			}
			return value;
		}


	});

})(window.Strand = window.Strand || {});
