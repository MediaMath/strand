/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	var DataUtils = StrandLib.DataUtils;	

	scope.TimePicker = Polymer({
		is: 'strand-timepicker',

		properties: {
			value: {
				type: String,
				value: '',
				notify: true,
				observer: '_valueChanged'
			},

			timeFormat: {
				type: String,
				value: 'hh:mm a'
			},

			use24HourTime: {
				type: Boolean,
				computed: '_computeUse24HourTime(timeFormat)',
				notify: true
			},

			timeString: {
				type: String,
				value: null,
				notify: true,
				observer: '_timeStringChanged'
			},

			// dropdown user selection only
			timePeriod: {
				type: String,
				value: 'am',
				notify: true,
				observer: '_timePeriodChanged'
			},

			_timeOnlyFormat: {
				type: String,
				computed: '_computeTimeOnlyFormat(timeFormat)'
			}
		},

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Falsifiable,
			StrandTraits.Refable
		],

		_computeUse24HourTime: function(timeFormat) {
			return timeFormat.includes('H');
		},

		_computeTimeOnlyFormat: function(timeFormat) {
			return timeFormat.replace(/a/i, '').trim();
		},

		_computeValue: function(timeString, timePeriod, timeFormat) {
			var mm = moment(timeString + timePeriod, timeFormat);
			return mm.isValid() ? mm.format(timeFormat) : '';
		},

		_timeStringChanged: function(timeString, oldTimeString) {
			if(timeString && timeString !== oldTimeString) {
				var valid = timeString.split(':')[1].length === 2; // don't update value in the middle of typing
				if(valid) {
					this.value = this._computeValue(timeString, this.timePeriod, this.timeFormat);
				}
			}
		},

		_timePeriodChanged: function(timePeriod, oldTimePeriod) {
			if(timePeriod && timePeriod !== oldTimePeriod) {
				this.value = this._computeValue(this.timeString, timePeriod, this.timeFormat);
			}
		},

		_valueChanged: function(value, oldValue) {
			if(value && value !== oldValue) {
				var wrappedNew = moment(value, this.timeFormat);
				this.timeString = wrappedNew.format(this._timeOnlyFormat);
				this.timePeriod = wrappedNew.format('a');
			}
		},

		_keyHandler: function(e) {
			var wrappedTime = moment(this.timeString, this.timeFormat, true);
			if(wrappedTime.isValid()) {
				var c = String.fromCharCode(e.keyCode),
					normalized = Polymer.dom(e);
				if (c === 'A' || c === 'P') {
					e.preventDefault();
					this.set('timePeriod', c+'m');
				}
			}
		}
	});

})(window.Strand = window.Strand || {});
