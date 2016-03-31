/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var Measure = StrandLib.Measure;

	scope.InlineEdit = Polymer({
		is: 'mm-inline-edit',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Stylable,
			StrandTraits.Refable,
			StrandTraits.PositionableEditor,
			StrandTraits.Keyboardable,
			StrandTraits.Stackable
		],

		TYPE_PRIMITIVE: 'primitive',
		TYPE_COLLECTION: 'collection',
		TYPE_DATE: 'date',

		properties: {

			type: {
				type: String,
				value: function() {
					return this.TYPE_PRIMITIVE
				},
				notify: true
			},
			value: {
				type: Object
			},
			model: {
				type: Object
			},
			field: {
				type: String
			},
			_scope: {
				type: Object,
				value: function() { return this; }
			},
			_panel: {
				type: Object,
				value: function() { return this.$.panel; }
			},
			_target: {
				type: Object,
				value: function() { return this.$.target; }
			},
			_stackTarget: {
				type: Object,
				value: function() { return this.$.panel; }
			},

		},

		listeners: {
			'keydown': '_handleKeydown'
		},

		attached: function() {
			this.field = this._getFieldFromModel(this.value, this.model);
			console.log(this.field);
		},

		_edit: function(e) {
			e.preventDefault();
			this._beginEdit();
		},

		_handleKeydown: function(e) {
			this._routeKeyEvent(e);
		},

		_beginEdit: function() {
			switch (this.type) {
				case this.TYPE_PRIMITIVE:
					this.open();
					this.$$('#input').setFocus();
					break;
				case this.TYPE_COLLECTION:
					// TODO
					break;
				case this.TYPE_DATE:
					// TODO
					break;
			}
		},

		_getFieldFromModel: function(value, model) {
			return Object.keys(model).reduce(function(prevVal, currVal){
				if (model[currVal] === value) {
					return currVal;
				} 
				return prevVal;
			}, null);
		},

		_onEnter: function() {
			this._handleValueChange();
		},

		_onEsc: function() {
			this.close();
		},

		_handleValueChange: function() {
			switch (this.type) {
				case this.TYPE_PRIMITIVE:
					var path = String('model.' + this.field);
					this.set(path, this.value);
					break;
				case this.TYPE_COLLECTION:
					// TODO
					break;
				case this.TYPE_DATE:
					// TODO
					break;
			}
			this.close();
		},

		_typePrimitive: function(type) {
			return type === this.TYPE_PRIMITIVE;
		},

		_typeCollection: function(type) {
			return type === this.TYPE_COLLECTION;
		},

		_typeDate: function(type) {
			return type === this.TYPE_DATE;
		},

	});

})(window.Strand = window.Strand || {});