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
			ver: {
				type: String,
				value: "<<version>>"
			},

			actionLabel: {
				type: String,
				value: false
			},
			primaryLabel: {
				type: String,
				value: false
			},
			secondaryLabel: {
				type: String,
				value: false
			},

			actionEvent: {
				type: String,
				value: 'click-action'
			},
			primaryEvent: {
				type: String,
				value: 'click-primary'
			},
			secondaryEvent: {
				type: String,
				value: 'click-secondary'
			}
		},

		_handleAction: function(e) {
			e.preventDefault();
			this.fire(this.actionEvent);
		},

		_handlePrimary: function(e) {
			this.fire(this.primaryEvent);
		},

		_handleSecondary: function(e) {
			this.fire(this.secondaryEvent);
		},

		_showHide: function() {
			this.hidden ? this.hide() : this.show();
		},

		ready: function() {
			this.modal = this.$$('#dialog-inner-modal');
		},

		show: function() {
			this.modal.show();
		},

		hide: function() {
			this.modal.hide(this.modal);
		}

	});

})(window.Strand = window.Strand || {});