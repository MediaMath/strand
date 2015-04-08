/*
 Inspiration:

 https://github.com/vladocar/picoCSS
 https://github.com/EarMaster/CSSClass
 https://github.com/jcmoore
*/

(function () {

var Strand = function(input) {
	this.value = input instanceof HTMLElement ? [input] : Array.prototype.slice.call(document.querySelectorAll(input));
};

Strand.prototype = {
	each: function(method) {
		this.value.forEach(method);
		return this;
	},
	css: function (v) {
		this.each(function(i) {
			if (typeof v === "string") {
				i.style.cssText = v;
			} else {
				for(var k in v) {
					i.style.setProperty(k, v[k]);
				}
			}
		});
		return this;
	},
	attr: function (a, v) {
		var o = [];
		this.each(function(i) {
			if (v) {
				i.setAttribute(a, v);
			} else {
				o.push(i.getAttribute(a));
			}
		});
		return o.length ? o.length===1 ? o[0] : o : this;
	},
	on: function (type, fn) {
		this.each(function(i) {
			i.addEventListener(type, fn, false);
		});
		return this;
	},
	now: Date.now || function() { return new Date().getTime(); },
	debounce: function(func, wait, immediate) {
		var timeout, args, context, timestamp, result;
		return function() {
			context = this;
			args = arguments;
			timestamp = Date.now();
			var later = function() {
			var last = Date.now() - timestamp;
			if (last < wait) {
				timeout = setTimeout(later, wait - last);
			} else {
				timeout = null;
				if (!immediate) {
				result = func.apply(context, args);
				context = args = null;
				}
			}
			};
			var callNow = immediate && !timeout;
			if (!timeout) {
			timeout = setTimeout(later, wait);
			}
			if (callNow) {
			result = func.apply(context, args);
			context = args = null;
			}

			return result;
		};
	},
	hasClass: function(c) {
			c = c.split(' ');
		var r = false;
		this.each(function(val) {
			var i,
				row = true, 
				e = Array.prototype.slice.call(val.classList);
			for(i=0; i<c.length; i++) {
				row = row && val.classList.contains(c[i]);
			}
			r = r || row;
		});
		return r && !!this.value.length;
	},
	addClass: function(c) {
		var parent = this;
		c = c.split(' ');
		this.each(function(val) {
			for(var i=0; i<c.length; i++)
				if(!parent.hasClass(c[i])) {
					val.classList.add(c[i]);
				}
		});
		return this;
	},
	removeClass: function(c) {
		c = c.split(' ');
		this.each(function(val) {
			for(var i=0; i<c.length; i++)
				if(this.hasClass(c[i])) {
					val.classList.remove(c[i]);
				}
		});
		return this;
	},
	toggleClass: function(c) {
		c = c.split(' ');
		this.each(function(val) {
			for(var i=0; i<c.length; i++)
					val.classList.toggle(c[i]);
		});
		return this;
	}
};


window.Strand = function(input) {
	return new Strand(input);
};

})();

