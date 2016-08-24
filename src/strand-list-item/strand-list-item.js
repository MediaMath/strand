/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/

(function (scope) {
	var Measure = StrandLib.Measure;

	scope.ListItem = Polymer({

		is: "strand-list-item",

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.DomMutable,
			StrandTraits.Refable
		],

		properties: {
			selected: {
				type: Boolean,
				value: false,
				reflectToAttribute: true,
				notify: true
			},
			highlighted: {
				type: Boolean,
				value: false,
				reflectToAttribute: true,
				notify: true,
			},
			highlight:{
				type:String,
				value:"",
				notify:true,
				observer:"_highlightChanged"
			},
			observeSubtree: {
				value:true
			},
			observeCharacterData: {
				value:true
			},
			title: {
				type:String,
				value:null,
				reflectToAttribute: true
			},
			value: {
				type: String,
				value: false
			}
		},

		listeners:{
			"added":"_updateTitleHandler",
			"removed":"_updateTitleHandler",
			"modified":"_updateTitleHandler",
			"mouseover":"_updateTitleHandler"
		},

		ready: function() {
			if (!this.name) {
				this.name = this.getEffectiveChildNodes().map(function(n) { return n.textContent }).join('');
			}
		},

		attached: function () {
			this.debounce("update-title",this.updateTitle,0);
		},

		_updateTitleHandler: function() {
			this.debounce("update-title",this.updateTitle,0);
		},

		_nameChanged: function() {
			this.debounce('update-name', this._updateTextItems, 0);
		},

		_highlightChanged: function() {
			this.debounce('update-name', this._updateTextItems, 0);
		},

		_updateTextItems: function() {
			if (!this.name) return;
			if (this.highlight) {
				var reg = new RegExp(this.highlight.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'ig');
				var stamp = '\uE000';
				this._textItems = this.name.replace(reg, function(o) { 
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
				this._textItems = [{text:this.name}];
			}
		},


		updateTitle: function() {
			var m = StrandLib.Measure;
			var computed = m.textWidth(this, this.textContent);
			var actual = m.getBoundingClientRect(this).width - Measure.getPaddingWidth(this);
			if (computed > actual) {
				var txt = Polymer.dom(this).textContent.trim();
				if (this.title !== txt)
					this.title = txt;
			} else {
				this.title = null;
			}
		}

	});
})(window.Strand = window.Strand || {});
