/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt
*/

(function (_window) {

	_window.MultiObserver = MultiObserver;

	function MultiObserver () {
		Observer.call(this);

		this.observed_ = null;
	}

	MultiObserver.prototype = new Observer();

	MultiObserver.prototype.addObserver = function () {
		var count = arguments.length;
		var index = 0;
		var observed_ = null;
		var observer = null;

		observed_ = this.observed_;

		for (index = 0; index < count; index++) {
			observer = arguments[index];
			observer.open(this.deliverer_(observer), this);

			if (observed_) {
				observed_.push(observer);
			} else {
				observed_ = [observer];
			}

		}

		this.observed_ = observed_;
	};

	MultiObserver.prototype.deliverer_ = function (observer) {
		return function deliver () {
			var macroObserver = this;
			var args = Array.apply(null, arguments);
			args.push(observer, macroObserver);
			macroObserver.report_(args);
		};
	};

	MultiObserver.prototype.connect_ = function () {
		// required implementation for Observer abstract method (no-op is sufficient)
	};

	MultiObserver.prototype.disconnect_ = function () {
		var count = this.observed_.length;
		var index = 0;

		for (index = 0; index < count; index++) {
			this.observed_[index].close();
		}

		this.observed_ = null;
		this.value_= null;
	};

} (this || window));


