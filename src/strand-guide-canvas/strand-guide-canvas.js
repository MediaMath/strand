/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var Rectangle = StrandLib.Rectangle;

	function drawEllipseWithQuatraticCurve(ctx, x, y, w, h, style) {
		var kappa = .5522848,
			ox = (w / 2) * kappa, // control point offset horizontal
			oy = (h / 2) * kappa, // control point offset vertical
			xe = x + w,           // x-end
			ye = y + h,           // y-end
			xm = x + w / 2,       // x-middle
			ym = y + h / 2;       // y-middle

		ctx.save();
		ctx.beginPath();
		ctx.moveTo(x, ym);
		ctx.quadraticCurveTo(x,y,xm,y);
		ctx.quadraticCurveTo(xe,y,xe,ym);
		ctx.quadraticCurveTo(xe,ye,xm,ye);
		ctx.quadraticCurveTo(x,ye,x,ym);
		if(style)
		  ctx.strokeStyle = style;
		ctx.stroke();
		ctx.restore();
	}

	scope.Guide = Polymer({
		is: 'strand-guide-canvas',

		behaviors:[
			StrandTraits.WindowNotifier
		],

		properties: {
			hidden: {
				type: Boolean
			},
			opacity: {
				type: Number,
				value: 0.3
			},
			data: {
				type: Array
			},
			currentStep: {
				type: Number,
				notify: true,
				observer: '_currentStepChanged'
			},
			spotlightOffset: Number
		},

		resize: function() {
			if (!this.hidden) this.debounce('update-canvas', this.updateCanvas);
		},

		scroll: function() {
			if (!this.hidden) this.debounce('update-canvas', this.updateCanvas);
		},

		_currentStepChanged: function(newVal, oldVal) {
			if (this.currentStep <= this.data.length-1) {
				this.updateCanvas();
			}
		},

		updateCanvas: function() {
			if (!this.data) return;
			
			var target = this.data[this.currentStep].targetRef;
			var rect = Rectangle.fromElement(target);
			var canvas = this.$.canvas;
			var ctx = canvas.getContext('2d');
			var w = ctx.canvas.width = window.innerWidth;
			var h = ctx.canvas.height = window.innerHeight;
			var r = this.spotlightRadius;
			var o = this.spotlightOffset;

			canvas.width = w;
			canvas.height = h;

			ctx.fillStyle = 'rgba(0,0,0,' + this.opacity + ')';
			ctx.fillRect(0, 0, w, h);

			ctx.globalCompositeOperation = 'destination-out';
			ctx.fillStyle = 'red';

			drawEllipseWithQuatraticCurve(
				ctx, 
				rect.x - this.spotlightOffset,
				rect.y - this.spotlightOffset, 
				rect.width + this.spotlightOffset*2,
				rect.height + this.spotlightOffset*2
			);

			ctx.fill();
		},

	});

})(window.Strand = window.Strand || {});