/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
/* test.js */
(function (scope) {
	scope.ListItem = Polymer({

		is: "mm-list-item",

		behaviors: [StrandTraits.DomMutable],

		properties: {
			selected: { 
				value: false, 
				reflectToAttribute: true 
			},
			observeSubTree: {
				value:true
			},
			title: {
				type:String,
				value:null,
				reflectToAttribute: true
			}
		},

		listeners:{
			"added":"updateTitleHandler",
			"removed":"updateTitleHandler",
			"modified":"updateTitleHandler"
		},

		ready: function() {
			this.updateTitle();
		},

		updateTitleHandler: function() {
			this.debounce("update-title",this.updateTitle,0);
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
