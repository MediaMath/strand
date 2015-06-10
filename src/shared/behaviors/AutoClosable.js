(function (scope) {

	var _instances = [];

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

	 var AutoClosable = {

	 	attached: function() {
	 		_addInstance(this);
	 	},

	 	detached: function() {
	 		_removeInstance(this);
	 	},

		_closeFilter: function(instance, e, original) {
			if(e.path.indexOf(this) > -1){
				original.stopImmediatePropagation();
			} else {
				instance.close();
			}
		}
	 };

	 scope.AutoClosable = AutoClosable;
})(window.StrandTraits = window.StrandTraits || {}); 