/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var Validator = StrandLib.Validator,
		BehaviorUtils = StrandLib.BehaviorUtils,
		DataUtils = StrandLib.DataUtils;

	scope.Repeater = Polymer({
		is: 'strand-repeater',

		properties: {
			data: {
				type: Array,
				notify: true,
				value: function() { return [{}]; }
			},
			addRowLabel: {
				type: String,
				value: '+Add Item'
			},

			maxRows: {
				type: Number,
				value: 0,
				notify: true
			},

			_last: {
				type: Number,
				value: -1,
				notify: true
			},
			_validation: {
				type: Object,
				value: function() { return {}; }
			},
			_showRemove: {
				type: Boolean,
				notify: true
			}
		},

		behaviors: [
			StrandTraits.Collection,
			StrandTraits.Refable,
			StrandTraits.Resolvable,
			StrandTraits.MixinFindable,
			StrandTraits.TemplateFindable,
			StrandTraits.DomMutable
		],

		observers: [
			'_dataLengthChanged(data.length)'
		],

		get value() {
			return this.data;
		},

		set value(newVal) {
			if (Array.isArray(newVal)) this.set('data', newVal);
		},

		add: function(model, silent, force) {
			if(this.maxRows <= 0 || this.data.length < this.maxRows) {
				var inherited = BehaviorUtils.findSuper(StrandTraits.Collection, "add");
				inherited.call(this, model || {}, silent, force);
			}
		},

		_notifyModelChanged: function(modelChangeRecord) {
			// strand-repeater-row calls this to bridge mutation events from its model to strand-repeater's data array
			if(modelChangeRecord.path) {
				var idx = this.data.indexOf(modelChangeRecord.base);
				var path = modelChangeRecord.path.replace('model.', 'data.'+idx+'.');
				this.notifyPath(path, modelChangeRecord.value);
			}
		},

		_dataLengthChanged: function(length) {
			this.set('ref._last', length-1);
			this.set('ref._showRemove', length > 1);
		},

		validate: function(validation) {
			var errors = [];
			if(!validation) validation = this.validation;

			if(DataUtils.isType(validation, 'function')) {
				this._errorModels = validation.call(this, this.data, this.added, this.modified, this.removed);

				var cIds = this._errorModels.map(function(o) { return o.cId });

				// Call the error state setting method on each row
				errors = cIds.map(function(key) {
					var record;
					var cId = parseInt(key);
					var errIndex = this.getIndexOfCid(cId, '_errorModels');

					if(errIndex >= 0) record = this._errorModels[errIndex];
					return this._validation[key](record);
				}, this);
			}

			return errors.reduce(function(all, current) { return all && current; }, true);
		}
	});

})(window.Strand = window.Strand || {});
