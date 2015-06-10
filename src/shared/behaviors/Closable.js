(function (scope) {

	var _instances = [];
	var _state = {
		get STATE_CLOSED() {
			return "closed";
		},
		get STATE_OPEN() {
			return "open";
		}
	};

	function _addInstance(instance) {
		_instances.push(instance);
	}

	function _removeInstance(instance) {
		_instances.splice(_instances.indexOf(instance), 1);
	}

	document.addEventListener("click", function(e) {
		var normalized = Polymer.dom(e);
		var instance;
		var scope;
		var filter;
		for(var i in _instances) {
			instance = _instances[i];
			filter = instance._closeFilter;
			scope = typeof instance.scope === "object" ? instance.scope : instance;
			filter.apply(scope, [instance, normalized, e]);
		}
	});

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

	 	attached: function() {
	 		_addInstance(this);
	 	},

	 	detached: function() {
	 		_removeInstance(this);
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