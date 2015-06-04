/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function () {

	var _Day = function(moment, flags) {
		this.moment = moment;
		this.class = flags;
	};

	_Day.prototype = {
		get value() {
			return this.moment.unix();
		},
		get label() {
			return this.moment.date();
		}
	};

	Polymer('mm-calendar', {

		ver: "<<version>>",

		headers: [
			{ value: "S", label: "S", class: "heading" },
			{ value: "M", label: "M", class: "heading" },
			{ value: "T", label: "T", class: "heading" },
			{ value: "W", label: "W", class: "heading" },
			{ value: "T", label: "T", class: "heading" },
			{ value: "F", label: "F", class: "heading" },
			{ value: "S", label: "S", class: "heading" }
		],
		days: [],

		publish: {
			date: null,
			pairDate: null,
			viewDate: null,
			disablePast:false,
			disableFuture:false,
			useTapSelect:true,
		},

		observe: {
			'viewDate pairDate disablePast disableFuture': 'changeHandler',
			'date':'dateChangeHandler'
		},

		ready: function() {
			this.viewDate = new Date();
			if (this.date) {
				this.month = moment(this.date).month();
				this.year = moment(this.date).year();
				this.day = moment(this.date).date();
			}
		},

		incrMonth: function(e) {
			this.viewDate = moment(this.viewDate).add(1, 'month').toDate();
		},

		decrMonth: function(e) {
			this.viewDate = moment(this.viewDate).subtract(1, 'month').toDate();
		},

		updateSelection: function() {
			var end = this.pairDate ? moment(this.pairDate) : moment(this.date).add(1,'second');
			var selStart = moment.min(this.date, end);
			var selEnd = moment.max(this.date, end);
			if (selStart) selStart = moment(selStart).startOf('day');
			if (selEnd) selEnd = moment(selEnd).endOf('day');
			var selectedRange = moment().range(selStart, selEnd);

			this.days.forEach(function(day) {
				day.class.selected = selectedRange.contains(day.moment);
				if (this.date && this.pairDate) {
					day.class.first = day.moment.isSame(selStart,'day');
				}
				if (this.pairDate && this.date) {
					day.class.last = day.moment.isSame(selEnd, 'day');
				}
				if (!this.date && this.pairDate) {
					day.class.selected = day.moment.isSame(end, 'day');
				}
			}.bind(this));

		},

		boundaryDate: function(value) {
			if (typeof value === "boolean") {
				return moment().startOf('day');
			} else {
				var m = moment(value);
				if (m.isValid()) {
					return m;
				}
				return null;
			}
		},

		updateMonthView: function() {

			var mm = moment(this.viewDate).startOf('day');
			this.month = moment.months( mm.month() );
			this.year = mm.year();
			this.days = [];

			var preStart = mm.clone().date(1).startOf('week');
			var postEnd = preStart.clone().add(41, 'day'); //6 lines 42 days total
			var range = moment.range(preStart, postEnd);

			var disablePast = this.boundaryDate(this.disablePast);
			var disableFuture = this.boundaryDate(this.disableFuture);

			range.by('day', function(m) {
				var disabled = this.disablePast && m.isBefore(disablePast, 'day') || this.disableFuture && m.isAfter(disableFuture, 'day');
				this.days.push( new _Day(m, {
					disabled: disabled,
					active: m.month() == mm.month() && !disabled,
					fade: m.month() !== mm.month(),
					current: m.isSame(moment(), 'day') && m.isSame(moment(), 'month')
				}));
			}.bind(this));

		},

		changeHandler: function() {
			this.updateMonthView();
			this.updateSelection();
		},

		dateChangeHandler: function() {
			var m = moment(this.date);
			if (m.isValid()) {
				this.viewDate = m.toDate();
				this.changeHandler();
			}
		},

		handleTap: function(e) {
			var state = !e.target.parentNode.classList.contains("disabled");
			var val = e.target.getAttribute("value");
			
			if (state && val) {
				this.fire("calendar-select", {
					date: moment.unix(val).toDate(),
					target: e.target,
					unix: val
				});
				if (this.useTapSelect) {
					this.date = moment.unix(val).toDate();
					this.updateSelection();
				}
			}
		}
		
	});
})(); 