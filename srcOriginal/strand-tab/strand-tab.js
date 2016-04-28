/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.Tab = Polymer({
		is: "strand-tab",

		properties: {
			active: {
				reflectToAttribute: true,
				type: Boolean,
				value: false,
				notify: true
			},
			icon: {
				type: String,
				value: ''
			},
			iconWidth: {
				type: Number,
				value: 13
			},
			iconHeight: {
				type: Number,
				value: 13
			},
			tabLabel: {
				type: String,
				value: '',
			},
			_instance: Object,
			_callback: {
				type: Object,
			},
			_resolved: Object,
			promise: {
				type: Object,
				value: function () {
					return new Zousan();
				},
				notify: true,
				readOnly: true,
			},
		},

		behaviors: [
			StrandTraits.TemplateFindable,
			StrandTraits.TemplateComponentizable,
			StrandTraits.Refable
		],

		observers: [
			"_renderView(active, _templateFound)",
		],

		_renderView: function (active, _templateFound) {
			var element = Polymer.dom(this);
			var view = Polymer.dom(this.$.view);
			var useLightDom = 0|true;

			if (!_templateFound) {
				this._instance = null;
			} else if (active && !this._instance) {
				view.getDistributedNodes().forEach(function (node) {
					var child = Polymer.dom(node);
					var parent = child.parentNode ? Polymer.dom(child.parentNode) : null;

					if (parent) {
						parent.removeChild(node);
					}
				});

				this._instance = this.instantiateTemplate(this._templateFound, 0|useLightDom);

				element.appendChild(this._instance);

				if (this._callback) {
					this.async(this._callback.bind(this, this._instance));
				}

				this.fire('loaded', {
					label: this.tabLabel,
					target: this,
				});

				if (!this.promise ||
					this.promise === this._resolved) {
					this._setPromise(new Zousan());
				}

				this.promise.resolve(this._instance);

				this.set("_resolved", this.promise);
			}
		},

		loadExternal: function(path, callback) {
			if (!this.promise ||
				this.promise === this._resolved) {
				this._setPromise(new Zousan());
			}

			this._callback = callback;
			this.set("templateFindable.templateUri", path);

			return this.promise;
		},

	});
	
})(window.Strand = window.Strand || {});
