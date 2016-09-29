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
				value: 'tooltip'
			},
			tipWidth: {
				type: Number,
				value: false, // if not set, assume it should be the width of it's content
				refelctToAttribute: true,
				observer: '_widthChanged'
			}
		},

		_prevTargetCursor: null,

		attached: function() {

			this.async(function() {
				if (this._target && typeof this._target === "object") {
					this.listen(this._target, 'mouseover', '_overHandler');
					this.listen(this._target, 'mouseout', '_outHandler');
					this._prevTargetCursor = this._target.style.cursor;
					this._target.style.cursor = 'pointer';
				}
			});
		},

		detached: function() {
			if (this._target && typeof this._target === "object") {
				this.unlisten(this._target, 'mouseover', '_overHandler');
				this.unlisten(this._target, 'mouseout', '_outHandler');
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

		_closeIconHandler: function(e) {
			this.close();
		},

		_closeFilter: function(instance, e, original) {
			if(e.path.indexOf(instance) > -1 || e.path.indexOf(instance._target) > -1){
				original.stopImmediatePropagation();
			} else {
				instance.close();
			}
		}

	});

})(window.Strand = window.Strand || {});