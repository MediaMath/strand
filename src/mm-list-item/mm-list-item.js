/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/

(function (scope) {
	scope.ListItem = Polymer({

		is: "mm-list-item",

		behaviors: [ StrandTraits.DomMutable, StrandTraits.Resizable ],

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
				value: true
			},
			title: {
				type:String,
				value:null,
				reflectToAttribute: true
			},
			value: {
				type: String,
				value: ""
			}
		},

		listeners:{
			"added":"updateTitleHandler",
			"removed":"updateTitleHandler",
			"modified":"updateTitleHandler"
		},

		attached: function () {
			this.debounce("update-title",this.updateTitle,0);
		},

		updateTitleHandler: function() {
			this.debounce("update-title",this.updateTitle,0);
		},

		elementResize: function() {
			this.debounce("update-title", this.updateTitle, 0);
		},

		updateTitle: function() {
			var m = StrandLib.Measure;
			var computed = m.textWidth(this, this.textContent);
			var actual = m.getBoundingClientRect(this).width;
			if (computed > actual) {
				this.title = this.textContent.trim();
			} else {
				this.title = null;
			}
		}

	});
})(window.Strand = window.Strand || {}); 
