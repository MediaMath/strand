/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/

(function (scope) {

	Polymer({
		is: 'strand-template-finder',

		behaviors: [
			StrandTraits.TemplateFindable,
			StrandTraits.Refable
		],

		properties: {
			template: {
				type: Object,
				value: null,
				notify: true,
				readOnly: true,
			},
			templateFinder: {
				type: Object,
				value: function () {
					return this;
				},
				notify: true,
			},
			_templateStore: Object,
			_remoteDoc: Object,
			_lazyHTML: {
				type: String,
				value: "",
				readOnly: true,
			},
		},

		observers: [
			"_selectTemplate(templateFindable.templateMatch, templateFindable.templateSelector)",
			"_startTemplateImport(templateFindable.templateUri)",
			"_finishTemplateImport(templateFindable.templateQuery, _remoteDoc)",
			"_observeTemplate(templateFindable.templateBind)",
		],

		ready: function () {
			var finder = this;
			Polymer.dom(this.$.content).observeNodes(function (info) {
				var findable = finder.templateFindable;
				finder._selectTemplate(findable.templateMatch, findable.templateSelector);
			});
		},

		templateInnerHTML: function () {
			var innerHTML = this._lazyHTML;

			if (!innerHTML) {
				if (this.template) {
					this._set_lazyHTML(Polymer.dom(this.template).innerHTML);
				}
			}

			return innerHTML || this._lazyHTML || "";
		},

		_lazyTemplateStore: function () {
			if (!this._templateStore) {
				this._templateStore = {};
			}
			return this._templateStore;
		},

		_computeTemplateDoc: function (doc) {
			return doc && doc.documentElement || null;
		},

		_selectTemplate: function () {
			var findable = this.templateFindable;
			var match = findable.templateMatch ? String(findable.templateMatch) : "";
			var selector = findable.templateSelector ? String(findable.templateSelector) : "";
			var store = this._lazyTemplateStore();
			var element = match && this.queryEffectiveChildren(match) || null;
			store.lightdom = element && selector && element.querySelector(selector) || element;
			this._updateTemplate();
		},

		_startTemplateImport: function () {
			var findable = this.templateFindable;
			if (findable.templateUri) {
				this.importHref(findable.templateUri, function ok (e) {
					this._remoteDoc = e.target.import;
				}, function err (e) {
					console.error(e);
				});
			}
		},

		_finishTemplateImport: function () {
			var findable = this.templateFindable;
			var doc = this._remoteDoc || null;
			var query = findable.templateQuery || "";
			var store = this._lazyTemplateStore();
			store.import = doc && query && doc.querySelector(query) || null;
			this._updateTemplate();
		},

		_observeTemplate: function () {
			var findable = this.templateFindable;
			var store = this._lazyTemplateStore();
			store.bind = findable.templateBind || null;
			this._updateTemplate();
		},

		_updateTemplate: function () {
			var findable = this.templateFindable;
			var template = null;
			var order = findable.templatePriority;
			var store = this._lazyTemplateStore();
			var count = order ? order.length : -1;
			var index = 0;

			if (count < 0) {
				return;
			}

			for (index; index < count; index++) {
				if (template = store[order[index]]) {
					break;
				}
			}

			this._set_lazyHTML("");
			this._setTemplate(template);
			this.notifyPath("templateFinder.template", template);
		},

	});

})(window.Strand = window.Strand || {});


