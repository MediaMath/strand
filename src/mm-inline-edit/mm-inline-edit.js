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

		// type: entity | collection | date
		TYPE_ENTITY: 'entity',
		TYPE_COLLECTION: 'collection',
		TYPE_DATE: 'date',

		properties: {

			type: {
				type: String,
				value: function() {
					return this.TYPE_ENTITY
				},
				notify: true
			},
			value: {
				type: Object
			},
			model: Object,
			field: {
				type: String,
				observer: '_fieldChanged'
			},
			// entity: {
			// 	type: Object,
			// 	value: true
			// },
			// collection: {
			// 	type: Object
			// },
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

		_edit: function(e) {
			e.preventDefault();
			this._beginEdit();
		},

		_handleKeydown: function(e) {
			this._routeKeyEvent(e);
		},

		_beginEdit: function() {
			// TODO: probably more setup necessary here
			// for the other types of edit scenarios
			this.open();
		},

		_fieldChanged: function(newVal) {
			console.log(newVal);
		},

		_onEnter: function() {
			if (this.type === this.TYPE_ENTITY) {
				// console.log('enter pressed: ', this.value);
				// TODO: update the model 
				// console.log(this.model);
				// this.set(this.model[this.field], this.value);
				var path = String('model.' + this.field);
				this.set(path, this.value);
				this.close();
			}
		},

		_typeInput: function(type) {
			return type === this.TYPE_ENTITY;
		},

		_typeCollection: function(type) {
			return type === this.TYPE_COLLECTION;
		},

		_typeDate: function(type) {
			return type === this.TYPE_DATE;
		},

	});

})(window.Strand = window.Strand || {});