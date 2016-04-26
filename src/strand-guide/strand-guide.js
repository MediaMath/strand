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
			scope: {
				type: Object,
				notify: true,
				value: function() { return document }
			},
			stackType:{
				value: "modal"
			},
			hidden: {
				type:Boolean,
				value:true,
				reflectToAttribute:true
			},
			_currentStep: {
				type: Number,
				notify: true
			},
			_tooltipData: {
				type: Array,
				notify: true
			},
			data: {
				type: Array,
				notify: true,
				observer: '_dataChanged'
			},
		},

		_previousBodyOverflow: null,

		attached: function() {
			this._setupCanvas();
		},

		// TODO: this may be more than what is needed here
		// some combo of lightDomGettable and DataUtils may be
		// sufficient...
		domObjectChanged: function(domObject) {
			console.log('strand-guide :: domObjectChanged: ', domObject);
			if (!this.data) {
				this.data = domObject['guide'];

				// find all of the target elements, and add them
				this.data.forEach(function(item) {
					var target = Polymer.dom(this.scope).querySelector('#' + item.target);
					item.targetRef = target;
					console.log(item, item.targetRef); 
				});

				// set the tooltip data
				this._tooltipData = this.data;
				this._currentStep = 0;
			}
		},
		
		_dataChanged: function(newVal, oldVal) {
			console.log('strand-guide :: _dataChanged: ', newVal);
		},

		_setupCanvas: function() {
			this.$.focus.width = window.innerWidth;
			this.$.focus.height = window.innerHeight;
		},

		show: function() {
			console.log('strand-guide :: show');
			this.hidden = false; 
			
			if(this.noscroll) {
				this._previousBodyOverflow = document.body.style.overflow;
				document.body.style.overflow = "hidden";
			}
		},

		hide: function(e) {
			console.log('strand-guide :: hide');
			this.hidden = true;
			
			if (e) e = Polymer.dom(e);
			if (!e || this.dismiss && e.rootTarget === this.$.blocker || e.path.indexOf(this.$$("#close")) !== -1)  {
				document.body.style.overflow = this._previousBodyOverflow;
			}
		},

		_dismissHandler: function(e) {
			console.log('strand-guide :: _dismissHandler: ', e);
		},

		_nextHandler: function(e) {
			this._currentStep++;
			
			// use this handler to trigger close and cleanup - the final step is 'Done'
			if (this._currentStep === this.data.length) {
				console.log('DONE');
				this._currentStep = 0;
			}
		},

		_backHandler: function(e) {
			this._currentStep--;
		},

	});

})(window.Strand = window.Strand || {});