/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt
*/
	function Rectangle (x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}

	Rectangle.fromElement = function(element, root) {
		if (element && element.getBoundingClientRect && (element.shadowRoot || root && root.shadowRoot)) {
			var cr = element.getBoundingClientRect();
			return new Rectangle(cr.left, cr.top, cr.width, cr.height);
		} else {
			return new Rectangle(0,0,0,0);
		}
	};

	// force the inverse of the overlap into the channel portion of the mask
	// (only if the overlap is not "both" or "neither")
	Rectangle.fixBits = function (align, overlap, channel, mode) {
		overlap = overlap & channel;
		var center = align & Rectangle.SIDE.CENTER,
			vcenter = align & Rectangle.SIDE.VCENTER;
		if (center || vcenter) {
			if (overlap) {
				align |= overlap ^ channel;
				if (vcenter) align &= ~Rectangle.SIDE.VCENTER;
				if (center) align &= ~Rectangle.SIDE.CENTER;
			}
		} else if ((overlap & channel) !== 0 && (overlap & channel) !== channel) {
			align = (align & ~channel) | (align ^ channel);
		}
		return align;
	};

	Rectangle.SIDE = new BitMask("TOP","BOTTOM","LEFT","RIGHT","CENTER","VCENTER");

	Rectangle.prototype = {

		get left() { return this.x; },
		set left(i) { this.x = i; },

		get right() { return this.x + this.width;},
		set right(i) { this.x = i - this.width; },

		get top () { return this.y; },
		set top (i) { this.y = i; },

		get bottom () { return this.y + this.height; },
		set bottom (i) { this.y = i - this.height; },

		get center() { return this.x + this.width/2; },
		set center(i) { this.x = i - this.width/2; },

		get vcenter() {return this.y + this.height/2; },
		set vcenter(i) { this.y = i - this.height/2; },

		clone: function() {
			return new Rectangle(this.x, this.y, this.width, this.height);
		},

		outside : function (other) {
			var bitfield = 0,
				r = Rectangle.SIDE;
			(this.left < other.left) && (bitfield |= r.LEFT);
			(this.right > other.right) && (bitfield |= r.RIGHT);
			(this.top < other.top) && (bitfield |= r.TOP);
			(this.bottom > other.bottom) && (bitfield |= r.BOTTOM);
			return bitfield;
		},

		toCSS : function(element) {
			if (element && element.style) {
				element.style.setProperty("left", this.left + "px");
				element.style.setProperty("top", this.top + "px");
				// element.style.setProperty("-webkit-transform", "translate3d("+this.left+"px,"+this.top+"px,0)");
				// element.style.setProperty("-webkit-transform", "matrix(1,0,0,1,"+this.left+","+this.top+")");
			}
			return this;
		},

		positionRelative : function(other, mask) {
			var r = Rectangle.SIDE;
			(r.LEFT & mask) && (this.right = other.left);
			(r.RIGHT & mask) && (this.left = other.right);
			(r.TOP & mask) && (this.bottom = other.top);
			(r.BOTTOM & mask) && (this.top = other.bottom);
			(r.CENTER & mask) && (this.center = other.center);
			(r.VCENTER & mask) && (this.vcenter = other.vcenter);
			return this;
		},

		subtract: function(other) {
			this.x -= other.x;
			this.y -= other.y;
		},

		flipV: function() {
			this.y = -this.y;
		},

		flipH: function() {
			this.x = -this.x;
		},

		alignRelative : function(other, mask) {
			var r = Rectangle.SIDE;
			(r.LEFT & mask) && (this.left = other.left);
			(r.RIGHT & mask) && (this.right = other.right);
			(r.TOP & mask) && (this.bottom = other.bottom);
			(r.BOTTOM & mask) && (this.top = other.top);
			(r.CENTER & mask) && (this.center = other.center);
			(r.VCENTER & mask) && (this.vcenter = other.vcenter);
			
			return this;
		}
	};