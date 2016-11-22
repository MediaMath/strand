/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var BehaviorUtils = StrandLib.BehaviorUtils;

	scope.GuideTooltip = Polymer({
		is: 'strand-guide-tooltip',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Refable,
			StrandTraits.PositionablePanel,
		],

		properties: {
			disableScroll: {
				type: Boolean,
				value: false
			},
			auto: {
				type: Boolean,
				value: false
			},
			hidden: {
				type: Boolean
			},
			closeBtn: {
				type: Boolean
			},
			_dismiss: {
				type: String
			},
			_progressIndicator: {
				type: Boolean,
				computed: '_showProgressIndicator(data)'
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
			_link: {
				type: Boolean,
				computed: '_hasLink(_linkText, _linkUrl)'
			},
			_linkText: {
				type: String,
				value: null
			},
			_linkUrl: {
				type: String,
				value: null
			},
			data: {
				type: Array
			},
			currentStep: {
				type: Number,
				notify: true,
				observer: '_currentStepChanged'
			}
		},

		open: function(silent) {
			var inherited = BehaviorUtils.findSuper(StrandTraits.Closable, "open");
			inherited.apply(this, [silent]);
			this._updatePosition();
		},

		_currentStepChanged: function(newVal, oldVal) {
			if (this.currentStep <= this.data.length-1) {
				if (this.state === this.STATE_OPENED) this.close();
				this.updateTip();
			}
		},

		updateTip: function() {
			if (!this.data) return;

			var data = this.data;
			var step = this.currentStep;

			// set direction for the tip - position 'n' by default
			this.direction = data[step].hasOwnProperty('direction') ? data[step].direction : 'n';

			this._target = data[step].targetRef;
			this._header = data[step].hasOwnProperty('header') ? data[step].header : null;
			this._message = data[step].hasOwnProperty('message') ? data[step].message : null;
			this._dismiss = data[step].hasOwnProperty('dismiss') ? data[step].dismiss : null;
			this._linkText = data[step].hasOwnProperty('linktext') ? data[step].linktext : null;
			this._linkUrl = data[step].hasOwnProperty('linkurl') ? data[step].linkurl : null;

			// Compute next, back, and do labeling
			this._next = data.length > 1;
			this._back = data.length > 1 && step > 0;

			if (this._next) {
				this._nextLabel = (step < data.length-1) ? 'Next' : 'Done';
			}

			if (this._back && step > 0) {
				this._backLabel = 'Back';
			}

			if (!this.hidden) this.open();
		},

		_computeActive: function(index, currentStep) {
			return this.currentStep === index;
		},

		_showProgressIndicator: function(data) {
			return data.length > 1;
		},

		_dismissHandler: function(e) {
			this.fire('guide-dismiss');
		},

		_nextHandler: function(e) {
			this.fire('guide-next');
		},

		_backHandler: function(e) {
			this.fire('guide-back');
		},

		_hasLink: function(_linkText, _linkUrl) {
			return _linkText && _linkUrl;
		}

	});

})(window.Strand = window.Strand || {});