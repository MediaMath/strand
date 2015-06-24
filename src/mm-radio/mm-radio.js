/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var _groups = {};
	function _checkGroup(selection) {
		var group = _groups[selection.group];
		if (group) {
			for(var i in group) {
				if (group[i] !== selection) {
					group[i].checked = false;
				}
			}
		}
	}

	function _addGroup(item) {
		if (item.group && _groups[item.group]) {
			_groups[item.group].push(item);
		} else {
			_groups[item.group] = [item];
		}
	}

	function _removeGroup(item, oldGroup) {
		var group = oldGroup ? _groups[oldGroup] : _groups[item.group];
		if (group) {
			group.splice(group.indexOf(item), 1);
			if (group.length === 0) {
				delete _groups[item.group];
			}
		}
	}

	scope.Radio = Polymer({
		is: 'mm-radio',

		properties: {
			checked: { 
				value:false,
				type: Boolean,
				observer: 'checkedChanged',
				reflectToAttribute:true 
			},
			disabled: { 
				value:false,
				type: Boolean,
				reflect:true 
			},
			group: { 
				type: String,
				observer: 'groupChanged'
			},
			fitparent: { 
				type: String,
				reflectToAttribute:true 
			},
			layout: {
				type: String,
				reflectToAttribute:true
			}
		},

		listeners: {
			'tap': 'handleTap'
		},

		groupChanged: function(newGroup, oldGroup) {
			if (oldGroup) {
				_removeGroup(this, oldGroup);
			}
			_addGroup(this);
		},

		detached: function() {
			_removeGroup(this);
		},

		checkedChanged: function() {
			if (this.checked) {
				_checkGroup(this);
				this.fire("selected", {item: this, checked: this.checked});
			}
		},

		handleTap: function(e) {
			if (!this.disabled) {
				this.checked = true;
			}
		}
	});

})(window.Strand = window.Strand || {});