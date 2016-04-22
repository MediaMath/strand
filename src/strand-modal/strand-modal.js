/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
/* strand-modal.js */
(function(scope) {

	scope.Modal = Polymer({
		is: 'strand-modal',

		behaviors:[
			StrandTraits.Falsifiable,
			StrandTraits.Resolvable,
			StrandTraits.Stackable,
			StrandTraits.Refable
		],

		properties: {
			stackType:{
				value: "modal"
			},
			hidden: {
				type:Boolean,
				value:true,
				notify:true,
				reflectToAttribute:true
			},
			dismiss: {
				type:Boolean,
				value:true,
				notify:true,
			},
			noscroll: {
				type:Boolean,
				value:false
			},
			width: {
				type:Number,
				value:600
			}
		},

		show: function() {
			this.hidden = false;

			if(this.noscroll) {
				document.body.style.overflow = "hidden";
			}
		},

		_widthStyle: function(width) {
			return "width:"+width+"px";
		},

		hide: function(e) {
			if (e) e = Polymer.dom(e);
			if (!e || this.dismiss && e.rootTarget === this.$.blocker || e.path.indexOf(this.$$("#close")) !== -1)  {
				this.hidden = true;
				document.body.style.overflow = "";
			}
		}
	});

})(window.Strand = window.Strand || {});
