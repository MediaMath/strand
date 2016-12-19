/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	var BehaviorUtils = StrandLib.BehaviorUtils;
	var DataUtils = StrandLib.DataUtils;
	var DateTimeUtils = StrandLib.DateTimeUtils;

	function _clampDates(value, lower, upper) {
		var tmp = DateTimeUtils.ensureMoment(value);
		if(lower) tmp = moment.max(DateTimeUtils.ensureMoment(lower), tmp);
		if(upper) tmp = moment.min(DateTimeUtils.ensureMoment(upper), tmp);
		return tmp;
	}

	scope.Datepicker = Polymer({
		is: 'strand-datepicker',

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
				observer: '_displayRange'
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
				observer: '_startChanged'
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
			_startString: {
				type: String,
				notify: true,
				observer: '_boundStart'
			},
			_startJSDate: {
				type: Object,
				notify: true
			},

			// End
			end: {
				type: Object,
				notify: true,
				observer: '_endChanged'
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
			_endString: {
				type: String,
				notify: true,
				observer: '_boundEnd'
			},
			_endJSDate: {
				type: Object,
				notify: true
			},

			_compositeAllowedStart: {
				type: Object,
				computed: '_computeStartBound(_startString, allowedStart)'
			},
			_compositeAllowedEnd: {
				type: Object,
				computed: '_computeEndBound(_endString, allowedEnd)'
			},

			_duration: {
				computed: '_getDuration(_startString, _endString)'
			},
			_dateTimeFormat: {
				type: String,
				computed: '_computeDateTimeFormat(useTime, dateFormat, timeFormat)'
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

		_computeDateTimeFormat: function(useTime, dateFormat, timeFormat) {
			return dateFormat + (useTime ? ' '+timeFormat : '');
		},

		// Lifecycle
		attached: function() {
			if(this.useCommit) this.classList.add('has-footer');
		},

		_format: function(d, format) {
			if(!format) {
				// if no format provided default to the format set per element instance
				format = this.useTime ? this._dateTimeFormat : this.dateFormat;
			}
			return DateTimeUtils.ensureMoment(d).format(format);
		},

		// Range methods
		_findRange: function(startString, endString) {
			if(this.useRange && this._rangePresets) {
				var found = "";
				var wrappedStart = DateTimeUtils.ensureMoment(startString);
				var wrappedEnd = DateTimeUtils.ensureMoment(endString);

				if(wrappedStart.isValid() && wrappedEnd.isValid()) {
					for(var i=this._rangePresets.length-1; i>=0; i--) {
						var preset = this._rangePresets[i];
						if(preset.range.start.isSame(wrappedStart, "day") && preset.range.end.isSame(wrappedEnd, "day")) {
							found = String(preset.label);
							break;
						}
					}
				}
				return found;
			}
		},

		_displayRange: function(newRange, oldRange) {
			if(newRange !== oldRange) {
				var range;
				if(this._rangePresets)
					range = this._rangePresets.filter(function(range) { return range.label === newRange })[0];
				if (range) {
					this._rangeValueFlag = true;
					this._startString = this._format(range.range.start);
					this._endString = this._format(range.range.end);
					this._rangeValueFlag = false;
				}
			}
		},

		_rangePresetsChanged: function(newRangePresets, oldRangePresets) {
			if(newRangePresets) {
				this._rangePresets = newRangePresets.map(function(range, i) {
					var start = moment(range.start, this.dateFormat, true);
					var end = moment(range.end, this.dateFormat, true);
					return {
						index: i,
						range: moment.range(start, end),
						label: range.name
					};
				});

				if(this._startString && this._endString) this.rangeValue = this._findRange(this._startString, this._endString);
			}
		},

		// Date bounds
		_computeStartBound: function(startString, allowedStart) {
			if(startString) {
				var wrappedStart = DateTimeUtils.ensureMoment(startString);
				var wrappedAllowed = DateTimeUtils.ensureMoment(allowedStart);
				if(wrappedStart.isValid() && wrappedAllowed.isValid()) {
					return moment.max(wrappedStart, wrappedAllowed);
				} else if(wrappedStart.isValid()) {
					return wrappedStart;
				} else {
					return false;
				}
			}
		},
		_computeEndBound: function(endString, allowedEnd) {
			if(endString) {
				var wrappedEnd = DateTimeUtils.ensureMoment(endString);
				var wrappedAllowed = DateTimeUtils.ensureMoment(allowedEnd);
				if(wrappedEnd.isValid() && wrappedAllowed.isValid()) {
					return moment.min(wrappedEnd, wrappedAllowed);
				} else if(wrappedEnd.isValid()) {
					return wrappedEnd;
				} else {
					return false;
				}
			}
		},

		_boundStart: function(newStart, oldStart) {
			if(DataUtils.isDef(newStart) && newStart !== oldStart) {
				this._startString = this._format(_clampDates(newStart, this.allowedStart, this._compositeAllowedEnd))
				if(!this._rangeValueFlag) this.rangeValue = this._findRange(this._startString, this._endString);
				if(!this.useCommit) this.save();
			}
		},

		_boundEnd: function(newEnd, oldEnd) {
			if(DataUtils.isDef(newEnd) && newEnd !== oldEnd) {
				this._endString = this._format(_clampDates(newEnd, this._compositeAllowedStart, this.allowedEnd));
				if(!this._rangeValueFlag) this.rangeValue = this._findRange(this._startString, this._endString);
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


		_startChanged: function() {
			this.debounce('reset', this.reset);
		},

		_endChanged: function() {
			this.debounce('reset', this.reset);
		},

		// Footer
		_getDuration: function(startString, endString) {
			var footer = this.$$('#footer');
			var date1 = DateTimeUtils.ensureMoment(startString);
			var date2 = DateTimeUtils.ensureMoment(endString);
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
			var wrappedStart = DateTimeUtils.ensureMoment(start || this.start);
			var wrappedEnd = DateTimeUtils.ensureMoment(end || this.end);
			var formattedStart = this._format(wrappedStart);
			var formattedEnd = this._format(wrappedEnd);

			if (wrappedStart.isValid() && formattedStart !== this._startString) {
				this._startString = formattedStart;
			}

			if (wrappedEnd.isValid() && formattedEnd !== this._endString) {
				this._endString = formattedEnd;
			}
		},

		save: function(silent) {
			var oldStart = DateTimeUtils.ensureMoment(this.start);
			var oldEnd = DateTimeUtils.ensureMoment(this.end);
			var wrappedStart = DateTimeUtils.ensureMoment(this._startString);
			var wrappedEnd = DateTimeUtils.ensureMoment(this._endString);

			if (wrappedStart.isValid() && !wrappedStart.isSame(oldStart)) {
				this.start = wrappedStart.toDate();
			}

			if (wrappedEnd.isValid() && !wrappedEnd.isSame(oldEnd)) {
				this.end = wrappedEnd.toDate();
			}

			this.fire('saved', { start:this.start, end:this.end });

			if(this.useCommit) {
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
