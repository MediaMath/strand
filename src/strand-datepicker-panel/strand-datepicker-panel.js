/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	var BehaviorUtils = StrandLib.BehaviorUtils;

	var exists = function(value) {
		return !(value === undefined || value === null);
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

			// Values
			value: { //
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
			time: { // Seconds since midnight UTC
				type: Number,
				value: null,
				notify: true,
			}
		},

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Falsifiable,
			StrandTraits.Refable
		],

		_dateChanged: function(newDate, oldDate) {
			if(exists(newDate)) {
				var wrappedNew = moment(newDate);
				var wrappedOld = moment(oldDate);

				if(!wrappedNew.isSame(wrappedOld)) {
					this.dateString = wrappedNew.format(this.dateFormat).toString();
					this.value = wrappedNew.unix();
				}
			}
		},

		_dateStringChanged: function(newDate, oldDate) {
			if(exists(newDate) && newDate !== oldDate) {
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
						this.value = wrappedNew.unix();
					}
				}
			}
		},

		_valueChanged: function(newValue, oldValue) {
			if(exists(newValue) && newValue !== oldValue) {
				var wrappedUnix = moment.unix(newValue);
				var secondsPerDay = 86400;
				this.dateString = wrappedUnix.format(this.dateFormat).toString();
				// this.time = wrappedUnix.diff(wrappedUnix.startOf('day'), 'seconds');
			}
		}

	});

})(window.Strand = window.Strand || {});
