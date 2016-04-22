/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/

(function (scope) {

	scope.LocalStore = Polymer({
		
		is:"strand-localstore",

		behaviors: [
			StrandTraits.Refable
		],

		properties: {
			_storage: {
				type:Object,
				value: function() { return new StrandLib.Storage(); }
			},
			key: {
				type:String,
				value:"",
				observer:"_keyChanged"
			},
			value: {
				notify:true,
				type:Object,
				value: function() { return null; },
				observer: "_valueChanged"
			},
			auto: {
				type:Boolean,
				value: true
			}
		},

		ready: function() {
			if (this.auto) {
				this.value = this._storage.value;
			}
			window.addEventListener("storage", this._handleWindowUpdate);
		},

		_handleWindowUpdate: function() {
			if (this.auto) {
				this.value = this._storage.value;
			}
		},

		save: function(value) {
			this.value = value;
			this._storage.value = this.value;
		},

		sync: function() {
			if (!this.value) {
				this.load();
			} else {
				this.save(this.value);
			}
		},

		load: function() {
			this.value = this._storage.value;
			return this.value;
		},

		hasKey: function(key) {
			return this._storage.hasKey(key);
		},

		_keyChanged: function() {
			this._storage.key = this.key;
		},

		_valueChanged: function() {
			if (this.auto) {
				this._storage.value = this.value;
			}
		},


	});
})(window.Strand = window.Strand || {}); 