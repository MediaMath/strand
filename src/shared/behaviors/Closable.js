/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	var _state = {
		get STATE_CLOSED() {
			return "closed";
		},
		get STATE_OPEN() {
			return "open";
		}
	};

	 var Closable = {

	 	properties: {
	 		state: {
	 			type:String,
	 			notify: true,
	 			value:_state.STATE_CLOSED,
	 		},
	 		isClosed: {
	 			type:Boolean,
	 			notify: true,
	 			computed:"_checkClosed(state)"
	 		}
	 	},

	 	open: function(silent) {
	 		this.state = _state.STATE_OPEN;
	 		!silent && this.fire("open");
	 	},

	 	close: function(silent) {
	 		this.state = _state.STATE_CLOSED;
	 		!silent && this.fire("close");
	 	},

	 	toggle: function(silent) {
	 		if (this.state === _state.STATE_OPEN) {
	 			this.close(silent);
	 		} else {
	 			this.open(silent);
	 		}
	 	},

	 	_checkClosed: function(state) {
	 		return state === _state.STATE_CLOSED;
	 	},

		_closeFilter: function(instance, e, original) {
			if(e.path.indexOf(this) > -1){
				original.stopImmediatePropagation();
			} else {
				instance.close();
			}
		}
	 };

	 scope.Closable = Closable;
})(window.StrandTraits = window.StrandTraits || {}); 