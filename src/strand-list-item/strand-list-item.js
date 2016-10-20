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
			},
			showPlaceholder: {
				type: Boolean,
				value: false
			},
			randomWidth: {
				type: String,
				value: function(){
					return this._setRandomWidth();
				}
			}
		},

		listeners:{
			"added":"_updateTitleHandler",
			"removed":"_updateTitleHandler",
			"modified":"_updateTitleHandler",
			"mouseover":"_updateTitleHandler"
		},

		attached: function () {
			this.debounce("update-title",this.updateTitle,0);
		},

		_updateTitleHandler: function() {
			this.debounce("update-title",this.updateTitle,0);
		},

		_setRandomWidth: function() {
			var n = 0.5;
			var width = Math.random() * (1.0 - n) + n;
			return String(Math.round(width*100) + "%");
		},

		updateTitle: function() {
			var m = StrandLib.Measure;
			var computed = m.textWidth(this, this.textContent);
			var actual = m.getBoundingClientRect(this).width - Measure.getPaddingWidth(this);
			if (computed > actual) {
				var txt = this.textContent.trim();
				if (this.title !== txt)
					this.title = txt;
			} else {
				this.title = null;
			}
		}

	});
})(window.Strand = window.Strand || {});
