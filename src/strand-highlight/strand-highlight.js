/**
 * @license
 * Copyright (c) 2016 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.Highlight = Polymer({

		is: "strand-highlight",

		behaviors: [
			StrandTraits.Refable
		],

		properties: {
			text:{
				type:String,
				value:"",
				notify:true
			},
			highlight:{
				type:String,
				value:"",
				notify:true
			},
			_textItems:{
				type:Array,
				value: function() { return []; },
				nofity:true
			}
		},

		observers:[
			'_updateInternals(text,highlight)'
		],

		_updateInternals: function(text, highlight) {
			if (!this.text) {
				this._textItems = [];
				return;
			}
			if (this.highlight) {
				var reg = new RegExp(this.highlight.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'ig');
				var stamp = '\uE000';
				this._textItems = this.text.replace(reg, function(o) { 
					return stamp + o + stamp;
				})
				.split(stamp)
				.map(function(input, i) {
					return {
						highlight: i%2!==0,
						text: input
					};
				});
			} else {
				this._textItems = [{text:this.text}];
			}

		}

	});

})(window.Strand = window.Strand || {});
