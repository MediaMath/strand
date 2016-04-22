/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope){
	function _getVendorStyle(styles) {
		var obj = {};
		for(var property in styles) {
			var uppercaseProp = property.charAt(0).toUpperCase() + property.slice(1);
			obj["-webkit" + uppercaseProp] = styles[property];
			obj["-moz" + uppercaseProp] = styles[property];
			obj["-ms" + uppercaseProp] = styles[property];
			obj["-o" + uppercaseProp] = styles[property];
			obj[property] = styles[property];
		}
		return obj;
	}

	function _hexToRGB(hex) {
		var result = parseInt(hex.replace("#", ""), 16);
		return {
			r: (result >> 16) & 255,
			g: (result >> 8) & 255,
			b: result & 255
		};
	}

	scope.Spinner = Polymer({
		is: 'strand-spinner',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Stylable,
			StrandTraits.Refable
		],
		
		properties: {
			radius: {
				type: Number,
				value: 9
			},
			diameter: {
				type: Number,
				computed: '_computeDiameter(radius)'
			},
			innerRadius: {
				type: Number,
				value: 0.5,
			},
			lineWidth: {
				type: Number,
				value: 0.5,
			},
			lineWeight: {
				type: Number,
				value: 0.5,
			},
			numTicks: {
				type: Number,
				value: 12,
			},
			fillColor: {
				type: String,
				value: "#ffffff",
			},
			bgColor: {
				type: String,
				value: null,
			},
			speed: {
				type: Number,
				value: 1.33,
			},
			paused: {
				type: Boolean,
				value: false,
				reflectToAttribute: true
			}
		},

		observers: [
			'_initialize(radius, innerRadius, lineWidth, lineWeight, numTicks, fillColor, bgColor, speed)'
		],

		_strokeOffset: 0.1,

		ready: function() {
			this._initialize();
		},

		_computeDiameter: function(radius) {
			return radius*2;
		},

		_initialize: function() {
			this.debounce("initialize", this._draw, 0);
		},

		_draw: function() {
			this.style.width = this.style.height = this.radius * 2 + "px";
			if(this.bgColor) {
				this.style.backgroundColor = this.bgColor;
			}

			this._resetAnimation();

			var canvas = this.$.spinner,
				context = canvas.getContext('2d'),
				cW = context.canvas.width,
				cH = context.canvas.height,
				color = _hexToRGB(this.fillColor),
				lines = this.numTicks,
				innerRadius = this.innerRadius < 1 ? this.radius * (this.innerRadius - this._strokeOffset) : this.innerRadius,
				lineLength = this.lineWidth < 1 ? this.radius * (this.lineWidth - this._strokeOffset) : this.lineWidth,
				lineWeight = this.lineWeight < 1 ? Math.sqrt(this.radius) * this.lineWeight : this.lineWeight;

			context.save();
			context.clearRect(0, 0, cW, cH);
			context.translate(cW / 2, cH / 2);
			for (var i = 0; i < lines; i++) {
				context.beginPath();
				context.rotate(Math.PI * 2 / lines);
				context.moveTo(innerRadius, 0);
				context.lineTo(innerRadius + lineLength, 0);
				context.lineWidth = lineWeight;
				context.lineCap = "round";
				context.strokeStyle = "rgba(" + color.r + "," + color.g + "," + color.b + "," + i / lines + ")";
				context.stroke();
			}
			context.restore();
		},

		_setAnimation: function() {
			var animationTime = 1 / this.speed,
				animationSteps = this.numTicks,
				animationState = this.paused ? "paused" : "running";
			this.spinnerAnimation = this.styleBlock(_getVendorStyle({
				animationName: "spin",
				animationDuration: animationTime+"s",
				animationTimingFunction: "steps(" + animationSteps + ", end)",
				animationPlayState: animationState,
				animationIterationCount: "infinite",
			}));
		},

		_resetAnimation: function() {
			if(!this.resetAnimationFlag) {
				this.resetAnimationFlag = true;
				this._setAnimation();
			} else {
				this.spinnerAnimation = null;
				this.async(this._setAnimation);
			}
		},

		start: function() {
			this.paused = false;
			this._resetAnimation();
		},

		stop: function() {
			this.paused = true;
			this._resetAnimation();
		}
	});
})(window.Strand = window.Strand || {});