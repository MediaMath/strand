/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.Tab = Polymer({
		is: "mm-tab",

		properties: {
			active: {
				observer: '_loadExternal',
				reflectToAttribute: true,
				type: Boolean,
				value: false,
				notify: true
			},
			icon: {
				type: String,
				value: ''
			},
			tabLabel: {
				type: String,
				value: '',
			},
			url: {
				type: String,
				value: '',
				observer: '_loadExternal'
			},
			_contentLoaded: {
				observer: '_fireCallback',
				type: Boolean,
				value: false
			},
		},

		_fireCallback: function() {
			if(this.callback) this.async(this.callback);
		},

		_loadExternal: function() {
			if(this.url && this.active && !this._contentLoaded) this.async(function() {

				this.importHref(this.url, function(e) {

					var importContainer = document.createElement('template','dom-bind');
					var importNodes = e.target.import.body.childNodes;
					for(var i=0; i<importNodes.length; i++) {
						importContainer.content.appendChild(importNodes[i]);
					}
					Polymer.dom(this).appendChild(importContainer);

					this._contentLoaded = true;

					this.fire('loaded', {
						label: this.tabLabel,
						target: this,
					});

				}, function(err) {
					console.error(err);
				});
				
			});
		},

		loadExternal: function(path, callback) {
			this.url = path;
			this.callback = callback;
		}

	});
	
})(window.Strand = window.Strand || {});