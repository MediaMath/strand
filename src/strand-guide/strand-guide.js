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

		_isAttached: false,

		// TODO: this may be more than what is needed here - some combo
		// of lightDomGettable and DataUtils may be sufficient
		domObjectChanged: function(domObject) {
			if (!this.data) {
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
			newVal.forEach(function(item) {
				var target = Polymer.dom(this.scope).querySelector('#' + item.target);
				item.targetRef = target;
			});

			if (this._isAttached) this._init();
		},

		_init: function() {
			// Trigger tooltip and canvas setup
			this._tooltipData = this.data;
			this._currentStep = 0;
		},

		show: function() {
			var tooltip = this.$.tooltip;

			this.hidden = false;
			if (tooltip.state === tooltip.STATE_CLOSED) tooltip.open();
			if (this.showFocus) this.$$('#focus').updateCanvas();
		},

		hide: function(e) {
			var tooltip = this.$.tooltip;

			this.hidden = true;
			if (tooltip.state === tooltip.STATE_OPENED) tooltip.close();
		},

		// _tooltipCloseHandler: function(e) {
		// 	if (!this.showFocus) this._dismissHandler(e);
		// },

		_dismissHandler: function(e) {
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