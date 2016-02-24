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
				value: function() { return [{}]; },
				observer: '_handleDataChanged'
			},

			added: {
				type: Array,
				value: []
			},
			removed: {
				type: Array,
				value: []
			},
			_origData: {
				type: Array,
				value: []
			},

			addRowLabel: {
				type: String,
				value: '+Add Item'
			}
		},

		// Track added
		// Track deleted
		// changed = ∆( {orig} - {deleted}, {current} - added )

		behaviors: [
			StrandTraits.Refable,
			StrandTraits.Resolvable
		],

		get changed() {
			return this._origData.filter(function(elt) { return elt._changed; });
		},

		get value() {
			return this.data;
		},

		set value(newVal) {
			if (newVal instanceof Array) {
				this.set('data', newVal);
			}
		},

		observers: [
			'_handleDataPath(data.*)'
		],

		_handleDataPath: function(e) {
			var path = e.path.split('.'),
				record = path[path.length-1];

			if(record === 'splices')
				this._handleSplices(e);
			else if(record === '_ref') {
				var index = parseInt(path[1].substring(1));
				this._injectModelData(index);
			}
		},

		_handleSplices: function(e) {
			e.value.indexSplices.forEach(function(record) {
				// TODO: Make this less awful
				this.set('added', this.added.concat(
					record.addedKeys.map(
						function(key) {
							return record.object[parseInt(key.substring(1))];
						}
					)
				));
				this.set('removed', this.removed.concat(record.removed));
			}.bind(this));
		},

		_handleDataChanged: function(newData, oldData) {
			if(oldData) {
				// Because of binding weirdness we need to move _refs manually from the old array to the new array
				for(var i=oldData.length-1; i>= 0; i--) {
					newData[i]._ref = oldData[i]._ref;
				}
			}

			this.set('_origData', newData.slice(0));

			for(var j=newData.length-1; j>= 0; j--) {
				this._injectModelData(j);
			}
		},

		_injectModelData: function(index, data) {
			if(!data) data = this.data;

			var model = data[index],
				node = model && model._ref;

			if(node) {
				var fields = node.querySelectorAll('[name]');
				for(var i=0; i<fields.length; i++) {
					var field = fields[i],
						name = field.getAttribute('name');
					if(model[name]) field.setAttribute('value', model[name]);
				}
			}
		},

		ready: function() {
			var templateTag = this.queryEffectiveChildren('template');
			this.set('template', templateTag.innerHTML);
		},

		validate: function() {

			this.data.forEach(function(item, index) {
				var valid = true;

				if(typeof item.validation === 'function') {
					// Custom validation provided: call validation, passing name:value pairs as arguments
					var elems = item._ref.querySelectorAll('[name]'),
						rowData = new Object();
						Object.keys(elems).forEach(
							function(key) {
								var elem = elems[key];
								rowData[elem.getAttribute('name')] = elem.value;
							}
						);
					valid = item.validation.call(item, rowData);
				} else {
					// Default validation: call validate on each form element and fold them together
					var fields = item._ref.querySelectorAll('[validation]');
					valid = Object.keys(fields).reduce(function(sum, elt) {
						return sum && (!fields[elt].validate || fields[elt].validate(fields[elt].value));
					}, true);
				}

				// Reflect validation to the model for error messaging
				this.set('data.'+index+'.error', !valid);
				this.set('data.'+index+'.errorMessage', item.errorMessage);

			}, this);

			return false;
		},

		validation: this.validate,

		_updateModel: function(e) {
			var target = Polymer.dom(e).rootTarget,
				name = target.name || target.getAttribute('name'),
				value = target.value || target.getAttribute('value');

			if(name && value !== e.model.get('item.'+name)) {
				e.model.set('item._changed', true);
				e.model.set('item.'+name, value);
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
