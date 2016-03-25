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
			StrandTraits.Refable
		],

		// type: entity | collection | date

		properties: {

			value: {
				type: Object,
				value: 'cheese'
			},

			showEditor: {
				type: Boolean,
				value: false
			}

			// entity: {
			// 	type: Object,
			// 	value: true
			// },

			// collection: {
			// 	type: Object
			// },

		},

		_editClick: function(e) {
			this._beginEdit();
		},

		_beginEdit: function() {
			// position the resulting editor
			var targetMetrics = Measure.getBoundingClientRect(this.$.editable);
			this.showEditor = true;

		},

		_isInput: function(value, showEditor) {

			if (typeof value === 'string') {
				return true && showEditor;
			} else {
				return false && !showEditor;
			}

		}



	});

})(window.Strand = window.Strand || {});