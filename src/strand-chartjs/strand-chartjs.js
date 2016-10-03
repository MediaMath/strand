/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.ChartJs = Polymer({
		is: 'strand-chartjs',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Stylable,
			StrandTraits.Refable
		],

		TYPE_LINE: 'line',
		TYPE_BAR: 'bar',
		TYPE_HORIZONTAL_BAR: 'horizontalBar',
		TYPE_PIE: 'pie',
		TYPE_DOUGHNUT: 'doughnut',
		TYPE_POLAR_AREA: 'polarArea',
		TYPE_RADAR: 'radar',
		TYPE_BUBBLE: 'bubble',

		properties: {
			// strand specific
			// type: {
			// 	type: String,
			// 	value: function() {
			// 		return this.TYPE_LINE;
			// 	}
			// },

			globalFont: {
				type: Object,
				value: {
					defaultFontColor: '#666',
					defaultFontFamily: '"Arimo", sans-serif',
					defaultFontSize: 12,
					defaultFontStyle: 'normal',
					responsive: false
				}
			},

			width: {
				type: Number,
				value: 500
			},

			height: {
				type: Number,
				value: 500
			},

			context: {
				type: Object,
				value: function() {
					return this.$.context
				}
			},

			chart: {
				type: Object
			},

			config: {
				type: Object,
				observer: '_configChanged'
			}

			// _configuration: {
			// 	type: Object,
			// 	value: {
			// 		type: '',
			// 		labels: [],
			// 		datasets: [],
			// 		options: {}
			// 	}
			// },


			// chartjs 
			// datasets: {
			// 	type: Array,
			// 	value: [],
			// 	notify: true
			// },
			// labels: {
			// 	type: Array,
			// 	value: [],
			// 	notify: true
			// },
			// xLabels: {
			// 	type: Array,
			// 	value: [],
			// 	notify: true
			// },
			// yLabels: {
			// 	type: Array,
			// 	value: [],
			// 	notify: true
			// },
			// options: {
			// 	type: Object,
			// 	value: {},
			// 	notify: true
			// },



		},

		// observers: [
		// 	'_updateChart(type, labels, datasets, options)'
		// ],

		// TODO - actually useful stuff:
		// ready: function() {
		// 	if (this.config) {
		// 		this._updateChart();
		// 	}
		// },

		_configChanged: function(newVal, oldVal) {
			if (newVal) this._updateChart();
		},


		_updateChart: function() {
			// this._configuration.type = this.type;
			// this._configuration.data = {};
			// this._configuration.data.datasets = this.datasets;
			// this._configuration.data.labels = this.labels;
			// this._configuration.options = this.options;

			// if (this.chart) {
			// 	this.chart.update();
			// } else {
			// 	this.chart = new Chart(this.context, this._configuration);
			// }

			if (!this.chart) {
				this.chart = new Chart(this.context, this.config);
			} else {
				this.chart.update();
			}

		},


		_updateStyle: function(width, height, fitparent) {
			return this.styleBlock({
				width: width + "px",
				height: height + "px"
			});
		}
	});

})(window.Strand = window.Strand || {});
