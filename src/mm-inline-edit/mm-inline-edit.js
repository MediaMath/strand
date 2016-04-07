/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var Measure = StrandLib.Measure;
	var BehaviorUtils = StrandLib.BehaviorUtils;

	scope.InlineEdit = Polymer({
		is: 'mm-inline-edit',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Stackable,
			StrandTraits.PositionableEditor,
			StrandTraits.Stylable,
			StrandTraits.Keyboardable,
			StrandTraits.Refable,
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
				type: Object,
				notify: true
			},
			model: {
				type: Object
			},
			field: {
				type: String
			},
			collection: {
				type: Array,
				notify: true
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
			_preEditVal: {
				type: Object
			}
		},

		listeners: {
			'keydown': '_handleKeydown'
		},

		attached: function() {
			this.field = this._getFieldFromModel(this.value, this.model);
			console.log(this.field);
		},

		_getFieldFromModel: function(value, model) {
			return Object.keys(model).reduce(function(prevVal, currVal){
				if (model[currVal] === value) {
					return currVal;
				} 
				return prevVal;
			}, null);
		},

		_beginEdit: function() {
			this._preEditVal = this.value;

			switch (this.type) {
				case this.TYPE_PRIMITIVE:
					this.$$('#input').focus();
					break;
				case this.TYPE_COLLECTION:
					// TODO
					break;
				case this.TYPE_DATE:
					// TODO
					break;
			}
			this.open();
		},

		// actions
		_handleKeydown: function(e) {
			this._routeKeyEvent(e);
		},

		_onEnter: function() {
			this._changeValue();
		},

		_onEsc: function() {
			this._restoreValue();
		},

		_save: function(e) {
			this._changeValue();
		},

		_cancel: function(e) {
			this._restoreValue();
		},
		
		_edit: function(e) {
			e.preventDefault();
			this._beginEdit();
		},

		// values
		_changeValue: function() {
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

		_restoreValue: function() {
			// TODO: may need to switch here
			// if there is a requirement for a 
			// different behavior for types
			var path = String('model.' + this.field);
			this.value = this._preEditVal;
			this.set(path, this._preEditVal);
			this.close();
		},

		// close: function(silent) {
		// 	var inherited = BehaviorUtils.findSuper(StrandTraits.PositionableEditor, "close");
			
		// 	// close any open panels
		// 	if (this.type === this.TYPE_COLLECTION &&
		// 		this.$$('#dropdown').state === 'opened') {
		// 		this.$$('#dropdown').state === 'closed';
		// 	}

		// 	inherited.apply(this, [silent]);
		// },

		// layout and styling
		_typePrimitive: function(type) {
			return type === this.TYPE_PRIMITIVE;
		},

		_typeCollection: function(type, collection) {
			return type === this.TYPE_COLLECTION && collection;
		},

		_typeDate: function(type) {
			return type === this.TYPE_DATE;
		},

	});

})(window.Strand = window.Strand || {});