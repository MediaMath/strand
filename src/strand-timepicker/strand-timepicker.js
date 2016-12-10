/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	var DataUtils = StrandLib.DataUtils;
	function _allExist() {
		return Array.prototype.slice.call(arguments)
			.map(function(value) { return DataUtils.isDef(value); })
			.reduce(function(sum, current) { return sum && current; });
	}

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
				value: false,
				notify: true,
				observer: '_use24Changed',
			},

			timeString: {
				type: String,
				value: null,
				notify: true,
				observer: '_timeStringChanged'
			},
			timePeriod: {
				type: String,
				value: 'am',
				notify: true,
				observer: '_timePeriodChanged'
			},

			_timeOnlyFormat: {
				type: String,
				computed: '_computeTimeOnlyFormat(timeFormat)'
			},
			_24HourFormat: {
				type: String,
				computed: '_compute24HourFormat(_timeOnlyFormat)'
			},
		},

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Falsifiable,
			StrandTraits.Refable
		],

		_computeTimeOnlyFormat: function(timeFormat) {
			return timeFormat.replace(' a', '');
		},
		_compute24HourFormat: function(timeOnlyFormat) {
			return timeOnlyFormat.replace(/h/g, 'H');
		},

		// Computes UNIX timestring from user input
		_computeValue: function(use24HourTime, timeString, timePeriod) {
			if(_allExist(use24HourTime, timeString, timePeriod)) {
				var secondsPerDay = 86400;
				var time = (use24HourTime ? timeString : timeString+' '+timePeriod);
				var wrappedTime = moment(time, this.timeFormat, true);

				if(wrappedTime.isValid()) {
					this.value = (1 * wrappedTime.seconds()) + (60 * wrappedTime.minutes()) + (3600 * wrappedTime.hours());
				}
			}
		},

		_use24Changed: function(newUse24, oldUse24) {
			if(newUse24 && newUse24 !== oldUse24) {
				this._computeValue(newUse24, this.timeString, this.timePeriod);
			}
		},

		_timeStringChanged: function(newTimeString, oldTimeString) {
			if(newTimeString && newTimeString !== oldTimeString) {
				this._computeValue(this.use24HourTime, newTimeString, this.timePeriod);
			}
		},

		_timePeriodChanged: function(newTimePeriod, oldTimePeriod) {
			if(newTimePeriod && newTimePeriod !== oldTimePeriod) {
				this._computeValue(this.use24HourTime, this.timeString, newTimePeriod);
			}
		},

		// Updates display to reflect new value
		_valueChanged: function(newValue, oldValue) {
			if(Number.isInteger(newValue) && newValue !== oldValue) {
				var newTime = moment().startOf("day").seconds(newValue);
				var time = newTime.format(this.use24HourTime ? this._24HourFormat : this._timeOnlyFormat);
				var timePeriod = newTime.format('a');

				if(this.timeString !== time) this.timeString = time;
				if(this.timePeriod !== timePeriod) this.timePeriod = timePeriod;
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
