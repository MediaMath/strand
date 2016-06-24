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
				value: false,
				notify: true
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
				type: Boolean,
				observer: '_suppressGuideChanged'
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
				observer: '_dataChanged'
			},
			_initializable: {
				type: Boolean,
				computed: '_computeInitializable(_attachedInit, _dataInit, _suppressInit, useLocalStorage)',
				observer: '_initializableChanged'
			},

			// initialization helpers
			_dataInit: {
				type: Boolean,
				value: false,
				notify: true
			},
			_suppressInit: {
				type: Boolean,
				value: false,
				notify: true
			},
			_attachedInit: {
				type: Boolean,
				value: false,
				notify: true
			}
		},

		_bodyOverflow: null,
		_queueShow: false,
		_queueGetTargets: false,

		domObjectChanged: function(domObject) {
			if (!this.data) {
				this.data = domObject['guide'];
			}
		},

		attached: function() {
			// Attempt to ensure that the DOM has settled before doing any layout
			this._attachedInit = true;
		},

		_suppressGuideChanged: function(newVal, oldVal) {
			this._suppressInit = true;
		},

		_dataChanged: function(newVal, oldVal) {
			if (newVal && newVal.length > 0) {
				if (this._attachedInit) {
					this._getTargets();
				} else {
					this._queueGetTargets = true;
				}
				this._dataInit = true;
			}
		},

		_getTargets: function() {
			// Collect object references for all of the targets
			this.data.forEach(function(item) {
				var target = Polymer.dom(this.scope).querySelector('#' + item.target);
				item.targetRef = target;
			}, this);
		},

		_init: function() {
			// Make sure we are attached before attempting to get targets
			if (this._queueGetTargets) {
				this._getTargets();
				this._queueGetTargets = false;
			}

			// Trigger tooltip and canvas setup
			this._tooltipData = this.data;
			this._currentStep = 0;

			if (this._queueShow) {
				this.show();
				this._queueShow = false;
			}
		},

		show: function() {
			if (this._initializable) {
				// Show the tooltip only if suppress was not set via localStorage
				if (!this.suppressGuide) {
					this._setHidden(false);
					this.$.tooltip.open();
					if (this.showFocus) this.$$('#focus')._updateCanvas();
				}
			} else {
				this._queueShow = true;
			}
		},

		hide: function(e) {
			if (this._initializable) {
				this._setHidden(true);
				this.$.tooltip.close();

				// User dismissal === suppress guide
				if (this.useLocalStorage) {
					this.set('suppressGuide', true);
				}
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
			
			// Used to trigger close and cleanup at the final step
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
		},

		_computeInitializable: function(_attachedInit, _dataInit, _suppressInit, useLocalStorage) {
			if (useLocalStorage) {
				return _suppressInit && _dataInit && _suppressInit;
			} else {
				return _dataInit && _attachedInit;
			}
		},

		_initializableChanged: function(newVal, oldVal) {
			if (newVal === true) this._init();
		}

	});

})(window.Strand = window.Strand || {});