/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {
	var _Day = function (moment, flags) {
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

	scope.Calendar = Polymer({
		is: 'strand-calendar',

		properties: {
			date: {
				type: Object,
				notify: true,
				observer: '_dateChangeHandler'
			},
			pairDate: {
				type: Object,
				notify: true,
				observer: '_changeHandler'
			},
			viewDate: {
				type: Object,
				value: function() { return new Date(); },
				observer: '_changeHandler'
			},
			useTapSelect: {
				type: Boolean,
				value: true,
				reflectToAttribute: true
			},
			disableFuture: {
				type: Boolean,
				value: false,
				observer: '_changeHandler'
			},
			disablePast: {
				type: Boolean,
				value: false,
				observer: '_changeHandler'
			},
			disabled: { 
				type: Boolean,
				value: false, 
				reflectToAttribute: true 
			},
			_headers: {
				type: Array,
				value: function () {
					return [
						{
							value: 'S',
							label: 'S',
							class: 'heading'
						},
						{
							value: 'M',
							label: 'M',
							class: 'heading'
						},
						{
							value: 'T',
							label: 'T',
							class: 'heading'
						},
						{
							value: 'W',
							label: 'W',
							class: 'heading'
						},
						{
							value: 'T',
							label: 'T',
							class: 'heading'
						},
						{
							value: 'F',
							label: 'F',
							class: 'heading'
						},
						{
							value: 'S',
							label: 'S',
							class: 'heading'
						}
					];
				}
			},
			_year: {
				type: Number,
				notify: true
			},
			_month: {
				type: Number,
				notify: true
			},
			_days: {
				type: Array,
				value: function () { return []; },
				notify: true
			},
		},

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Stylable,
			StrandTraits.Refable
		],

		ready: function () {
			if (this.date) {
				this._month = moment(this.date).month();
				this._year = moment(this.date).year();
				this._day = moment(this.date).date();
			}
		},

		_incrMonth: function (e) {
			this.viewDate = moment(this.viewDate).add(1, 'month').toDate();
		},

		_decrMonth: function (e) {
			this.viewDate = moment(this.viewDate).subtract(1, 'month').toDate();
		},

		_updateSelection: function () {
			var end = this.pairDate ? moment(this.pairDate) : moment(this.date).add(1, 'second');
			var selStart = moment.min(this.date, end);
			var selEnd = moment.max(this.date, end);
			if (selStart)
				selStart = moment(selStart).startOf('day');
			if (selEnd)
				selEnd = moment(selEnd).endOf('day');
			var selectedRange = moment().range(selStart, selEnd);
			this._days.forEach(function (day) {
				day.class.selected = selectedRange.contains(day.moment);
				if (this.date && this.pairDate) {
					day.class.first = day.moment.isSame(selStart, 'day');
				}
				if (this.pairDate && this.date) {
					day.class.last = day.moment.isSame(selEnd, 'day');
				}
				if (!this.date && this.pairDate) {
					day.class.selected = day.moment.isSame(end, 'day');
				}
			}.bind(this));
		},

		_boundaryDate: function (value) {
			if (typeof value === 'boolean') {
				return moment().startOf('day');
			} else {
				var m = moment(value);
				if (m.isValid()) {
					return m;
				}
				return null;
			}
		},

		_updateMonthView: function () {
			var mm = moment(this.viewDate).startOf('day');
			this._month = moment.months(mm.month());
			this._year = mm.year();
			this._days = [];
			var preStart = mm.clone().date(1).startOf('week');
			var postEnd = preStart.clone().add(41, 'day');
			//6 lines 42 days total
			var range = moment.range(preStart, postEnd);
			var disablePast = this._boundaryDate(this.disablePast);
			var disableFuture = this._boundaryDate(this.disableFuture);
			range.by('day', function (m) {
				var disabled = this.disablePast && m.isBefore(disablePast, 'day') || this.disableFuture && m.isAfter(disableFuture, 'day');
				var d = new _Day(m, {
					day: true,
					disabled: disabled,
					active: m.month() == mm.month() && !disabled,
					fade: m.month() !== mm.month(),
					current: m.isSame(moment(), 'day') && m.isSame(moment(), 'month')
				});
				this.push('_days',d);
			}.bind(this));
		},

		_changeHandler: function () {
			this._updateMonthView();
			this._updateSelection();
		},

		_dateChangeHandler: function () {
			var m = moment(this.date);
			if (m.isValid()) {
				this.viewDate = m.toDate();
				this._changeHandler();
			}
		},

		_handleTap: function (e) {
			var state = !e.target.parentNode.classList.contains('disabled');
			var val = e.target.getAttribute('value');
			if (state && val) {
				this.fire('calendar-select', {
					date: moment.unix(val).toDate(),
					target: e.target,
					unix: val
				});
				if(this.useTapSelect) {
					this.date = moment.unix(val).toDate();
					this._updateSelection();
				}
			}
		},

		_dayId: function(day) {
			return 'day' + day.value;
		},

		_dayClass: function(day) {
			return this.classBlock(day.class);
		}

	});
})(window.Strand = window.Strand || {});