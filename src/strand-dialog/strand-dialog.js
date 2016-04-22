/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	scope.Dialog = Polymer({
		is: 'strand-dialog',

		iconMap: {
			info:    { type: "info" },
			success: { type: "success" },
			warning: { type: "warning" },
			error:   { type: "warning" }
		},

		properties: {
			type: {
				type: String,
				value: 'info',
				reflectToAttribute: true
			},
			header: {
				type: String
			},
			message: {
				type:String
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
			stackType: String,
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
			},
			_icon: {
				type: Object,
				computed: '_getIconAttributes(type)'
			}
		},

		behaviors:[
			StrandTraits.Resolvable,
			StrandTraits.Refable
		],

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
		}

	});

})(window.Strand = window.Strand || {});