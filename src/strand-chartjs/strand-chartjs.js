/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var DataUtils = StrandLib.DataUtils;
	var Chart = window.Chart;

	scope.ChartJs = Polymer({
		is: 'strand-chartjs',

		behaviors: [
			StrandTraits.Resolvable,
			// StrandTraits.Stylable,
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
			// fitparent: { 
			// 	type: Boolean,
			// 	value: true, 
			// 	reflectToAttribute: true
			// },
			width: {
				type: Number
			},
			height: {
				type: Number
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
					defaultFontColor: '#333',
					defaultFontFamily: '"Arimo", sans-serif',
					defaultFontSize: 13,
					defaultFontStyle: 'normal',
					// responsive: false
					maintainAspectRatio: false
				},
				observer: '_updateGlobals'
			},
			options: {
				type: Object,
				// TODO: optionsDefaults prop?
				value: {
					scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero:true
                            }
                        }]
                    }
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
				this.chart = !this.chart ? new Chart(this.context, config) : 
					this.chart.update();
			}
		},

		// _updateStyle: function(width, height, fitparent) {
		// 	var f = fitparent ? this.root.getBoundingClientRect.width : false;
		// 	var w = width ? width + 'px' : false;
		// 	var h = height ? height + 'px' : false;
		// 	var style = {};

		// 	if(w) style.width = f ? f : w;
		// 	return this.styleBlock(style);
		// },
	});

})(window.Strand = window.Strand || {});
