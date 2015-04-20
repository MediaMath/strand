/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(){
	function _getVendorStyle(property, value) {
		var obj = {},
			uppercaseProp = property.charAt(0).toUpperCase() + property.slice(1);

		obj["-webkit" + uppercaseProp] = value;
		obj["-moz" + uppercaseProp] = value;
		obj["-ms" + uppercaseProp] = value;
		obj["-o" + uppercaseProp] = value;
		obj[property] = value;

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

	Polymer('mm-spinner', {
		ver:"<<version>>",
		
		publish: {
			radius: 9,
			innerRadius: 0.5,
			lineWidth: 0.5,
			lineWeight: 0.5,
			numTicks: 12,
			fillColor: "#ffffff",
			bgColor: null,
			speed: 1.33,
			paused: {value: false, reflect: true}
		},

		observe: {
			'radius innerRadius lineWidth lineWeight numTicks fillColor bgColor speed': '_initialize'
		},

		_strokeOffset: 0.1,

		ready: function() {
			this._initialize();
		},

		_initialize: function() {
			this.job("initialize", this.initialize, 0);
		},

		initialize: function() {
			this.style.width = this.style.height = this.radius * 2 + "px";
			if(this.bgColor) {
				this.style.backgroundColor = this.bgColor;
			}

			this.resetAnimation();

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

		setAnimation: function() {
			var animationTime = 1 / this.speed,
				animationSteps = this.numTicks,
				animationState = this.paused ? "paused" : "running";

			this.spinnerAnimation = _getVendorStyle("animation", "spin " + animationTime + "s steps(" + animationSteps + ", end) " + animationState + " infinite");
		},

		resetAnimation: function() {
			if(!this.resetAnimationFlag) {
				this.resetAnimationFlag = true;
				this.setAnimation();
			} else {
				this.spinnerAnimation = null;
				this.async(this.setAnimation);
			}
		},

		start: function() {
			this.paused = false;
			this.resetAnimation();
		},

		stop: function() {
			this.paused = true;
			this.resetAnimation();
		}
	});
})();