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
				value: false
			},

			_time: {
				type: String,
				value: null,
				notify: true
			},
			_timePeriod: {
				type: String,
				value: 'AM',
				notify: true
			}
		},

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Falsifiable,
			StrandTraits.Refable
		],

		observers: [
			'_computeValue(use24HourTime, _time, _timePeriod)'
		],

		_computeValue: function(use24HourTime, time, timePeriod) {
			time = time && time.trim();
			timePeriod = timePeriod && timePeriod.trim();

			var newValue = use24HourTime ? time : time + ' ' + timePeriod;
			if(this.value !== newValue) this.set('value', newValue);
		},

		_valueChanged: function(newValue, oldValue) {
			var newTime = moment(newValue, this._timeFormat, true);

			if(newTime.isValid()) {
				var hours = newTime.hours();
				var clockHours = hours % 12;
				var minutes = newTime.minutes();

				this._time = this.use24HourTime ? hours+':'+minutes : clockHours+':'+minutes;
				this._timePeriod = (clockHours > 11) ? 'AM' : 'PM';
			};
		}
	});

})(window.Strand = window.Strand || {});
