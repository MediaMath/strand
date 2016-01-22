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
				value: function() { return [{}]; }
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

		get value() {
			return this.data;
		},

		set value(newVal) {
			if (newVal instanceof Array) {
				this.set('data', newVal);
			}
		},

		observers: [
			'_injectModelData(data.*)'
		],

		_injectModelData: function(e) {
			var path = e.path.split('.'),
				record = path[path.length-1];

			console.log(e);
			if(record === '_ref') {
				var index = parseInt(path[1].substring(1)),
					model = e.base[index],
					node = model._ref;

				if(node) {
					var fields = node.querySelectorAll('[name]');
					for(var i=0; i<fields.length; i++) {
						var field = fields[i],
							name = field.getAttribute('name');
						if(model[name]) field.setAttribute('value', model[name]);
					}
				}
			}
		},

		// Model -> DOM
		// DOM -> Model
		// Push onto DOM with empty state
		// Pop off DOM |> (DOM -> Model)
		// Model -> DOM |> Push multiple onto DOM
		// Modify DOM in place

		// Add log
		// Remove log
		// Change log

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
						rowData = Object.keys(elems).map(function(key) { return {name: elems[key].name, value: elems[key].value }; });
					valid = item.validation.apply(rowData);
				} else {
					// Default validation: call validate on each form element and fold them together
					var fields = item._ref.querySelectorAll('[validation]');
					valid = Object.keys(fields).reduce(function(sum, elt) {
						return sum && (!fields[elt].validate || fields[elt].validate(fields[elt].value));
					}, true);
				}

				// Reflect validation to the model for error messaging
				this.set('data.'+index+'.error', !valid);

			}, this);
		},

		_updateModel: function(e) {
			var target = Polymer.dom(e).localTarget,
				name = target.name || target.getAttribute('name'),
				value = target.value || target.getAttribute('value');

			console.log('_updateModel triggered');
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
