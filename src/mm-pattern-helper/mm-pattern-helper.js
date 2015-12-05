/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/

(function (scope) {

	Polymer({
		is: 'mm-pattern-helper',

		behaviors: [
			StrandTraits.DomMutable,
			StrandTraits.PatternHelpable,
		],

		properties: {
			pattern: {
				type: Object,
				value: null,
				notify: true,
				readOnly: true,
			},
			patternHelper: {
				type: Object,
				value: function () {
					return this;
				},
				notify: true,
			},
			patternDoc: {
				type: Object,
				computed: "_computePatternDoc(_localDoc)",
				notify: true,
			},
			_patternStore: Object,
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
			"added": "_migratePatternContent",
		},

		observers: [
			"_selectPattern(patternHelpable.patternSelector)",
			"_startPatternImport(patternHelpable.patternUri)",
			"_finishPatternImport(patternHelpable.patternQuery, _remoteDoc)",
			"_observePattern(patternHelpable.patternBind)",
		],

		ready: function () {
			this._migratePatternContent();
			this._updatePattern();
		},

		_lazyPatternStore: function () {
			if (!this._patternStore) {
				this._patternStore = {};
			}
			return this._patternStore;
		},

		_lazyLocalDoc: function () {
			var helper = this;

			if (!this._localDoc) {
				this._localDoc = document.implementation.createHTMLDocument();
				new MutationObserver(function observation (mutations) {
					helper._selectPattern(helper.patternSelector);
				}).observe(this._localDoc.documentElement, {
					childList: true,
					subtree: false,
					attributes: false,
					characterData: false,
				});
			}

			return this._localDoc;
		},

		_computePatternDoc: function (doc) {
			return doc && doc.documentElement || null;
		},

		_migratePatternContent: function () {
			var doc = this._lazyLocalDoc();
			var nodes = Array.apply(null, Polymer.dom(this.$.content).getDistributedNodes());
			var count = nodes.length;
			var index = 0;

			for (index; index < count; index++) {
				doc.documentElement.appendChild(doc.adoptNode(nodes[index]));
			}
		},

		_selectPattern: function () {
			var helpable = this.patternHelpable;
			var selector = helpable.patternSelector ? String(helpable.patternSelector) : "";
			var store = this._lazyPatternStore();
			var doc = this._lazyLocalDoc();
			store.lightdom = selector && doc.querySelector(selector) || null;
			this._updatePattern();
		},

		_startPatternImport: function () {
			var helpable = this.patternHelpable;
			if (helpable.patternUri) {
				this.importHref(helpable.patternUri, function ok (e) {
					this._remoteDoc = e.target.import;
				}, function err (e) {
					console.error(e);
				});
			}
		},

		_finishPatternImport: function () {
			var helpable = this.patternHelpable;
			var doc = this._remoteDoc || null;
			var query = helpable.patternQuery || "";
			var store = this._lazyPatternStore();
			store.import = doc && query && doc.querySelector(query) || null;
			this._updatePattern();
		},

		_observePattern: function () {
			var helpable = this.patternHelpable;
			var store = this._lazyPatternStore();
			store.bind = helpable.patternBind || null;
			this._updatePattern();
		},

		_updatePattern: function () {
			var helpable = this.patternHelpable;
			var pattern = null;
			var order = helpable.patternPriority;
			var store = this._lazyPatternStore();
			var count = order ? order.length : -1;
			var index = 0;

			if (count < 0) {
				return;
			}

			for (index; index < count; index++) {
				if (pattern = store[order[index]]) {
					break;
				}
			}

			this._setPattern(pattern);
			this.notifyPath("patternHelper.pattern", pattern);
		},

	});

})(window.Strand = window.Strand || {});


