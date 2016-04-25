/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Guide = Polymer({
		is: 'strand-guide',

		behaviors:[
			StrandTraits.Falsifiable,
			StrandTraits.Resolvable,
			StrandTraits.Stackable,
			StrandTraits.Refable,
			StrandTraits.DomGettable
		],

		properties: {
			stackType:{
				value: "modal"
			},
			hidden: {
				type:Boolean,
				value:true,
				// notify:true,
				reflectToAttribute:true,
				// observer: "_hiddenChanged"
			},
			_dismissAction: {
				type: String,
				// notify:true
			},
			_next: {
				type: Boolean,
				value: false
			},
			_nextLabel: {
				type: String,
				value: 'Next'
			},
			_back: {
				type: Boolean,
				value: false
			},
			_backLabel: {
				type: String,
				value: 'Back'
			},
			_header: {
				type: String
			},
			_message: {
				type: String
			},
			
			data: {
				type: Array,
				notify: true,
				observer: '_dataChanged'
			}
			// noscroll: {
			// 	type:Boolean,
			// 	value:false
			// },
		},

		_previousBodyOverflow: null,

		domObjectChanged: function(domObject) {
			console.log('domObjectChanged: ', domObject);
			if (!this.data) this.data = domObject; 
		},
		
		// attached: function() {
			
		// },

		// detached: function() {
			
		// },

		_dataChanged: function(newVal, oldVal) {
			console.log('_dataChanged: ', newVal);
			// TODO: Start setting up with this data
			// TODO: find all targets and get bounding - store em
			// TODO: set all the layout properties
		},

		show: function() {
			console.log('strand-guide: show');
			if(this.noscroll) {
				this._previousBodyOverflow = document.body.style.overflow;
				this.hidden = false;
				document.body.style.overflow = "hidden";
			}
		},

		hide: function(e) {
			console.log('strand-guide: hide');
			if (e) e = Polymer.dom(e);
			if (!e || this.dismiss && e.rootTarget === this.$.blocker || e.path.indexOf(this.$$("#close")) !== -1)  {
				this.hidden = true;
				document.body.style.overflow = this._previousBodyOverflow;
			}
		},

		_dismissHandler: function(e) {
			console.log('_dismissHandler: ', e);
		},

		_nextHandler: function(e) {
			console.log('_nextHandler: ', e);
		},

		_backHandler: function(e) {
			console.log('_backHandler: ', e);
		},

		// _hiddenChanged: function(newVal, oldVal) {
		// 	if (newVal) this.show();   
		// },

		_widthStyle: function(width) {
			return "width:"+width+"px";
		},

	});

})(window.Strand = window.Strand || {});