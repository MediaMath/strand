/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Repeater = Polymer({
		is: 'mm-repeater',

		properties: {
			template: {
				type: Object,
				value: null
			},
			data: {
				type: Array,
				notify: true,
				value: function() { return []; },
				observer: '_handleDataChanged'
			},
			addRowLabel: {
				type: String,
				value: '+Add Item'
			}
		},

		behaviors: [
			StrandTraits.Refable,
			StrandTraits.Resolvable,
			StrandTraits.Validatable
		],

		get value() { return this.data; },
		set value(newVal) { if (newVal instanceof Array) this.data = newVal; },

		ready: function() {
			var templateTag = this.queryEffectiveChildren('template');
			this.set('template', templateTag.innerHTML);
			if(!this.data || this.data.length === 0) this._addRow();
		},

		_handleDataChanged: function(newData) {
			this.async(function() {
				newData.forEach(function(record) {
					var node = record._ref;
					if(node) {
						var fields = node.querySelectorAll('[name]');
						for(var i=0; i<fields.length; i++) {
							var field=fields[i];
							var name=field.getAttribute('name');
							field.setAttribute('value',record[name]);
						}
					}
				});
			}.bind(this));
		},

		_updateModel: function(e) {
			var target = Polymer.dom(e).localTarget,
				name = target.name || target.getAttribute('name'),
				value = target.value || target.getAttribute('value');
			if(name && value) {
				var index = this.$.repeater.indexForElement(target);
				this.set('data.'+(index)+'.'+name, value);
				this.debounce('changed', this._changed);
			}
		},

		_addRow: function() {
			this.push('data', {});
		},

		_removeRow: function(e) {
			var index = this.$.repeater.indexForElement(e.target);
			this.splice('data', index, 1);
			this.debounce('changed', this._changed);
		},

		_changed: function() {
			this.fire('changed', { value: this.data });
		}
	});

})(window.Strand = window.Strand || {});
