/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Dialog = Polymer({
		is: 'mm-dialog',

		behaviors: [
			StrandTraits.Stackable
		],

		properties: {
			type: {
				type: String,
				value: ''
			},
			header: {
				type: String,
				value: ''
			},
			actions: Array
		},

		factoryImpl: function(properties) {
			this.header = properties.header;
			this.type = properties.type;
			this.actions = properties.actionList;
		},

		_handleClick: function(e) {
			e.preventDefault();
			e.model.item.handleClick();
		},

		_showHide: function() {
			this.hidden ? this.hide() : this.show();
		},

		ready: function() {
			this.modal = this.$$('#dialog-inner-modal');
		},

		show: function() {
			this.modal.show();
			this.hidden = false;
		},

		hide: function() {
			this.modal.hide(this.modal);
			this.hidden = true;
		},

	});

})(window.Strand = window.Strand || {});