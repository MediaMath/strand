/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
/* test.js */
Polymer('mm-list-item', {
	ver:"<<version>>",

	publish: {
		selected: { value: false, reflect: true }
	},

	ready: function() {
		WindowNotifier.addInstance(this);
	},

	attached: function() {
		WindowNotifier.addResizeListener(this, this.resize.bind(this));
	},

	detached: function() {
		WindowNotifier.removeAllResizeListeners(this);
		WindowNotifier.removeInstance(this);
	},

	widthChanged: function() {
		if (this.textBounds) {
			if (this.textBounds.width > this.width - this.paddingWidth) {
				this.setAttribute('title', this.textContent);
			} else {
				this.removeAttribute('title');
			}
		}
	},

	resize: function() {
		this.job("resize", this.widthChanged, 0);
	},

	get value() {
		return this.getAttribute("value") || this.textContent.trim();
	},

	get label() {
		return this.textContent.trim();
	},

	get width() {
		if (this.$)
		return Measure.getOffsetWidth(this);
	},

	get textBounds() {
		if (this.$)
		return {width: Measure.textWidth(this, this.innerText)}
	},

	get paddingWidth() {
		if (this.$)
		return Measure.getPaddingWidth(this);
	}
});
