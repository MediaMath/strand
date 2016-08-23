/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	var BehaviorUtils = StrandLib.BehaviorUtils;
	var DataUtils = StrandLib.DataUtils;

	function _ensureMoment(d) {
		if(moment.isMoment(d)) {
			// Already a moment object
			return d;
		} else if(DataUtils.isType(d, 'date')) {
			// Construct moment from date
			return moment(d);
		} else if(DataUtils.isType(d, 'string')) {
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

	function _clampDates(value, lower, upper) {
		var tmp = _ensureMoment(value);
		if(lower) tmp = moment.max(_ensureMoment(lower), tmp);
		if(upper) tmp = moment.min(_ensureMoment(upper), tmp);
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
			_startUnix: {
				type: Number,
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
			_endUnix: {
				type: Number,
				notify: true,
				observer: '_boundEnd'
			},
			_endJSDate: {
				type: Object,
				notify: true
			},

			_compositeAllowedStart: {
				type: Object,
				computed: '_computeStartBound(_startUnix, allowedStart)'
			},
			_compositeAllowedEnd: {
				type: Object,
				computed: '_computeEndBound(_endUnix, allowedEnd)'
			},

			_duration: {
				computed: '_getDuration(_startUnix, _endUnix)'
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
			if(this.useCommit) this.classList.add('has-footer');
		},

		// Range methods
		_findRange: function(startUnix, endUnix) {
			if(this.useRange && this._rangePresets) {
				var found = "";
				var wrappedStart = _ensureMoment(startUnix);
				var wrappedEnd = _ensureMoment(endUnix);

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
					this._startUnix = _ensureMoment(range.range.start).unix();
					this._endUnix = _ensureMoment(range.range.end).unix();
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

				if(this._startUnix && this._endUnix) this.rangeValue = this._findRange(this._startUnix, this._endUnix);
			}
		},

		// Date bounds
		_computeStartBound: function(start, allowedStart) {
			var wrappedStart = _ensureMoment(start);
			var wrappedAllowed = _ensureMoment(allowedStart);

			if(wrappedStart.isValid() && wrappedAllowed.isValid()) {
				return moment.max(wrappedStart, wrappedAllowed);
			} else if(wrappedStart.isValid()) {
				return wrappedStart;
			} else {
				return false;
			}
		},

		_computeEndBound: function(end, allowedEnd) {
			var wrappedEnd = _ensureMoment(end);
			var wrappedAllowed = _ensureMoment(allowedEnd);

			if(wrappedEnd.isValid() && wrappedAllowed.isValid()) {
				return moment.min(wrappedEnd, wrappedAllowed);
			} else if(wrappedEnd.isValid()) {
				return wrappedEnd;
			} else {
				return false;
			}
		},

		_boundStart: function(newStart, oldStart) {
			if(DataUtils.isDef(newStart) && newStart !== oldStart) {
				this._startUnix = _clampDates(newStart, this.allowedStart, this._compositeAllowedEnd).unix();
				if(!this._rangeValueFlag) this.rangeValue = this._findRange(this._startUnix, this._endUnix);
				if(!this.useCommit) this.save();
			}
		},

		_boundEnd: function(newEnd, oldEnd) {
			if(DataUtils.isDef(newEnd) && newEnd !== oldEnd) {
				this._endUnix = _clampDates(newEnd, this._compositeAllowedStart, this.allowedEnd).unix();
				if(!this._rangeValueFlag) this.rangeValue = this._findRange(this._startUnix, this._endUnix);
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
		_getDuration: function(startUnix, endUnix) {
			var footer = this.$$('#footer');
			var date1 = moment.unix(startUnix);
			var date2 = moment.unix(endUnix);
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
			var wrappedStart = _ensureMoment(start || this.start);
			var wrappedEnd = _ensureMoment(end || this.end);

			if (wrappedStart.isValid() && wrappedStart.unix() !== this._startUnix) {
				this._startUnix = wrappedStart.unix();
			}

			if (wrappedEnd.isValid() && wrappedEnd.unix() !== this._endUnix) {
				this._endUnix = wrappedEnd.unix();
			}
		},

		save: function(silent) {
			var oldStart = _ensureMoment(this.start);
			var oldEnd = _ensureMoment(this.end);
			var wrappedStart = _ensureMoment(this._startUnix);
			var wrappedEnd = _ensureMoment(this._endUnix);

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
