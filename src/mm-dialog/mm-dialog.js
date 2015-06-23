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

		behaviors: [
			StrandTraits.Stackable
		],

		properties: {
			type: {
				type: String,
				value: ''
			},
			icon: {
				type: Object,
				computed: '_getIconAttributes(type)'
			},
			header: {
				type: String,
				value: ''
			},
			hidden: {
				observer: '_showHide',
				type: Boolean,
				value: true,
			},
			dismiss: {
				notify: true,
				observer: '_changeModalDismissable',
				type: Boolean,
				value: true,
			},
			width: {
				observer: '_changeModalWidth',
				type: Number,
				value: 600
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

		ready: function() {
			this._checkModalExists();
		},

		_changeModalWidth: function() {
			this._checkModalExists();
			this.modal.width = this.width;
		},

		_changeModalDismissable: function() {
			this._checkModalExists();
			this.modal.dismiss = this.dismiss;
		},

		factoryImpl: function(properties) {
			this.header = properties.header;
			this.type = properties.type.toLowerCase();

			var dialogContent = document.createElement('div');
			dialogContent.innerHTML = properties.content;
			Polymer.dom(this.root).appendChild(dialogContent);

			this.configureActions(properties.actionList);
		},

		configureActions: function(actionList) {
			actionList.map(function(item) {
				var t;
				if(item.type) t = item.type.toLowerCase();
				if(!(t==='primary' || t==='secondary')) t = false;
				item.type = t;
			});
			this.actions = actionList;
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