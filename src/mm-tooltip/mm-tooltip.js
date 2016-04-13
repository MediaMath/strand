/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Tooltip = Polymer({
		is: 'mm-tooltip',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Stackable,
			StrandTraits.PositionablePanel,
			StrandTraits.Stylable,
			StrandTraits.Falsifiable,
			StrandTraits.Refable
		],

		properties: {
			auto: { 
				type: Boolean,
				value: true,
				refelctToAttribute: true
			},
			direction: {
				value: 'n'
			},
			stackType:{
				type: String,
				value: "tooltip"
			},
			guideTip: {
				type: Boolean,
				value: false,
				refelctToAttribute: true,
				observer: '_guideTipChanged'
			},
			tipWidth: {
				type: Number,
				value: false, // if not set, assume it should be the width of it's content
				refelctToAttribute: true,
				observer: '_widthChanged'
			}
		},

		attached: function() {
			this.async(function() {
				if (!this.guideTip && this._target) {
					this._target.addEventListener('mouseover', this._overHandler.bind(this));
					this._target.addEventListener('mouseout', this._outHandler.bind(this));
					this._target.style.cursor = 'pointer';
				}
			});
		},

		removed: function() {
			if (!this.guideTip && this._target) {
				this._target.removeEventListener('mouseover', this._overHandler.bind(this));
				this._target.removeEventListener('mouseout', this._outHandler.bind(this));
				this._target.style.cursor = 'default';
			}
		},

		_overHandler: function(e) {
			this.open();
		},

		_outHandler: function(e) {
			if(this.auto) {
				this.close();
			}
		},

		_widthChanged: function(newVal, oldVal) {
			this.style.width = newVal + 'px';
		},

		_guideTipChanged: function(newVal, oldVal) {
			// don't supress document body clicks for guide tips
			this.disableScroll = !newVal;
		},

		_closeFilter: function(instance, e, original) {
			var closeIcon = instance.$$('.close-icon');
			if(e.path.indexOf(closeIcon) > -1){
				instance.close();
			}
		}

	});

})(window.Strand = window.Strand || {});