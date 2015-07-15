/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function () {

	function _undef(a) {
		return a !== null && a !== undefined && a !== "";
	}

	Polymer('mm-datepicker', {
		ver:"<<version>>",
		STATE_OPENED: "opened",
		STATE_CLOSED: "closed",
		publish: {

			useTimezone: true,
			useRange: true,
			useTime: true,
			useCommit: true,
			resetOnClose: true,
			dual: true,
			dateFormat:"MM/DD/YYYY",
			timeFormat:"hh:mm a",

			rangeValue:"",
			rangePresets: null,
			rangeDescription:"Select a Predefined Date Range",
			timezoneDescription:"Select a Timezone",
			timezones:null,
			
			start: null,
			startEnabled: false,
			startUserEnabled: true,
			allowedStart: null,
			startLabel:"start",
			startEnabledLabel:null,
			//internals
			startDate: null,
			startTime: null,
			startTimePeriod:"am",
			
			end: null,
			endEnabled: false,
			endUserEnabled: true,
			allowedEnd: null,
			endLabel: "end",
			endEnabledLabel:null,
			//internals
			endDate: null,
			endTime: null,
			endTimePeriod:"am",
			
			timezone: null,

			state:'closed',
			valign: { value: "center", reflect: true },
			align: { value: "center", reflect: true },
		},

		observe: {
			"start end":"updateFields",
			"startDate endDate":"validateDates"
		},

		computed: {
			"duration":"getDuration(startDate,endDate)",
			"datesValid":"areDatesValid(startDate,endDate)"
		},

		ready: function() {
			if (this.timeFormat && this.timeFormat.indexOf("a")) {
				this.timeOnlyFormat = this.timeFormat.replace(" a","");
			}

			if (!this.startTime) {
				this.startTime = moment().startOf('day').format(this.timeOnlyFormat);
				this.startTimePeriod = moment().startOf('day').format('a');
			}
			if(!this.startDate) this.startDate = "";
			if (!this.endTime) {
				this.endTime = moment().endOf('day').format(this.timeOnlyFormat);
				this.endTimePeriod = moment().endOf('day').format('a');
			} 
			if(!this.endDate) this.endDate = "";
				
		},

		displayRange: {
			toDOM: function(value) {
				return value.toString();
			},
			toModel: function(value) {
				var range = this._rangePresets[parseInt(value)];
				if (range) {
					this.startDate = range.range.start.format(this.dateFormat);
					this.endDate = range.range.end.format(this.dateFormat);
					return value;
				}
				return value.toString();
			}
		},

		rangePresetsChanged: function(oldRangePresets, newRangePresets) {
			this._rangePresets = this.rangePresets.map(function(range, i) {
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

		calendarFilter:  {
			toDOM: function(value) {
				var m = moment(value);
				if (m.isValid()) {
					return m.format(this.dateFormat);
				}
				return value;
			},
			toModel: function(value) {
				var m = moment(value);
				if (m.isValid()) {
					return m.format(this.dateFormat);
				}
				return value;
			}
		},

		handleTap: function(e) {
			if (e.target === this.$.startCalendar) {
				this.$.startCalendar.date = e.detail.date;
			}
			if (e.target === this.$.endCalendar) {
				this.$.endCalendar.date = e.detail.date;
			}
		},

		areDatesValid: function() {
			var sd = moment(this.startDate, this.dateFormat, true);
			var ed = moment(this.endDate, this.dateFormat, true);
			return sd.isValid() && ed.isValid();
		},

		validateDates: function() {
			var sd = moment(this.startDate, this.dateFormat, true);
			var allowedStart = _undef(this.allowedStart) && moment(this.allowedStart);
			if (sd.isValid() && allowedStart) {
				if (sd.isBefore(allowedStart)) {
					this.async(function() {
						this.startDate = allowedStart.format(this.dateFormat);
					});
				}
			}
			var ed = moment(this.endDate, this.dateFormat, true);
			var allowedEnd = _undef(this.allowedEnd) && moment(this.allowedEnd);
			if (ed.isValid() && allowedStart.isValid()) {
				if (ed.isAfter(allowedEnd)) {
					this.async(function() {
						this.endDate = allowedEnd.format(this.dateFormat);
					});
				}
			}
		},

		updateFields: function() {
			this.reset();
		},

		reset: function(start, end) {
			if (!start) start = this.start;
			if (!end) end = this.end;
			var s = moment(start);
			var e = moment(end);

			if (s.isValid()) {
				this.startDate = s.format(this.dateFormat);
				this.startTime = s.format(this.timeOnlyFormat);
				this.startTimePeriod = s.format("a");
			}
			
			if (e.isValid()) {
				this.endDate = e.format(this.dateFormat);
				this.endTime = e.format(this.timeOnlyFormat);
				this.endTimePeriod = e.format("a");
			}

		},

		getDuration: function(date1, date2) {
			if (this.$ && this.$.footer) {
				this.$.footer.showMessage();
			}
			var duration = moment.duration(moment.range(date1, date2).diff('second'), 'second').humanize();
			if (duration === "a few seconds") {
				if (this.$ && this.$.footer) {
					this.$.footer.hideMessage();
				}
				return "";
			}
			return "About " + duration;
		},

		displayItem: function(value) {
			if(value) {
				return "block";
			} else {
				return "none";
			}
		},

		open: function() {
			this.state = this.STATE_OPENED;
		},

		close: function() {
			this.state = this.STATE_CLOSED;
		},

		stateChanged: function(oldVal, newValue) {
			if (oldVal === this.STATE_OPENED && newValue === this.STATE_CLOSED){
				this.fire('closed');
				if (this.resetOnClose) {
					this.reset();
				}
			}else if(newValue === this.STATE_OPENED){
				this.fire("opened");
			}
		},

		timezonesChanged: function(oldTimezones, newTimezones) {
			if (this.useTimezone && this.timezones);
			this._timezones = this.timezones.slice();
		},

		timezoneSearchChanged: function(oldTimezoneSearch, newTimezoneSearch) {
			if (this.useTimezone && this.timezones) {
				this._timezones = this.timezones.filter(function(t) {
					return t.label.toLowerCase().includes(newTimezoneSearch.toLowerCase());
				});
			}
		},
		
		closeFilter: function(instance, e) {
			if(Array.prototype.slice.call(e.path).indexOf(this) > -1 ||
				Array.prototype.slice.call(e.path).indexOf(this.$.closePanel.target) > -1) {
				e.stopImmediatePropagation();
			} else {
				instance.closeHandler();
			}
		},

		keyHandler: function(e) {
			var c = String.fromCharCode(e.keyCode);
			var ddl = this.shadowRoot.querySelector("#"+e.target.id.replace("Time","Period"));
			if (c === "A") {
				e.preventDefault();
				ddl.value = "am";
			} else if (c === "P") {
				e.preventDefault();
				ddl.value = "pm";
			}
		},

		closeLinkHandler: function(e) {
			e.preventDefault();
			this.close();
			if (this.resetOnClose) {
				this.reset();
			}
		},

		save: function(e) {

			var sd = moment(this.startDate);
			var st = moment(this.startTime + " " + this.startTimePeriod, this.timeFormat);
			sd.add({hours:st.hours(), minutes:st.minutes()});
			this.start = sd.toDate();

			var ed = moment(this.endDate);
			var et = moment(this.endTime + " " + this.endTimePeriod, this.timeFormat);
			ed.add({hours:et.hours(), minutes:et.minutes()});
			this.end = ed.toDate();

			this.fire("saved", { start:this.start, end:this.end });

			this.close();

		},

	});

})(); 