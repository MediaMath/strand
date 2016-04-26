/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.GuideTooltip = Polymer({
		is: 'strand-guide-tooltip',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Refable
		],

		properties: {
			_dismissAction: {
				type: String
			},
			_progressIndicator: {
				type: Boolean,
				computed: '_showProgressIndicator(data)'
			},
			currentStep: {
				type: Number,
				notify: true,
				observer: '_currentStepChanged'
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
		},

		_dataChanged: function(newVal, oldVal) {
			console.log('strand-guide-tooltip :: _dataChanged: ', newVal);
		},

		_currentStepChanged: function(newVal, oldVal) {
			console.log('strand-guide-tooltip :: _currentStepChanged: ', newVal);
			if (this.currentStep <= this.data.length-1) {
				this._setupTip();
			}
		},

		_setupTip: function() {
			var data = this.data;
			var step = this.currentStep;

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
		},

		_computeActive: function(index, currentStep) {
			return this.currentStep === index;
		},

		_showProgressIndicator: function(data) {
			return data.length > 1;
		},

		_dismissHandler: function(e) {
			console.log('_dismissHandler: ', e);
		},

		_nextHandler: function(e) {
			this.fire('guide-next');
		},

		_backHandler: function(e) {
			this.fire('guide-back');
		},

	});

})(window.Strand = window.Strand || {});