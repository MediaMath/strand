/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.TimePicker = Polymer({
		is: 'strand-timepicker',

		properties: {
			value: {
				type: Number,
				value: null,
				notify: true,
				observer: '_valueChanged'
			},
			timeFormat: {
				type: String,
				value: 'hh:mm a'
			},
			use24HourTime: {
				type: Boolean,
				value: false
			},

			timeString: {
				type: String,
				value: null,
				notify: true
			},
			timePeriod: {
				type: String,
				value: 'am',
				notify: true
			},

			_timeOnlyFormat: {
				type: String,
				computed: '_computeTimeOnlyFormat(timeFormat)'
			},
			_24HourFormat: {
				type: String,
				computed: '_compute24HourFormat(_timeOnlyFormat)'
			},
			_UTCTimeFormat: {
				type: String,
				computed: '_computeUTCTimeFormat(timeFormat)'
			}
		},

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Falsifiable,
			StrandTraits.Refable
		],

		observers: [
			'_computeValue(use24HourTime, timeString, timePeriod)'
		],

		_computeTimeOnlyFormat: function(timeFormat) {
			return timeFormat.replace(' a', '');
		},
		_compute24HourFormat: function(timeOnlyFormat) {
			return timeOnlyFormat.replace(/h/g, 'H');
		},
		_computeUTCTimeFormat: function(timeFormat) {
			return timeFormat + ' Z';
		},

		// Computes UNIX timestring from user input
		_computeValue: function(use24HourTime, time, timePeriod) {
			var secondsPerDay = 86400;
			var timeString = (use24HourTime ? time : time+' '+timePeriod) + " +0000";
			var wrappedTime = moment(timeString, this._UTCTimeFormat, true);

			if(wrappedTime.isValid()) {
				this.value = wrappedTime.unix() % secondsPerDay;
			}
		},

		// Updates display to reflect new value
		_valueChanged: function(newValue, oldValue) {
			if(Number.isInteger(newValue) && newValue !== oldValue) {
				var newTime = moment.unix(newValue).utc();
				var time = newTime.format(this.use24HourTime ? this._24HourFormat : this._timeOnlyFormat);
				var timePeriod = newTime.format('a');

				this.timeString = time;
				this.timePeriod = timePeriod;
			};
		},

		_keyHandler: function(e) {
			var wrappedTime = moment(this.timeString, this._timeOnlyFormat, true);
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
