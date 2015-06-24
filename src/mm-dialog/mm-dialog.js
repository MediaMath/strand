/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Dialog = Polymer({
		is: 'mm-dialog',

		iconMap: {
			info:    { type: "info",    color: Colors.D3 },
			success: { type: "success", color: Colors.B6 },
			warning: { type: "warning", color: Colors.E5 },
			error:   { type: "warning", color: Colors.C3 }
		},

		properties: {
			type: {
				type: String,
				value: ''
			},
			header: {
				type: String,
				value: ''
			},
			hidden: {
				reflectToAttribute: true,
				observer: '_showHide',
				type: Boolean,
				value: true,
			},
			dismiss: {
				observer: '_updateModalProperties',
				type: Boolean,
				value: true,
			},
			noscroll: {
				observer: '_updateModalProperties',
				type: Boolean,
				value: false
			},
			width: {
				observer: '_updateModalProperties',
				type: Number,
				value: 600
			},

			icon: {
				type: Object,
				computed: '_getIconAttributes(type)'
			},
			actions: {
				type: Array,
				value: function() {
					return [{
						label: 'OK',
						type: 'secondary',
						handleClick: function(e,host) {
							host.hide();
						}
					}];
				}
			}
		},

		_checkModalExists: function() {
			if((typeof this.modal) === 'undefined') {
				this.modal = this.$$('#dialog-inner-modal');
			}
		},

		_handleClick: function(e) {
			e.preventDefault();
			e.model.item.handleClick(e,this);
		},

		_showHide: function() {
			this.hidden ? this.hide() : this.show();
		},

		_getIconAttributes: function(type) {
			return this.iconMap[type];
		},

		_updateModalProperties: function() {
			this._checkModalExists();
			this.modal.width = this.width;
			this.modal.dismiss = this.dismiss;
			this.modal.noscroll = this.noscroll;
		},

		_validType: function(type) {
			return type === 'primary' || type === 'secondary';
		},

		show: function() {
			this._checkModalExists();
			this.modal.show();
			this.hidden = false;
		},

		hide: function() {
			this._checkModalExists();
			this.modal.hidden = true;
			this.hidden = true;
		},

	});

})(window.Strand = window.Strand || {});