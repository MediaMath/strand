/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	var DataUtils = StrandLib.DataUtils;
	var DateTimeUtils = StrandLib.DateTimeUtils;
	var BehaviorUtils = StrandLib.BehaviorUtils;

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
				type: String,
				value: 'hh:mm a'
			},

			// Values
			value: {
				type: String,
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

			time: {
				type: String,
				notify: true,
				observer: '_timeChanged'
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
			},

			_dateTimeFormat: {
				type: String,
				computed: '_computeDateTimeFormat(useTime, dateFormat, timeFormat)'
			}
		},

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Falsifiable,
			StrandTraits.Refable
		],

		_computeDateTimeFormat: function(useTime, dateFormat, timeFormat) {
			return dateFormat + (useTime ? ' '+timeFormat : '');
		},

		_updateValue: function(dateString, timeString, useTime) {
			dateString = dateString || this.dateString;
			timeString = timeString || this.time;
			useTime = useTime || this.useTime;
			
			this.value = dateString + (useTime ? ' ' + timeString : '');
		},

		_dateChanged: function(newDate, oldDate) {
			if(DataUtils.isDef(newDate)) {
				var wrappedNew = moment(newDate);
				var wrappedOld = moment(oldDate);

				if(!wrappedNew.isSame(wrappedOld)) {
					this.dateString = wrappedNew.format(this.dateFormat);
					this._updateValue();
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
					var formatted = wrappedNew.format(this.dateFormat);
					if(newDate !== formatted) {
						this.dateString = formatted;
					}
					// Don't do anything if the date didn't actually change
					else if(!wrappedNew.isSame(wrappedOld)) {
						this.date = wrappedNew.toDate();
						this._updateValue();
					}
				}
			}
		},

		_valueChanged: function(newValue, oldValue) {
			if(DataUtils.isDef(newValue) && newValue !== oldValue) {
				var wrappedNew = DateTimeUtils.ensureMoment(newValue);
				this.dateString = wrappedNew.format(this.dateFormat);
				this.time = wrappedNew.format(this.timeFormat);
			}
		},

		_timeChanged: function(newTime, oldTime) {
			if(newTime && newTime !== oldTime) {
				var wrappedDate = moment(this.dateString, this.dateFormat, true);
				var wrappedNew = moment(newTime, this.timeFormat);
				if(wrappedNew.isValid() && wrappedDate.isValid()) {
					this._updateValue(wrappedDate.format(this.dateFormat), newTime);
				}
			}
		},

	});

})(window.Strand = window.Strand || {});
