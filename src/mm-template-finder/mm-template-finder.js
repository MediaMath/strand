/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/

(function (scope) {

	Polymer({
		is: 'mm-template-finder',

		behaviors: [
			StrandTraits.DomMutable,
			StrandTraits.TemplateFindable,
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
			templateDoc: {
				type: Object,
				computed: "_computeTemplateDoc(_localDoc)",
				notify: true,
			},
			_templateStore: Object,
			_remoteDoc: Object,
			_localDoc: Object,
			mutationTarget:{
				type:Object,
				value: function() {
					return this.$.concealer;
				},
			},
		},

		listeners: {
			"added": "_migrateTemplateContent",
		},

		observers: [
			"_selectTemplate(templateFindable.templateSelector)",
			"_startTemplateImport(templateFindable.templateUri)",
			"_finishTemplateImport(templateFindable.templateQuery, _remoteDoc)",
			"_observeTemplate(templateFindable.templateBind)",
		],

		ready: function () {
			this._migrateTemplateContent();
			this._updateTemplate();
		},

		_lazyTemplateStore: function () {
			if (!this._templateStore) {
				this._templateStore = {};
			}
			return this._templateStore;
		},

		_lazyLocalDoc: function () {
			var finder = this;

			if (!this._localDoc) {
				this._localDoc = document.implementation.createHTMLDocument();
				new MutationObserver(function observation (mutations) {
					finder._selectTemplate(finder.templateSelector);
				}).observe(this._localDoc.documentElement, {
					childList: true,
					subtree: false,
					attributes: false,
					characterData: false,
				});
			}

			return this._localDoc;
		},

		_computeTemplateDoc: function (doc) {
			return doc && doc.documentElement || null;
		},

		_migrateTemplateContent: function () {
			var doc = this._lazyLocalDoc();
			var nodes = Array.apply(null, Polymer.dom(this.$.content).getDistributedNodes());
			var count = nodes.length;
			var index = 0;

			for (index; index < count; index++) {
				doc.documentElement.appendChild(doc.adoptNode(nodes[index]));
			}
		},

		_selectTemplate: function () {
			var findable = this.templateFindable;
			var selector = findable.templateSelector ? String(findable.templateSelector) : "";
			var store = this._lazyTemplateStore();
			var doc = this._lazyLocalDoc();
			store.lightdom = selector && doc.querySelector(selector) || null;
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

			this._setTemplate(template);
			this.notifyPath("templateFinder.template", template);
		},

	});

})(window.Strand = window.Strand || {});


