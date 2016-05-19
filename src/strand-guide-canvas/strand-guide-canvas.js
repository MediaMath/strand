/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var Rectangle = StrandLib.Rectangle;

	function drawCircle(ctx, x, y, r, sa, ea, style) {
		if (!sa) sa = 0;
		if (!ea) ea = 2 * Math.PI;

		ctx.save();
		ctx.beginPath();
		ctx.arc(x, y, r, sa, ea);
		if(style)
		  ctx.strokeStyle = style;
		ctx.stroke();
		ctx.restore();
	}

	function drawRectangle(ctx, x, y, w, h, r, style) {
		if (w < 2 * r) r = w / 2;
		if (h < 2 * r) r = h / 2;

		ctx.save();
		ctx.beginPath();
		ctx.moveTo(x+r, y);
		ctx.arcTo(x+w, y,   x+w, y+h, r);
		ctx.arcTo(x+w, y+h, x,   y+h, r);
		ctx.arcTo(x,   y+h, x,   y,   r);
		ctx.arcTo(x,   y,   x+w, y,   r);
		ctx.closePath();
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
			spotlightType: String,
			spotlightOffset: Number,
			cornerRadius: Number
		},

		resize: function() {
			if (!this.hidden) this.debounce('update-canvas', this._updateCanvas);
		},

		scroll: function() {
			if (!this.hidden) this.debounce('update-canvas', this._updateCanvas);
		},

		_currentStepChanged: function(newVal, oldVal) {
			if (this.currentStep <= this.data.length-1) {
				this._updateCanvas();
			}
		},

		_updateCanvas: function() {
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

			if (this.spotlightType === 'circle') {
				var greater = (rect.width > rect.height) ? rect.width : rect.height;
				drawCircle(
					ctx,
					rect.x + rect.width/2,
					rect.y + rect.height/2, 
					greater/2 + this.spotlightOffset
				);
			} else {
				drawRectangle(
					ctx,
					rect.x - this.spotlightOffset,
					rect.y - this.spotlightOffset, 
					rect.width + this.spotlightOffset*2,
					rect.height + this.spotlightOffset*2,
					this.cornerRadius
				);
			}

			ctx.fill();
		}
	});

})(window.Strand = window.Strand || {});