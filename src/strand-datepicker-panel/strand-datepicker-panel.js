/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	var SECONDS_PER_DAY = 60*60*24;
	var DataUtils = StrandLib.DataUtils;
	var BehaviorUtils = StrandLib.BehaviorUtils;

	function _startOfDay(timestamp) {
		return Math.floor(timestamp/SECONDS_PER_DAY) * SECONDS_PER_DAY;
	}

	scope.DatepickerPanel = Polymer({
		is: 'strand-datepicker-panel',

		properties: {
			// Configuration
			label: {
				type: String,
				value: 'start'
			},
			userEnabledLabel: {
				type: String,
				value: null
			},
			enabled: {
				type: Boolean,
				value: true
			},
			userEnabled: {
				type: Boolean,
				value: true
			},
			useTime: {
				type: Boolean,
				value: true
			},

			// Formatting
			dateFormat: {
				type: String,
				value: 'MM/DD/YYYY'
			},
			timeFormat: {
				type: String
			},

			// Values
			value: { // datetime as unix timestamp
				type: Number,
				value: null,
				notify: true,
				observer: '_valueChanged'
			},
			date: {
				type: Object,
				value: null,
				notify: true,
				observer: '_dateChanged',
			},
			dateString: { // Date as string
				type: String,
				value: null,
				notify: true,
				observer: '_dateStringChanged'
			},

			time: { // Seconds since midnight
				type: Number,
				notify: true,
				observer: '_timeChanged'
			},
			timeString: {
				type: String,
				notify: true
			},
			timePeriod: {
				type: String,
				notify: true
			},

			// Pass through for strand-calendar
			pairDate: {
				type: Object,
				notify: true
			},
			disablePast: {
				type: Object,
				notify: true
			},
			disableFuture: {
				type: Object,
				notify: true
			}
		},

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Falsifiable,
			StrandTraits.Refable
		],

		_dateChanged: function(newDate, oldDate) {
			if(DataUtils.isDef(newDate)) {
				var wrappedNew = moment(newDate);
				var wrappedOld = moment(oldDate);

				if(!wrappedNew.isSame(wrappedOld)) {
					this.dateString = wrappedNew.format(this.dateFormat).toString();
					this.value = wrappedNew.startOf("day").seconds(this.time || 0).format();
				}
			}
		},

		_dateStringChanged: function(newDate, oldDate) {
			if(DataUtils.isDef(newDate) && newDate !== oldDate) {
				var wrappedNew = moment(newDate, this.dateFormat, true);
				var wrappedOld = moment(oldDate, this.dateFormat, true);

				// Wait until date is valid before doing anything
				if(wrappedNew.isValid()) {
					// Update String format if not consistent with this.dateFormat
					var formatted = wrappedNew.format(this.dateFormat).toString();
					if(newDate !== formatted) {
						this.dateString = formatted;
					}
					// Don't do anything if the date didn't actually change
					else if(!wrappedNew.isSame(wrappedOld)) {
						this.date = wrappedNew.toDate();
						this.value = wrappedNew.startOf("day").seconds(this.time || 0).format();
					}
				}
			}
		},

		_valueChanged: function(newValue, oldValue) {
			if(DataUtils.isDef(newValue) && newValue !== oldValue) {
				var wrappedNew = moment(newValue);
				// dateString change handler will change Date object
				this.dateString = wrappedNew.format(this.dateFormat).toString();
				this.time = (1 * wrappedNew.seconds()) + (60 * wrappedNew.minutes()) + (3600 * wrappedNew.hours());
			}
		},

		_timeChanged: function(newTime, oldTime) {
			if(newTime && newTime !== oldTime) {
				this.value = moment(this.value).startOf("day").seconds(newTime || 0).format();
			}
		},

	});

})(window.Strand = window.Strand || {});
