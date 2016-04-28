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
			contentTarget: {
				type: Object,
				value: function() { return this.$.guideContent; }
			},
			useLocalStorage: {
				type: Boolean,
				value: false
			},
			name: {
				type: String
			},
			suppressGuide: {
				type: Boolean
			},
			scope: {
				type: Object,
				notify: true,
				value: function() { return document; }
			},
			stackType:{
				value: "modal"
			},
			hidden: {
				type:Boolean,
				value:true,
				reflectToAttribute:true
			},
			showFocus: {
				type: Boolean,
				value: true
			},
			autoDismiss: {
				type: Boolean,
				value: false
			},
			noscroll: {
				type:Boolean,
				value:false
			},
			closeBtn: {
				type: Boolean,
				value: true
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
		_isAttached: false,

		domObjectChanged: function(domObject) {
			if (!this.data && !this.suppressGuide) {
				this.data = domObject['guide'];
			}
		},

		attached: function() {
			// Attempt to ensure that the DOM has settled before doing any layout
			this.async(function() {
				if (this.data) this._init();
				this._isAttached = true;
			});
		},

		_dataChanged: function(newVal, oldVal) {
			if (!this.suppressGuide) {
				// Collect object references for all of the targets
				newVal.forEach(function(item) {
					var target = Polymer.dom(this.scope).querySelector('#' + item.target);
					item.targetRef = target;
				});

				if (this._isAttached) this._init();
			}
		},

		_init: function() {
			// Trigger tooltip and canvas setup
			this._tooltipData = this.data;
			this._currentStep = 0;
		},

		show: function() {
			if (!this.suppressGuide) {
				this.hidden = false;
				this.$.tooltip.open();
				if (this.showFocus) this.$$('#focus').updateCanvas();

				// strand-modal scroll suppression
				if(this.noscroll) {
					this._previousBodyOverflow =  document.body.style.overflow;
					document.body.style.overflow = "hidden";
				}
			}
		},

		hide: function(e) {
			if (!this.suppressGuide) {
				this.hidden = true;
				this.$.tooltip.close();

				if (this.noscroll) {
					document.body.style.overflow = this._previousBodyOverflow;
				}

				// If the user has dismissed - suppress via local storage
				if (this.useLocalStorage) this.suppressGuide = true;
			}
		},

		_blockerHandler: function(e) {
			if (this.autoDismiss) this.hide(); 
		},

		_dismissHandler: function(e) {
			this.hide();
		},

		_nextHandler: function(e) {
			this._currentStep++;
			
			// use this handler to trigger close and cleanup - the final step is 'Done'
			if (this._currentStep === this.data.length) {
				this._dismissHandler();
			}

			// TODO: Scroll handling(?)
			// Scroll to the location of the target if it is out of bounds
		},

		_backHandler: function(e) {
			this._currentStep--;

			// TODO: Scroll handling(?)
			// Scroll to the location of the target if it is out of bounds
		},

	});

})(window.Strand = window.Strand || {});