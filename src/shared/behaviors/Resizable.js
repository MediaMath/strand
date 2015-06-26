/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/

(function (scope) {

	var _cache = [];
	var _instances = [];
	var _il = 0;
	var _backoff = 0;
	var _backoff_inc = 200;
	var _backoff_max = 2000;

	function _addInstance(instance) {
		_instances.push(instance);
		_cache.push({
			width:instance.offsetWidth,
			height:instance.offsetHeight,
		});
		_il++;
		requestAnimationFrame(_measure);
	}

	function _removeInstance(instance) {
		_instances.splice(_instances.indexOf(instance), 1);
		_il--;
	}

	function _measure() {
		_backoff += _backoff_inc;
		if (_backoff > _backoff_max) _backoff = _backoff_max;

		for(var i=0; i<_il; i++) {
			var inst = _instances[i];
			var w = inst.offsetWidth;
			var h = inst.offsetHeight;
			var cache = _cache[i];
			if (cache.width !== w) {
				cache.width = w;
				inst.elementResize(w,null);
				_backoff = 0;
			}
			if (cache.height !== h) {
				cache.height = h;
				inst.elementResize(null, h);
				_backoff = 0;
			}
		}
		if (_il) {
			setTimeout(function() {
				requestAnimationFrame(_measure);
			},_backoff);
		}
	}

	scope.Resizable = {

		properties: {
			resizeTarget:{
				type:Object,
				value: function() { return this; }
			}
		},

		attached:function() {
			_addInstance(this.resizeTarget);
		},

		detached:function() {
			_removeInstance(this.resizeTarget);
		},

		elementResize: function(e) {
			//stub for behavior
		}

	};

})(window.StrandTraits = window.StrandTraits || {});
