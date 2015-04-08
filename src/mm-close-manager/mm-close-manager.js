(function() {
	
	_instances = [];

	document.addEventListener("down", function(e) {
		var i, 
			instance,
			scope, 
			filter;
		for(i in _instances) {
			instance = _instances[i];
			filter = instance.targetFilter || _defaultFilter;
			scope = typeof instance.scope === "object" ? instance.scope : instance;
			filter.apply(scope, [instance, e]);
		}
	});

	function _defaultFilter(instance, event) {
		var isInstance = false;
		isInstance = instance.target === event.target;
		if (instance.secondaryTarget) {
			isInstance = isInstance || (instance.secondaryTarget === event.target);
		}
		if (!isInstance) {
			if (instance.closeHandler) {
				instance.closeHandler();
			}
		} else {
			event.stopImmediatePropagation();
		}
	}

	function _addInstance(instance) {
		_instances.push(instance);
	}

	function _removeInstance(instance) {
		_instances.splice(_instances.indexOf(instance), 1);
	}

	Polymer('mm-close-manager', {

		ver:"<<version>>",

		publish: {
		},

		closeHandler: function() {
			this.fire("close");
		},

		attached: function() {
			_addInstance(this);
		},

		detached: function() {
			_removeInstance(this);
		}
	});
})();