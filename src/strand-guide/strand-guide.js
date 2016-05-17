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

		TYPE_CIRCLE: 'circle',
		TYPE_RECTANGLE: 'rectangle',

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
				type: String,
				notify: true
			},
			_storageName: {
				type: String,
				computed: '_computeStorageName(name)'
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
				value: 'modal'
			},
			hidden: {
				type:Boolean,
				value:true,
				readOnly: true,
				reflectToAttribute:true,
				observer: '_hiddenChanged'
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
			opacity: {
				type: Number,
				value: 0.3
			},
			spotlightType: {
				type: String,
				value: function() { return this.TYPE_CIRCLE; }
			},
			spotlightOffset: {
				type: Number,
				value: 10
			},
			cornerRadius: {
				type: Number,
				value: 5
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

		_bodyOverflow: null,
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
				}, this);

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
				this._setHidden(false);
				this.$.tooltip.open();
				if (this.showFocus) this.$$('#focus')._updateCanvas();
			}
		},

		hide: function(e) {
			if (!this.suppressGuide) {
				this._setHidden(true);
				this.$.tooltip.close();

				// If the user has dismissed - suppress via local storage
				if (this.useLocalStorage) this.suppressGuide = true;
			}
		},

		_hiddenChanged: function(newVal, oldVal) {
			if (!newVal) {
				if (this.noscroll) {
					this._bodyOverflow = document.body.style.overflow;
					document.body.style.overflow = "hidden";
				} 
			} else {
				if (this.noscroll) document.body.style.overflow = this._bodyOverflow;
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

		_computeStorageName: function(name) {
			return 'guide-' + name;
		}

	});

})(window.Strand = window.Strand || {});