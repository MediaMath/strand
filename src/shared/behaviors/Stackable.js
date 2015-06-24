/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	var _w = 10000, 
		_instances = {
		modal:{
			base:1*_w,
			max:2*_w,
			items:[],
		},
		ui:{
			base:2*_w,
			max:3*_w,
			items:[],
		},
		tooltip:{
			base:3*_w,
			max:4*_w,
			items:[],
		}
	};

	function _addInstance(instance, type) {
		var cat = _instances[type];
		if (cat && cat.items.length < cat.max) {
			instance._setDepth( cat.items.push(instance) + cat.base );
		} else {
			throw(new Error("Could not add item at "+cat.max));
		}
	}

	function _removeInstance(instance, type) {
		var cat = _instances[type];
		if (cat) {
			cat.items.splice(cat.items.indexOf(instance), 1);
		}
	}

	scope.Stackable = {

		properties: {
			depth: {
				readOnly:true,
				notify: true,
				type:Number,
				value:0,
				observer:"_updateDepth"
			},
			stackType:{
				type:String,
				value:"ui",
				reflectToAttribute:true,
				observer:"_updateStackType"
			}
		},

		attached: function() {
			_addInstance(this, this.stackType);
		},

		detached: function() {
			_removeInstance(this, this.stackType);
		},

		_updateDepth: function() {
			this.style.setProperty("z-index", this.depth);
		},

		_updateStackType: function() {
			_removeInstance(this, this.stackType);
			_addInstance(this, this.stackType);
		},

		moveToTop: function() {
			_removeInstance(this, this.stackType);
			_addInstance(this, this.stackType);
			return this.depth;
		}
	};

})(window.StrandTraits = window.StrandTraits || {}); 