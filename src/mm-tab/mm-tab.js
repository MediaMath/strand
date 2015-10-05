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
				type: Boolean,
				value: false
			}
		},

		behaviors: [Polymer.Templatizer],

		_importNodes: function(importDoc) {
			if(importDoc) {
				var importTemplate = importDoc.querySelector('template');
				this.templatize(importTemplate);

				var instance = this.stamp();
				Polymer.dom(this).appendChild(instance.root);

				if(this._callback) this.async(this._callback.bind(this,instance));

				this._contentLoaded = true;

				this.fire('loaded', {
					label: this.tabLabel,
					target: this,
				});
			}
		},

		_loadExternal: function() {
			if(this.active && !this._contentLoaded) {
				var importDoc,
					existing = document.head.querySelector('link[href="'+this.url+'"]');

				if(existing) {

					importDoc = existing.import;
					this._importNodes(importDoc);

				} else if(this.url) {

					this.importHref(this.url,
						function(e) {
							importDoc = e.target.import;
							this._importNodes(importDoc);
						},
						function(error) {
							console.error(error);
						});

				}
			}
		},

		loadExternal: function(path, callback) {
			this.url = path;
			this._callback = callback;
		}

	});
	
})(window.Strand = window.Strand || {});