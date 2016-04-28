/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.ArrayMunge = Polymer({
		is: "strand-array-munge",

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Refable
		],

		properties: {
			_parsedRules:{
				type:Array,
				value: function() { return []; }
			},
			input:{
				type:Array,
				notify:true
			},
			output:{
				type:Array,
				notify:true
			},
			rules:{
				type:String,
				value:"",
				observer:"_parseRules"
			},
			highlight:{
				type:String,
				value:"",
				observer:"_highlightChanged"
			}
		},

		observers:[
			'_handleInputUpdate(input.*, _parsedRules)',
			'_handleInputUpdate(input.slices)',
		],

		_handleInputUpdate: function(change) {
			if (change && change.path && change.path !== "input.length") {
				if (change.path === "input.splices") {
					change.value.indexSplices.forEach(function(splice) {
						var idx = splice.index;
						var count = splice.addedCount;
						var output = this.input.slice(idx, idx+count).map(this._generateModel, this);
						var args = ['output', idx, count].concat(output);
						this.splice.apply(this, args);
					},this);
					return;
				} else {
					var path = change.path.split(".");
					if (path.length > 1) {
						var idx = parseInt(path[1].substr(1));
						var model = this.input[idx];
						this.set('output.#' + idx, this._generateModel(model));
						return;
					}
				}


			}
			if (this.input && this.input.length) {
				var o = this.input.map(this._generateModel,this);
				this.set('output', o);
			}
		},

		_generateModel: function(i) {
			var o = {};
			this._parsedRules.forEach(function(rule) {
				var val = rule.from === '.' ? i : i[rule.from] || 'l';
				if (rule.to !== '.') {
					o[rule.to] = val;
				} else {
					o = val;
				}
			});
			if (typeof o !== 'string' && this.highlight) o.highlight = this.highlight;
			return o;
		},

		_parseRules: function() {
			this._parsedRules = this.rules.split(",").map(function(rule) {
				var parsed = rule.split("->");
				if (parsed.length === 2) {
					return {
						from:parsed[0],
						to:parsed[1]
					};
				}
			}, this).filter(function(o) { return !!o; });
		},

		_highlightChanged: function() {
			// if (this.input && this.inpu.length) {
			// 	this.set('output', this.output.map(function(o) {
			// 		o.highlight = this.highlight;
			// 	}));
			// } else {
			// 	this._handleInputUpdate();
			// 	this.set('output', this.output.map(function(o) {
			// 		o.highlight = this.highlight;
			// 	}));
			// }
		}

	});

})(window.Strand = window.Strand || {});
