/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	var _ = undefined;

	function _toCamelCase(s) {
		return s.split('-').reduce(function(prev,curr,index,arr) {
			return (index > 0) ? prev+curr[0].toUpperCase()+curr.substring(1) : prev+curr;
		});
	};

	function _undef(a) {
		return a !== null && a !== undefined && a !== '';
	};

	var BehaviorUtils = StrandLib.BehaviorUtils;

	scope.Datepicker = Polymer({
		is: 'strand-datepicker',

		properties: {
			closeLabel: {
				type: String,
				value: "Close"
			},
			saveLabel: {
				type: String,
				value: "Save",
			},
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
			dateFormat: {
				type: String,
				value: 'MM/DD/YYYY'
			},
			timeFormat: {
				type: String,
				value: 'hh:mm a'
			},
			timeOnlyFormat: {
				computed: '_computeTimeOnlyFormat(timeFormat)'
			},

			rangeValue: {
				type: String,
				value: '',
				observer: '_displayRange',
			},
			rangePresets: {
				type: Array,
				value: null,
				observer: '_rangePresetsChanged'
			},
			rangeDescription: {
				type: String,
				value: 'Select a Predefined Date Range'
			},
			timezoneDescription: {
				type: String,
				value: 'Select a Timezone'
			},
			timezones: {
				type: Array,
				value: null
			},
			
			start: {
				type: Object,
				value: function() { return null; },
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
				type: String,
				value: null
			},
			//internals
			startDate: {
				type: String,
				value: null,
				notify: true,
				observer: '_validateStart'
			},
			startTime: {
				type: String,
				value: function() { return moment().startOf('day').format('hh:mm'); },
				notify: true,
			},
			startTimePeriod:{
				type: String,
				value: function() { return moment().startOf('day').format('a'); },
				notify: true
			},
			end: {
				type: Object,
				value: function() { return null; },
				notify: true,
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
				notify: true,
				observer: '_validateEnd'
			},
			timezone: {
				type: Object,
				value: null
			},
			state: {
				type: String,
				value: 'closed'
			},
			endTime: {
				type: String,
				value: function() { return moment().endOf('day').format('hh:mm'); },
				notify: true,
			},
			endTimePeriod:{
				type: String,
				value: function() { return moment().endOf('day').format('a'); },
				notify: true
			},
			//internals
			_duration: {
				computed: '_getDuration(startDate,endDate)'
			},
			_datesValid: {
				computed: '_areDatesValid(startDate,endDate)'
			}
		},

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.AutoTogglable,
			StrandTraits.Stackable,
			StrandTraits.PositionablePanel,
			StrandTraits.Debouncable,
			StrandTraits.Falsifiable,
			StrandTraits.Refable
		],

		debouncers: {
			compStart: {
				keys: ['start','start-date','start-time','start-time-period'],
				type: 'some',
				callback: function(key, debouncer) { this._updateFields(key, debouncer); }
			},
			compEnd: {
				keys: ['end','end-date','end-time','end-time-period'],
				type: 'some',
				callback: function(key, debouncer) { this._updateFields(key, debouncer); }
			}
		},

		_shouldUseRange: function(dual, useRange) { return dual && useRange },

		_disableFuture: function(dual, endDate, allowedEnd) { return (dual) ? endDate : allowedEnd },

		_computeTimeOnlyFormat: function(timeFormat) {
			return timeFormat.replace(' a','');
		},

		_displayRange: function(value) {
			var range;
			if(this._rangePresets)
				range = this._rangePresets.filter(function(range) { return range.label === value })[0];
			if (range) {
				this.start = range.range.start.format(this.dateFormat);
				this.end = range.range.end.format(this.dateFormat);
				this.rangePresetsFlag = true;
			}
		},

		_rangePresetsChanged: function(newRangePresets, oldRangePresets) {
			if(newRangePresets) this._rangePresets = newRangePresets.map(function(range, i) {
				var start = moment(range.start); 
				var end = moment(range.end);
				return {
					index: i,
					range: moment.range(start, end),
					label: range.name,
					value: i
				};
			});		
		},

		_calendarFilter: function(value) {
			var m = moment(value);
			if (m.isValid()) {
				return m.format(this.dateFormat);
			}
			return value;
		},

		_handleTap: function(e) {
			var sc = this.$$('#startCalendar')
			if (e.target === sc) {
				sc.date = this._calendarFilter(e.detail.date);
			}
			var ec = this.$$('#endCalendar');
			if (e.target === ec) {
				ec.date = this._calendarFilter(e.detail.date);
			}
		},

		_areDatesValid: function() {
			var sd = moment(this.startDate, this.dateFormat, true);
			var ed = moment(this.endDate, this.dateFormat, true);
			return sd.isValid() && (!this.dual || ed.isValid());
		},

		_validateStart: function() {
			if(this.startDate instanceof Date) {
				this.startDate = this._calendarFilter(this.startDate);
				return;
			}
			var sd = moment(this.startDate, this.dateFormat, true);
			var allowedStart = _undef(this.allowedStart) && moment(this.allowedStart);
			if (sd.isValid()) {
				if (allowedStart && allowedStart.isValid() && sd.isBefore(allowedStart)) {
					this.async(function() {
						this.startDate = allowedStart.format(this.dateFormat);
					});
				}
			}
		},

		_validateEnd: function() {
			if(this.endDate instanceof Date) {
				this.endDate = this._calendarFilter(this.endDate);
				return;
			}
			var ed = moment(this.endDate, this.dateFormat, true);
			var allowedEnd = _undef(this.allowedEnd) && moment(this.allowedEnd);
			if (ed.isValid()) {
				if (allowedEnd && allowedEnd.isValid() && ed.isAfter(allowedEnd)) {
					this.async(function() {
						this.endDate = allowedEnd.format(this.dateFormat);
					});
				}
			}
		},

		_updateFields: function(key, debouncer) {
			var shouldSave = !this.useCommit,
				key = _toCamelCase(key),
				value = this.get(key);

			switch(key) {
				case 'start':
				case 'end':
					this.reset();
				break;

				case 'startDate':
				case 'endDate':
					shouldSave = shouldSave && value.length == 10 && moment(value).isValid();
				break;

				case 'startTime':
				case 'endTime':
					shouldSave = shouldSave && value.length == 5 && moment(value).isValid();
				break;
			}
			if(shouldSave) this._save(_,_,true);
		},

		reset: function(start, end) {
			if (!_undef(start)) start = this.start || null;
			if (!_undef(end)) end = this.end || null;
			var s = moment(start);
			var e = moment(end);

			if (s.isValid()) {
				this.startDate = s.format(this.dateFormat);
				this.startTime = s.format(this.timeOnlyFormat);
				this.startTimePeriod = s.format('a');
			}
			
			if (e.isValid()) {
				this.endDate = e.format(this.dateFormat);
				this.endTime = e.format(this.timeOnlyFormat);
				this.endTimePeriod = e.format('a');
			}
		},

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

		close: function(silent) {
			var inherited = BehaviorUtils.findSuper(StrandTraits.PositionablePanel, 'close');
			if(this.resetOnClose) this.reset();
			inherited.apply(this,[silent]);
		},

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

		_keyHandler: function(e) {
			var c = String.fromCharCode(e.keyCode),
				normalized = Polymer.dom(e);
			if (c === 'A') {
				e.preventDefault();
				this.set(normalized.localTarget.id + 'Period','am');
			} else if (c === 'P') {
				e.preventDefault();
				this.set(normalized.localTarget.id + 'Period','pm');
			}
		},

		attached: function() {
			if (this.useCommit) this.classList.add('has-footer');
		},

		_closeLinkHandler: function(e) {
			e.preventDefault();
			this.close();
			if (this.resetOnClose) {
				this.reset();
			}
		},

		_save: function(e,_,silent) {
			var sd = moment(this.startDate);
			var st = moment(this.startTime + ' ' + this.startTimePeriod, this.timeFormat);
			sd.set({'hours': st.hours(), 'minutes': st.minutes()});

			var ed = moment(this.endDate);
			var et = moment(this.endTime + ' ' + this.endTimePeriod, this.timeFormat);
			ed.set({'hours': et.hours(), 'minutes': et.minutes()});

			this.start = sd.toDate();
			this.end = ed.toDate();

			if(!silent) {
				this.fire('saved', { start:this.start, end:this.end });
				this.close();
			}
		},

		save: function() {
			this._save();
		}

	});

})(window.Strand = window.Strand || {});  