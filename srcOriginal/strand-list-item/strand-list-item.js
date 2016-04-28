/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/

(function (scope) {
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

		attached: function () {
			this.debounce("update-title",this.updateTitle,0);
		},

		_updateTitleHandler: function() {
			this.debounce("update-title",this.updateTitle,0);
		},

		_highlightChanged: function() {
			if (this.highlight && this.highlight.length > 0) {
				var s = this.innerText;
				Polymer.dom(this).innerHTML = s.replace(new RegExp(this.highlight,"ig"),function(orig) {
					return '<span class="strand-list-item highlight">'+orig+'</span>';
				},'ig');
			} else if (this.innerText && this.innerText.trim()){
				Polymer.dom(this).innerHTML = this.innerText.trim(); //strip any formatting
			}
		},

		updateTitle: function() {
			var m = StrandLib.Measure;
			var computed = m.textWidth(this, this.textContent);
			var actual = m.getBoundingClientRect(this).width;
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
