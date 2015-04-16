/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt
*/
(function () {

	var Measure = function(input, root) {
		this.input = input;
		// this.root = root;
	};

	Measure.prototype = {	
		// returns the boundingClientRect of the text within an mm-list-tem
		getTextBounds: function() {
			var range = document.createRange();
			if (range && this.input.childNodes[0]) {
				range.selectNode(this.input.childNodes[0]);
				return range.getBoundingClientRect();
			}
		},
		//measures text off the dom, input is used for style reference
		textWidth: function(chars, font) {
			if (!font) {
				var s = getComputedStyle(this.input);
				font = s["font-size"] + " " + s["font-family"];
			}
			var c = document.createElement("canvas");
			var ctx=c.getContext("2d");
			ctx.font=font;
			return ctx.measureText(chars).width;
		},
		// returns the total of border left width + border right width
		getBorderWidth: function() {
			var style = getComputedStyle(this.input),
				borderLeft = parseInt(style.borderLeftWidth),
				borderRight = parseInt(style.borderRightWidth);
			return borderLeft + borderRight;
		},
		// return the total of padding left + padding right
		getPaddingWidth: function() {
			var style = getComputedStyle(this.input),
				padLeft = parseInt(style.paddingLeft),
				padRight = parseInt(style.paddingRight);
			return padLeft + padRight;
		},
		//return the offset width
		getOffsetWidth: function() {
			return this.input.offsetWidth;
		},
		//return the offset height
		getOffsetHeight: function() {
			return this.input.offsetHeight;
		},
		//return the scroll height
		getScrollHeight: function() {
			return this.input.scrollHeight;
		},

		getBoundingClientRect: function() {
			return this.input.getBoundingClientRect();
		},

		getComputedStyle: function() {
			return getComputedStyle(this.input);
		},

		getScrollbarWidth: function() {
			var outer = document.createElement("div");
			outer.style.visibility = "hidden";
			outer.style.width = "100px";
			outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps
			document.body.appendChild(outer);

			var widthNoScroll = outer.offsetWidth;
			outer.style.overflow = "scroll";

			var inner = document.createElement("div");
			inner.style.width = "100%";
			outer.appendChild(inner);        

			var widthWithScroll = inner.offsetWidth;
			document.body.removeChild(outer);
			
			return widthNoScroll - widthWithScroll;
		}
		
	};
	var cache = new WeakMap();
	window.Measure = function(input, root) {
		var c = cache.get(input);
		if (!c) {
			c = new Measure(input, root);
			cache.set(input, c);
		}
		return c; 
	};
})();