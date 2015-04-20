/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function() {
	var _instances = [],
		_currentInstance = null,
		_previousInstance = null,
		_closePanel = null;

	function _addInstance(instance) {
		if(_instances.length === 0 && _closePanel === null) { 
			_createClosePanel(); 
		}
		_instances.push(instance);
	}

	function _removeInstance(instance) {
		_instances.splice(_instances.indexOf(instance), 1);
	}

	function _setCurrentInstance(instance) {
		_previousInstance = _currentInstance !== null ? _currentInstance : null;
		_currentInstance = instance;
	}

	function _hideClosePanel(instance) {
		if(instance == _currentInstance) {
			_closePanel.close();
		}
	}

	function _showClosePanel(instance) {
		if(instance == _currentInstance) {
			// clean up any existing "auto" tooltips, so the close panel can be reused:
			if (_previousInstance && _previousInstance.auto === false) {
				_previousInstance.close();
			}
			_closePanel.auto = instance.auto;
			_closePanel.open();
		}
	}

	function _createClosePanel() {
		_closePanel = new MMClosePanel();
		_closePanel.offsetY = 0;
		_closePanel.mode = "tooltip";
		_closePanel.state = _closePanel.STATE_CLOSED;
		_closePanel.targetFilter = _closeFilter;
		_closePanel.scope = _closePanel;
		document.body.appendChild(_closePanel);
	}

	function _closeFilter(instance, e) {
		function contains(rect, x, y) {
			return rect.left < x && rect.right > x && rect.top < y && rect.bottom > y;
		}

		var closeIcon = _closePanel.$.closeIcon,
			closeBound = contains(Measure(_closePanel.$.closeIcon, _closePanel).getBoundingClientRect(), e.clientX, e.clientY);

		if (closeBound) {
			_currentInstance.close();
		}
	}

	Polymer('mm-tooltip', {
		ver:"<<version>>",
		STATE_OPENED: "opened",
		STATE_CLOSED: "closed",
		publish: {
			valign: { value: "top", reflect: true },
			auto: { value: true, refelct: true },
			align: "center",
			state:'closed',
			tipWidth: null // if it's not set explicitly, assume that it should just be the width of it's content
		},

		attached: function() {
			_addInstance(this);
		},

		detached: function() {
			_removeInstance(this);
		},

		ready: function(){
			//
		},

		open: function(e) {
			this.configurePanel();
			this.state = this.STATE_OPENED;
		},

		close: function(e) {
			this.state = this.STATE_CLOSED;
		},

		overHandler: function(e) {
			this.open();
		},

		outHandler: function(e) {
			if(this.auto) {
				this.close();
			}
		},

		stateChanged: function() {
			if (this.state === this.STATE_OPENED) {
				_showClosePanel(this);
			} else {
				_hideClosePanel(this);
			}
		},

		configurePanel: function() {
			if(_currentInstance !== this) {
				_setCurrentInstance(this);

				var msgContent = this.querySelector('template').content;
				_closePanel.style.width = this.tipWidth ? this.tipWidth + "px" : "auto";
				_closePanel.valign = this.valign;
				_closePanel.align = this.align;
				_closePanel.innerHTML = null;
				_closePanel.appendChild(document.importNode(msgContent, true));
				_closePanel.scope = this;
				_closePanel.target = this.$.tipTarget;
			}
		}
	});
})();