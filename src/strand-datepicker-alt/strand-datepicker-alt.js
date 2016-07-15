/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	var BehaviorUtils = StrandLib.BehaviorUtils;

	var exists = function(a) {
		return !(a === undefined || a === null);
	}

	var isDate = function(d) {
		return d instanceof Date;
	}

	var isString = function(s) {
		return s instanceof String;
	}

	var ensureMoment = function(d) {
		if(moment.isMoment(d)) {
			// Already a moment object
			return d;
		} else if(isDate(d)) {
			// Construct moment from date
			return moment(d);
		} else if(isString(d)) {
			// Attempt to parse datestring
			return moment(new Date(d));
		} else if(Number.isFinite(d)) {
			// Construct moment from timestamp
			return moment.unix(d);
		} else {
			// If all else fails return an invalid moment
			return moment('Invalid date','Invalid date',true);
		}
	}

	var clampDates = function(value, lower, upper) {
		var tmp = ensureMoment(value);
		if(lower) tmp = moment.max(ensureMoment(lower), tmp);
		if(upper) tmp = moment.min(ensureMoment(upper), tmp);
		return tmp;
	}

	scope.Datepicker = Polymer({
		is: 'strand-datepicker-alt',

		properties: {
			// Config
			useTimezone: {
				type: Boolean,
				value: true
			},
			useRange: {
				type: Boolean,
				value: true
			},
			useTime: {
				type: Boolean,
				value: true
			},
			useCommit: {
				type: Boolean,
				value: true
			},
			useDuration: {
				type: Boolean,
				value: true,
			},
			resetOnClose: {
				type: Boolean,
				value: true
			},
			dual: {
				type: Boolean,
				value: true,
				reflectToAttribute: true
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

			// Ranges
			rangeDescription: {
				type: String,
				value: 'Select a Predefined Date Range'
			},
			rangeValue: {
				type: String,
				observer: '_displayRange',
			},
			rangePresets: {
				type: Array,
				observer: '_rangePresetsChanged'
			},

			// Footer
			closeLabel: {
				type: String,
				value: "Close"
			},
			saveLabel: {
				type: String,
				value: "Save",
			},

			// Timezone
			timezoneDescription: {
				type: String,
				value: 'Select a Timezone'
			},
			timezones: {
				type: Array
			},
			timezone: {
				type: Object
			},

			// Start
			start: {
				type: Object,
				notify: true,
			},
			startEnabled: {
				type: Boolean,
				value: true
			},
			startUserEnabled: {
				type: Boolean,
				value: true
			},
			allowedStart: {
				type: Object,
				value: null
			},
			startLabel: {
				type: String,
				value: 'start'
			},
			startEnabledLabel: {
				type: String
			},
			startDate: {
				type: String,
				notify: true
			},
			startTime: {
				type: String,
				notify: true
			},
			startTimePeriod:{
				type: String,
				notify: true
			},
			startUnix: {
				type: Number,
				notify: true,
				observer: '_boundStart'
			},
			startJSDate: {
				type: Object,
				notify: true
			},

			// End
			end: {
				type: Object,
				value: null,
				notify: true
			},
			endEnabled: {
				type: Boolean,
				value: true
			},
			endUserEnabled: {
				type: Boolean,
				value: true
			},
			allowedEnd: {
				type: Object,
				value: null
			},
			endLabel: {
				type: String,
				value: 'end'
			},
			endEnabledLabel:{
				type: String,
				value: null
			},
			endDate: {
				type: String,
				value: null,
				notify: true
			},
			endTime: {
				type: String,
				notify: true
			},
			endTimePeriod: {
				type: String,
				notify: true
			},
			endUnix: {
				type: Number,
				notify: true,
				observer: '_boundEnd'
			},
			endJSDate: {
				type: Object,
				notify: true
			},

			_compositeAllowedStart: {
				type: Object,
				computed: '_computeStartBound(startJSDate, allowedStart)'
			},
			_compositeAllowedEnd: {
				type: Object,
				computed: '_computeEndBound(endJSDate, allowedEnd)'
			},

			_duration: {
				computed: '_getDuration(startJSDate, endJSDate)'
			}
		},

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.AutoTogglable,
			StrandTraits.Stackable,
			StrandTraits.PositionablePanel,
			StrandTraits.Falsifiable,
			StrandTraits.Refable
		],

		// Lifecycle
		attached: function() {
			if (this.useCommit) this.classList.add('has-footer');
		},

		// Range methods
		_displayRange: function(value) {
			var range;
			if(this._rangePresets)
				range = this._rangePresets.filter(function(range) { return range.label === value })[0];
			if (range) {
				this.startUnix = ensureMoment(range.range.start).unix();
				this.endUnix = ensureMoment(range.range.end).unix();
				this.rangePresetsFlag = true;
			}
		},

		_rangePresetsChanged: function(newRangePresets, oldRangePresets) {
			if(newRangePresets) this._rangePresets = newRangePresets.map(function(range, i) {
				var start = moment(range.start, this.dateFormat, true);
				var end = moment(range.end, this.dateFormat, true);
				return {
					index: i,
					range: moment.range(start, end),
					label: range.name
				};
			});
		},

		// Date bounds
		_computeStartBound: function(start, allowedStart) {
			var wrappedStart = ensureMoment(start);
			var wrappedAllowed = ensureMoment(allowedStart);

			if(wrappedStart.isValid() && wrappedAllowed.isValid()) {
				return moment.max(wrappedStart, wrappedAllowed);
			} else if(wrappedStart.isValid()) {
				return wrappedStart;
			} else {
				return false;
			}
		},

		_computeEndBound: function(end, allowedEnd) {
			var wrappedEnd = ensureMoment(end);
			var wrappedAllowed = ensureMoment(allowedEnd);

			if(wrappedEnd.isValid() && wrappedAllowed.isValid()) {
				return moment.min(wrappedEnd, wrappedAllowed);
			} else if(wrappedEnd.isValid()) {
				return wrappedEnd;
			} else {
				return false;
			}
		},

		_boundStart: function(newStart, oldStart) {
			if(exists(newStart) && newStart !== oldStart) {
				this.startUnix = clampDates(newStart, this.allowedStart, this._compositeAllowedEnd).unix();
				if(!this.useCommit) this.save();
			}
		},

		_boundEnd: function(newEnd, oldEnd) {
			if(exists(newEnd) && newEnd !== oldEnd) {
				this.endUnix = clampDates(newEnd, this._compositeAllowedStart, this.allowedEnd).unix();
				if(!this.useCommit) this.save();
			}
		},

		// Timezones
		_timezonesChanged: function(oldTimezones, newTimezones) {
			if (this.useTimezone && this.timezones);
			this._timezones = this.timezones.slice();
		},

		_timezoneSearchChanged: function(oldTimezoneSearch, newTimezoneSearch) {
			if (this.useTimezone && this.timezones) {
				this._timezones = this.timezones.filter(function(t) {
					return t.label.toLowerCase().includes(newTimezoneSearch.toLowerCase());
				});
			}
		},

		// Footer
		_getDuration: function(date1, date2) {
			var footer = this.$$('#footer');
			if (footer && this.useDuration) footer.showMessage();
			var duration = moment.duration(moment.range(date1, date2).diff('second'), 'second').humanize();
			if (duration === 'a few seconds') {
				if (footer) footer.hideMessage();
				return '';
			}
			return 'About ' + duration;
		},

		_areDateStringsValid: function() {
			var sd = moment(this.startDate, this.dateFormat, true);
			var ed = moment(this.endDate, this.dateFormat, true);
			return sd.isValid() && (!this.dual || ed.isValid());
		},

		_closeLinkHandler: function(e) {
			e.preventDefault();
			this.close();
		},

		_saveButtonHandler: function(e) {
			e.preventDefault();
			this.save();
		},

		// Public
		reset: function(start, end) {
			var wrappedStart = ensureMoment(start || this.start);
			var wrappedEnd = ensureMoment(end || this.end);

			if (wrappedStart.isValid() && wrappedStart.unix() !== this.startUnix) {
				this.startUnix = wrappedStart.unix();
			}

			if (wrappedEnd.isValid() && wrappedEnd.unix() !== this.endUnix) {
				this.endUnix = wrappedEnd.unix();
			}
		},

		save: function(silent) {
			var oldStart = ensureMoment(this.start);
			var oldEnd = ensureMoment(this.end);
			var wrappedStart = ensureMoment(this.startUnix);
			var wrappedEnd = ensureMoment(this.endUnix);

			if (wrappedStart.isValid() && !wrappedStart.isSame(oldStart)) {
				this.start = wrappedStart.toDate();
			}

			if (wrappedEnd.isValid() && !wrappedEnd.isSame(oldEnd)) {
				this.end = wrappedEnd.toDate();
			}

			if(!silent) {
				this.fire('saved', { start:this.start, end:this.end });
				this.close();
			}
		},

		close: function(silent) {
			var inherited = BehaviorUtils.findSuper(StrandTraits.PositionablePanel, 'close');
			if(this.resetOnClose) this.reset();
			inherited.call(this, silent);
		}

	});

})(window.Strand = window.Strand || {});
