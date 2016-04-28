/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Tooltip = Polymer({
		is: 'strand-tooltip',

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
			tipWidth: {
				type: Number,
				value: false, // if not set, assume it should be the width of it's content
				refelctToAttribute: true,
				observer: '_widthChanged'
			}
		},

		_boundOverHandler: null,
		_boundOutHandler: null,
		_prevTargetCursor: null,

		attached: function() {
			this._boundOverHandler = this._overHandler.bind(this);
			this._boundOutHandler = this._outHandler.bind(this);

			this.async(function() {
				if (this._target) {
					this._target.addEventListener('mouseover', this._boundOverHandler);
					this._target.addEventListener('mouseout', this._boundOutHandler);
					this._prevTargetCursor = this._target.style.cursor;
					this._target.style.cursor = 'pointer';
				}
			});
		},

		detached: function() {
			if (this._target) {
				this._target.removeEventListener('mouseover', this._boundOverHandler);
				this._target.removeEventListener('mouseout', this._boundOutHandler);
				this._target.style.cursor = this._prevTargetCursor;
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

		_updateClass: function(auto) {
			var o = {};
			o.auto = !auto;
			return this.classBlock(o);
		},

		_closeFilter: function(instance, e, original) {
			var closeIcon = instance.$$('.close-icon');
			if(e.path.indexOf(closeIcon) > -1){
				instance.close();
			}
		}

	});

})(window.Strand = window.Strand || {});