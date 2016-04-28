/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.DocsShell = Polymer({

		is: 'strand-docs-shell',

		behaviors: [
			StrandTraits.Stylable,
			StrandTraits.WindowNotifier
		],
		
		properties: {
			mobileHeaderHeightCalc: {
				type: Number,
				value: 0
			},
			logoAreaHeightCalc: {
				type: Number,
				value: 0
			}, 
			paddingLeftCalc: {
				type: Number,
				value: 0
			},
			navLeftCalc: {
				type: Number,
				value: 0
			},
			unit: {
				type: String,
				value: "em"
			},
			mobileHeader: {
				type: String,
				value: "Docs"
			},
			menuIconColor: {
				type: String,
				value: "#333333"
			}, 
			menuIconWidth: {
				type: Number,
				value: 20
			},
			menuIconHeight: {
				type: Number,
				value: 20
			},
			logoAreaHeight: {
				type: Number,
				value: 8.25
			},
			navWidth: {
				type: Number,
				value: 16.563
			},
			navLeft: {
				type: Number,
				value: 0
			},
			mobileHeaderHeight: {
				type: Number,
				value: 3.75
			},
			blockerOpacity: {
				type: Number,
				value: 0.33
			},
			minWidth: {
				type: Number,
				value: 768
			}
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

		_menuTap: function(e) {
			console.log("_menuTap: ", e);
			e.preventDefault();
			this.showNav();
		},

		_blockerTap: function(e) {
			console.log("_blockerTap: ", e);
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
			this.debounce("resize", this.resize);
		},

		resize: function() {
			if (this.shouldHideNav) {
				this.async(this.hideNav);
			} else {
				this.async(this.showNav);
			}
		},

		// Styling
		_updateMobileHead: function(mobileHeaderHeightCalc) {
			return this.styleBlock({
				height: mobileHeaderHeightCalc
			});
		},

		_updateMobileHeadBox: function(mobileHeaderHeight, unit) {
			return this.styleBlock({
				height: mobileHeaderHeight + unit
			});
		},

		_updateMainContent: function(paddingLeftCalc) {
			return this.styleBlock({
				paddingLeft: paddingLeftCalc
			});
		},

		_updateMainNav: function(navWidth, unit, navLeftCalc) {
			return this.styleBlock({
				width: navWidth + unit,
				left: navLeftCalc
			});
		},

		_updateLogoArea: function(navWidth, unit, logoAreaHeight) {
			return this.styleBlock({
				width: navWidth + unit,
				height: logoAreaHeight + unit
			});
		},

		_updateNavContent: function(logoAreaHeight, unit) {
			return this.styleBlock({
				height: "calc(100% - " + logoAreaHeight + unit + ")"
			});
		}

	});

})(window.Strand = window.Strand || {});