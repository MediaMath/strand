/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	var _instances = [];

	function _addInstance(instance) {
		_instances.push(instance);
	}

	function _removeInstance(instance) {
		_instances.splice(_instances.indexOf(instance), 1);
	}

	function _resizeHandler() {
		var i;
		for (i = _instances.length - 1; i >= 0; i--) {
			if (_instances[i].resize) { _instances[i].resize(); }
		}
	}

	function _scrollHandler (argument) {
		var i;
		for (i = _instances.length - 1; i >= 0; i--) {
			if (_instances[i].scroll) { _instances[i].scroll(); }
		}
	}

	window.addEventListener("resize", _resizeHandler);
	window.addEventListener("scroll", _scrollHandler);

	scope.WindowNotifier = {

		attached: function() {
			_addInstance(this);
		},

		detached: function() {
			_removeInstance(this);
		},

		resize: function() {
			//behavior stub
		},

		scroll: function() {
			//behavior stub
		}

	};

})(window.StrandTraits = window.StrandTraits || {}); 