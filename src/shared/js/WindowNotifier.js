/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt
*/
(function () {

	var _instances = [];
	var _wm = new WeakMap();

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

	function _addInstance(instance) {
		_instances.push(instance);
	}

	function _removeInstance(instance) {
		_instances.splice(_instances.indexOf(instance), 1);
	}

	function _addResizeListener(target, callback) {
		var callbacks = _wm.get(target) || [];
		if (callbacks.indexOf(callback) === -1) {
			callbacks.push(callback);
			_wm.set(target, callbacks);
			if (window.OverflowEvent) {
				target.addEventListener("overflowchanged", callback);
			} else {
				target.addEventListener("overflow", callback);
				target.addEventListener("underflow", callback);
			}
		}
	}

	function _removeResizeListener(target, callback) {
		var callbacks = _wm.get(target) || [];
		callbacks.splice(callbacks.indexOf(callback), 1);
		target.removeEventListener("overflowchanged", callback);
		target.removeEventListener("overflow", callback);
		target.removeEventListener("underflow", callback);
	}

	function _removeAllResizeListeners(target) {
		var callbacks = _wm.get(target) || [];
		for (var i = callbacks.length - 1; i >= 0; i--) {
			target.removeEventListener(target, callbacks[i]);
		}
		_wm.delete(target);
	}

	window.addEventListener("resize", _resizeHandler);
	window.addEventListener("scroll", _scrollHandler);

	window.WindowNotifier = {
		addInstance:_addInstance,
		removeInstance:_removeInstance,
		addResizeListener: _addResizeListener,
		removeResizeListener: _removeResizeListener,
		removeAllResizeListeners: _removeAllResizeListeners
	};

})(); 