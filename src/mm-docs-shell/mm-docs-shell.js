/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
Polymer('mm-docs-shell', {
	ver:"<<version>>",
	mobileHeaderHeightCalc: 0,
	logoAreaHeightCalc: 0, 
	paddingLeftCalc: 0,
	navLeftCalc: 0,

	publish: {
		unit: "em",
		mobileHeader: "Docs",
		menuIconWidth: 20,
		menuIconHeight: 20,
		menuIconColor: "#333333", 
		logoAreaHeight: 8.25,
		navWidth: 16.563,
		navLeft: 0,
		mobileHeaderHeight: 3.75,
		blockerOpacity: 0.33,
		minWidth: 768
	},

	attached: function() {
		WindowNotifier.addInstance(this);
	},

	detached: function() {
		WindowNotifier.removeInstance(this);
	},

	ready: function() {
		// set some defaults:
		this.logoAreaHeightCalc = this.logoAreaHeight + this.unit; 

		// start with correct positioning:
		if (this.shouldHideNav) {
			this.paddingLeftCalc =  0 + this.unit;
			this.navLeftCalc = -this.navWidth + this.unit;
			this.mobileHeaderHeightCalc = this.mobileHeaderHeight + this.unit;
		} else {
			this.paddingLeftCalc =  this.navWidth + this.unit;
			this.navLeftCalc = 0 + this.unit;
			this.mobileHeaderHeightCalc = 0 + this.unit;
		}
	},

	domReady: function() {
		this.resize();
	},

	menuTap: function(e) {
		e.preventDefault();
		this.showNav();
	},

	blockerTap: function(e) {
		e.preventDefault();
		this.hideNav();
	},

	showNav: function() {
		this.navLeftCalc = (0 + this.unit);
		this.paddingLeftCalc = !this.shouldHideNav ? (this.navWidth + this.unit) : (0 + this.unit);
		this.mobileHeaderHeightCalc = !this.shouldHideNav ? (0 + this.unit) : (this.mobileHeaderHeight + this.unit);

		this.$.blocker.style.visibility = this.shouldHideNav ? "visible" : "hidden";
		this.$.blocker.style.opacity = this.shouldHideNav ? this.blockerOpacity : 0;
		document.body.style.overflow = this.shouldHideNav ? "hidden" : "auto";
	},

	hideNav: function() {
		this.navLeftCalc = this.shouldHideNav ? (-this.navWidth + this.unit) : (0 + this.unit);
		this.paddingLeftCalc = this.shouldHideNav ? (0 + this.unit) : (this.navWidth + this.unit);
		this.mobileHeaderHeightCalc = this.shouldHideNav ? (this.mobileHeaderHeight + this.unit) : (0 + this.unit);

		this.$.blocker.style.visibility = "hidden";
		this.$.blocker.style.opacity = 0;
		document.body.style.overflow = "auto";
	},

	get shouldHideNav() {
		return window.innerWidth < this.minWidth;
	},

	resizeHandler: function(e) {
		this.job("resize", this.resize);
	},

	resize: function() {
		if (this.shouldHideNav) {
			this.async(this.hideNav);
		} else {
			this.async(this.showNav);
		}
	}
});