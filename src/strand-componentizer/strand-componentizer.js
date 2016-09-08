/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.Componentizer = Polymer({
		is: 'strand-componentizer',

		behaviors: [
			StrandTraits.MixinFindable,
			StrandTraits.TemplateFindable,
			StrandTraits.TemplateComponentizable,
		],

		properties: {
			scope: {
				type: Object,
				value: function () {
					return this;
				},
				notify: true,
			},
			model: {
				type: Object,
				notify: true,
			},
			index: {
				type: Number,
				notify: true,
			},
			key: {
				type: String,
				notify: true,
			},
			rendered: {
				type: Object,
				readOnly: true,
			},
		},

		observers: [
			"_render(_templateFound)",
			"_scopeChanged(scope.*)",
			"_modelChanged(model.*)",
			"_indexChanged(index.*)",
			"_keyChanged(key.*)",
		],

		_render: function () {
			var useLightDom = 0|true;

			if (this.rendered) {
				return;
			}

			this._setRendered(this.instantiateTemplate(this._templateFound, 0|useLightDom, this));
			this.rendered.set("scope", this.scope);
			this.rendered.set("model", this.model);
			this.rendered.set("index", this.index);
			Polymer.dom(this).appendChild(this.rendered);
		},

		_scopeChanged: function (change) {
			if (this.rendered) {
				this.rendered.notifyPath(change.path, change.value);
			}
		},

		_modelChanged: function (change) {
			if (this.rendered) {
				this.rendered.notifyPath(change.path, change.value);
			}
		},

		_indexChanged: function (change) {
			if (this.rendered) {
				this.rendered.notifyPath(change.path, change.value);
			}
		},

		_keyChanged: function (change) {
			if (this.rendered) {
				this.rendered.notifyPath(change.path, change.value);
			}
		},

	});

})(window.Strand = window.Strand || {});