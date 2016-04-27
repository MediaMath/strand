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
			showFocus: {
				type: Boolean,
				value: true
			},
			// tipWidth: {
			// 	type: Number
			// },
			_auto: {
				type: Boolean,
				computed: '_computeAuto(showFocus)'
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

		// TODO: this may be more than what is needed here
		// some combo of lightDomGettable and DataUtils may be
		// sufficient...
		domObjectChanged: function(domObject) {
			// console.log('strand-guide :: domObjectChanged: ', domObject);
			if (!this.data) {
				this.data = domObject['guide'];
			}
		},

		_dataChanged: function(newVal, oldVal) {
			// console.log('strand-guide :: _dataChanged: ', newVal);
			newVal.forEach(function(item) {
				var target = Polymer.dom(this.scope).querySelector('#' + item.target);
				item.targetRef = target;
				// console.log(item, item.targetRef);
			});

			if (this._isAttached) this._init();
		},

		attached: function() {
			// Attempt to ensure that the DOM has settled before doing any layout
			this.async(function() {
				this._init();
				this._isAttached = true;
			});
		},

		_init: function() {
			// trigger tooltip and canvas setup
			this._tooltipData = this.data;
			this._currentStep = 0;
		},

		show: function() {
			// console.log('strand-guide :: show');
			this._previousBodyOverflow = document.body.style.overflow;
			document.body.style.overflow = "hidden";

			this.hidden = false;
			this.$.tooltip.open();
		},

		hide: function(e) {
			// console.log('strand-guide :: hide');
			document.body.style.overflow = this._previousBodyOverflow;
			
			this.hidden = true;
			this.$.tooltip.close();
		},

		_dismissHandler: function(e) {
			console.log('strand-guide :: _dismissHandler: ', e);
			this.hide();

			// TODO: Local storage(?)
			// Remember the user saw this and don't display again
			// Based on id/name given to the strand-guide instance(?)
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

		_computeAuto: function(showFocus) {
			return !showFocus;
		},

	});

})(window.Strand = window.Strand || {});