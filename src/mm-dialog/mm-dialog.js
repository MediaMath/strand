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
			width: {
				type: Number,
				value: 450
			},
			hidden: Boolean,
			dismiss: {
				type: Boolean,
				value: false
			},
			noscroll: Boolean,

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
						callback: function(e,host) {
							host.hide();
						}
					}];
				}
			}
		},

		_handleClick: function(e) {
			e.preventDefault();
			e.model.item.callback(e,this);
		},

		_getIconAttributes: function(type) {
			return this.iconMap[type];
		},

		_validType: function(type) {
			return type === 'primary' || type === 'secondary';
		},

		show: function() {
			this.$.dialogInnerModal.show();
		},

		hide: function() {
			this.$.dialogInnerModal.hide();
		},

	});

})(window.Strand = window.Strand || {});