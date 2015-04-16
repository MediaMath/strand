/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt
*/
(function() {

	function _ancestry(node, target) {
		if (node === target) {
			return true;
		} else if ( (node.children && node.children.length) || (node.nodeName.toLowerCase() === "content" && node.getDistributedNodes().length)) {
			var o = (node.children.length) ? node.children : node.getDistributedNodes();
			var sum = false;
			for(var i=0; i<o.length; i++) {
				sum = sum || _ancestry(o[i], target);
				if (sum) break;
			}
			return sum;
		}
		return false;
	}

	function _ancestorCache(node, target) {
		var cache = node._cache = node._cache || {};
		if (cache[target] === null || cache[target] === undefined) {
			return cache[target] = _ancestry(node, target);
		} else {
			return cache[target];
		}
	}

	function _disableScroll(scope) {
		var handle = _handler.bind(scope);
		window.addEventListener('DOMMouseScroll', handle, false);
		window.onmousewheel = document.onmousewheel = handle;
		document.onkeydown = handle;
	}

	function _enableScroll(scope) {
		window.removeEventListener('DOMMouseScroll', _handler, false);
		window.onmousewheel = document.onmousewheel = document.onkeydown = null; 
	}

	function _handler(e) {
		var allow = false;

		allow = _ancestorCache(this, wrap(e.target));

		if (!allow) {
			if (!e.keyCode || [37, 38, 39, 40].indexOf(e.keyCode) !== -1) {
				e.preventDefault();
				e.returnValue = false;  
			}
		}
	}

	Polymer('mm-close-panel', {
		
		ver:"<<version>>",
		STATE_OPENED: "opened",
		STATE_CLOSED: "closed",
		MODE_POPOVER: "popover",
		MODE_DROPDOWN: "dropdown",
		MODE_TOOLTIP: "tooltip",
		CLOSE_ICON_COLOR: Colors.A4,
		CLOSE_ICON_HOVER: Colors.F0,

		publish: {
			mode: { value: 'popover', reflect:true },
			auto: true,
			state:'closed',
			offsetX:0,
			offsetY:0,
			stackType:"ui"
		},

		attached: function() {
			if (!this.target) {
				this.target = this.parentNode;
			}
			if (!this.align) {
				this.align = this.isRelative ? "center" : "left";
			}
			if (!this.valign) {
				this.valign = "bottom";
			}

			WindowNotifier.addInstance(this);
		},

		detached: function() {
			WindowNotifier.removeInstance(this);			
		},

		observe: {
			"align valign offsetX offsetY targetTop targetLeft target width height auto": "shimPositionJobHandler"
		},

		_filterValign: function(v) {
			if (v.toLowerCase() === "center") {
				return "VCENTER";
			}
			return v.toUpperCase();
		},

		resize: function() {
			this.job("resize", this.positionHandler, 0);
		},
		
		scroll: function() {
			this.job("scroll", this.positionHandler, 0);
		},

		shimPositionJobHandler: function() {
			this.job("resize", this.positionHandler, 0);
		},

		positionHandler: function (oldValue, newValue) {

			if (!this.valign || !this.align) return;

			var tm = this.targetMetrics, 
				valign = ovalign = Rectangle.SIDE[this._filterValign(this.valign)], 
				align = oalign = Rectangle.SIDE[this.align.toUpperCase()],
				winRect = new Rectangle(0,0, window.innerWidth, window.innerHeight),
				offsetRect = new Rectangle(-this.offsetX, -this.offsetY),
				panelRect = this.metrics,
				targetRect = this.targetMetrics,
				overlap,
				mode = this.isRelative ? "position" : "align",
				projectionRect;

			//account for new positioning and flip if we overlap the window
			projectionRect = panelRect.clone();

			projectionRect.positionRelative(targetRect, valign);
			
			if (this.isRelative) {
				projectionRect.positionRelative(targetRect, align);
			} else {
				projectionRect.alignRelative(targetRect, align);
			}

			overlap = projectionRect.outside(winRect);
			projectionRect = null;

			//flip any out of bounds projections
			align = Rectangle.fixBits(align, overlap, Rectangle.SIDE.LEFT | Rectangle.SIDE.RIGHT, mode);
			valign = Rectangle.fixBits(valign, overlap, Rectangle.SIDE.TOP | Rectangle.SIDE.BOTTOM, mode);

			//allow users to bind on the calculated alignment for styling purposes
			this.calcAlign = Rectangle.SIDE.data[align];
			this.calcValign = Rectangle.SIDE.data[valign];
			
			//account for user defined offsets
			//flip the offsets if we have overflowed
			(align !== oalign) ? offsetRect.x = -offsetRect.x : offsetRect.x;
			(valign !== ovalign) ? offsetRect.y = - offsetRect.y : offsetRect.y;
			targetRect.subtract(offsetRect);

			//move our coords to the target
			panelRect.positionRelative(targetRect, valign);
			
			if (this.isRelative) {
				panelRect.positionRelative(targetRect, align);
			} else {
				panelRect.alignRelative(targetRect, align);
			}
			//apply to our css
			panelRect.toCSS(this);
		},

		//get metrics for our target element (defaults to parent)
		get targetMetrics() {
			return this.target && Rectangle.fromElement(this.target, this);
		},

		//these are just triggers for any scrolling or positioning events
		//on the target element so we know to reposition our panel
		get targetTop() {
			return this.target && this.targetMetrics.top;
		},

		get targetLeft() {
			return this.target && this.targetMetrics.left;
		},

		get width() {
			return this.metrics.width;
		},

		get height() {
			return this.metrics.height;
		},

		//get the panel metrics
		get metrics() {
			return Rectangle.fromElement(this);
		},

		//tooltip and popover are positioned relative to their respective target
		get isRelative() {
			return this.mode === this.MODE_POPOVER || this.mode === this.MODE_TOOLTIP;
		},

		modeChanged: function(oldMode, newMode) {
			if (newMode === this.MODE_DROPDOWN) {
				this.classList.add('bottom');
			} else {
				this.classList.remove('bottom');
			}
		},

		stateChanged: function(oldState, newState) {
			if (newState === this.STATE_OPENED) {
				// TODO: (dlasky) revisit this event binding to be a single bind
				// _disableScroll(this);
				this.style.setProperty("clip","auto");
			} else {
				// _enableScroll(this);
				this.style.setProperty("clip","rect(0,0,0,0)");
			}
		},

		open: function() {
			this.state = this.STATE_OPENED;
		},

		close: function() {
			this.state = this.STATE_CLOSED;
		},

		toggle: function() {
			if (this.state === this.STATE_OPENED) {
				this.close();
			} else {
				this.open();
			}
		}

	});

})();
