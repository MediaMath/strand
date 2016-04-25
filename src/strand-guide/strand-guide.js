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
				// notify:true,
				reflectToAttribute:true,
				// observer: "_hiddenChanged"
			},
			_dismissAction: {
				type: String,
				// notify:true
			},
			_progressIndicator: {
				type: Boolean,
				// value: false,
				computed: '_showProgressIndicator(data)',
				// observer: '_progIndicatorChanged'
			},
			_currentStep: {
				type: Number,
				value: 0,
				notify: true
				// observer: '_currentStepChanged'
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

		attached: function() {
			// TODO: handle the progress indicator
			// this._handleDots();
			this._setupCanvas();
		},

		// detached: function() {
			
		// },

		// setup
		domObjectChanged: function(domObject) {
			console.log('domObjectChanged: ', domObject);
			if (!this.data) this.data = domObject['guide']; 
		},
		
		_dataChanged: function(newVal, oldVal) {
			console.log('_dataChanged: ', newVal);
			// TODO: Start setting up with this data
			this._setupTip();

			// TODO: find all targets and get bounding - store em
			newVal.forEach(function(item) {
				var target = Polymer.dom(this.scope).querySelector('#' + item.target);
				item.targetRef = target;
				console.log(item, item.targetRef); 
			});
		},

		_setupTip: function() {
			var data = this.data;
			var step = this._currentStep;

			this._header = data[step].hasOwnProperty('header') ? data[step].header : null;
			this._message = data[step].hasOwnProperty('message') ? data[step].message : null;

			// next, back, and labeling
			this._next = data.length > 1;
			this._back = data.length > 1 && step > 0;

			if (this._next && step < data.length-1) {
				this._nextLabel = 'Next';
			} else if (this._next && step === data.length-1) {
				this._nextLabel = 'Done';
			}

			if (this._back && step > 0) {
				this._backLabel = 'Back';
			}
			// this._handleDots();
		},

		_setupCanvas: function() {
			this.$.focus.width = window.innerWidth;
			this.$.focus.height = window.innerHeight;
		},

		// _handleDots: function() {
		// 	var dots = Polymer.dom(this.$$('#dots')).querySelectorAll('div.dot');

		// 	for (var i = dots.length-1; i > -1 ; i--) {
		// 		if (i === Number(dots[i].getAttribute('data-id'))) {
		// 			dots[i].setAttribute('active', '');
		// 		} else {
		// 			dots[i].removeAttribute('active');
		// 		}
		// 	}
		// },

		_computeActive: function(index, _currentStep) {
			// console.log(index);
			return this._currentStep === index;
		},

		// _progIndicatorChanged: function(newVal, oldVal) {
		// 	if (newVal) {
		// 		this.$$('#progressIndicator').stamp(this.data);
		// 	}
		// },

		_showProgressIndicator: function(data) {
			return data.length > 1;
		},

		// public
		show: function() {
			console.log('strand-guide: show');
			this.hidden = false; 
			
			if(this.noscroll) {
				this._previousBodyOverflow = document.body.style.overflow;
				document.body.style.overflow = "hidden";
			}
		},

		hide: function(e) {
			console.log('strand-guide: hide');
			this.hidden = true;
			
			if (e) e = Polymer.dom(e);
			if (!e || this.dismiss && e.rootTarget === this.$.blocker || e.path.indexOf(this.$$("#close")) !== -1)  {
				document.body.style.overflow = this._previousBodyOverflow;
			}
		},

		_dismissHandler: function(e) {
			console.log('_dismissHandler: ', e);
		},

		_nextHandler: function(e) {
			this._currentStep++;
			
			if (this._currentStep <= this.data.length-1) {
				this._setupTip();
			}

			// use this handler to trigger close and cleanup
			// since the final step says 'Done'
			if (this._currentStep === this.data.length) {
				// TODO: Close and cleanup actions
				console.log('DONE');
			}
			// console.log('_nextHandler: ', this._currentStep);
		},

		_backHandler: function(e) {
			this._currentStep--;
			
			if (this._currentStep > -1) {
				this._setupTip();
			}
			// console.log('_backHandler: ', this._currentStep);
		},

		_widthStyle: function(width) {
			return "width:"+width+"px";
		},

	});

})(window.Strand = window.Strand || {});