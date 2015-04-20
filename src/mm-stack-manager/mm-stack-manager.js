/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function() {

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
			instance.depth = cat.items.push(instance) + cat.base;
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

	Polymer('mm-stack-manager', {
		
		ver:"<<version>>",

		publish: {
			depth: {value: 0, reflect: true}
		},

		typeChanged: function(oldType, newType) {
			if (oldType) {
				_removeInstance(this, oldType);
			}
			_addInstance(this, newType);
		},

		depthChanged: function(oldDepth, newDepth) {
			if (this.target) {
				this.target.style.setProperty("z-index", newDepth);
			}
			this.fire("depthChanged", {depth:this.depth});
		},

		targetChanged: function(oldTarget, newTarget) {
			newTarget.style.setProperty("z-index", this.depth);
		},

		moveToTop: function() {
			_removeInstance(this, this.type);
			_addInstance(this, this.type);
			return this.depth;
		}

	});

})();