/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function() {

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

	Polymer('mm-radio', {

		ver:"<<version>>",

		publish: {
			checked: { value:false, reflect:true },
			disabled: { value:false, reflect:true },
			group: { value:null, reflect:true },
			fitparent: { value:false, reflect:true },
			layout: { value:null, reflect:true }
		},

		groupChanged: function(oldGroup, newGroup) {
			if (oldGroup) {
				_removeGroup(this, oldGroup);
			}
			_addGroup(this);
		},

		detached: function() {
			_removeGroup(this);
		},

		checkedChanged: function(oldCheck, newCheck) {
			if (newCheck) {
				_checkGroup(this);
				this.fire("selected", {item: this, checked: this.checked});
			}
		},

		radioMouseUp: function(e) {
			if (!this.disabled) {
				this.checked = true;
			}
		}
	});

})();