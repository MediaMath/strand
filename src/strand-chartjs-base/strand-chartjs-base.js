/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var DataUtils = StrandLib.DataUtils;
	var Chart = window.Chart;

	scope.ChartJs = Polymer({
		is: 'strand-chartjs-base',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Refable,
			StrandTraits.Resizable
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

			// TODO: Make tooltips look more like the strand tooltips (?)
			// TODO: tooltips heavy on top padding (exmples don't look like this)?

			height: {
				type: Number,
				value: 250
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
			data: {
				type: Object
			},
			globalSettings: {
				type: Object,
				value: {
					maintainAspectRatio: false,
					legend: {
						display: false
					}
				},
				observer: '_updateGlobals'
			},
			options: {
				type: Object,
				value: function() {
					return {};
				}
			},
			type: {
				type: String,
				value: function() {
					return this.TYPE_BAR;
				}
			}
		},

		observers: [
			'_updateChart(data, options, type)'
		],

		// TODO: Globals probably not even necessary, as the 
		// same settings can be passed in options...and since
		// we are wrapped in a component won't have multiples
		// using these same settings...
		_updateGlobals: function() {
			var newGlobalSettings = DataUtils.copy(Chart.defaults.global, this.globalSettings);
			Chart.defaults.global = newGlobalSettings;

			this.debounce('updateChart', this.updateChart);
		},

		_updateChart: function(data, options, type) {
			this.debounce('updateChart', this.updateChart);
		},

		updateChart: function() {
			var config = {};
			config.type = this.type;
			config.data = this.data;
			config.options = this.options;

			if (this.data) {
				if (!this.chart) {
					this.chart = new Chart(this.context, config);
				} else {
					this.chart.update();
				}
				this.chart.resize();
			}
		}
	});

})(window.Strand = window.Strand || {});
