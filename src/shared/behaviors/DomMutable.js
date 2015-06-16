/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {

	scope.DomMutable = {
		properties: {
			mutationTarget:{
				type:Object,
				value: function() { return this; }
			},
			items:{
				type:Array,
				notify:true,
				value: function() { 
					return []; 
				}
			},
			observeSubtree:{
				type:Boolean,
				value: false,
			},
			observeCharacterData: {
				type:Boolean,
				value: false
			},
			observeAttributes:{
				type:Boolean,
				value: false
			},
			_observer: {
				type: Object,
				value: function() {
					return new MutationObserver(this._nodesChanged.bind(this));
				}
			}
		},

		attached: function() {
			this._observer.observe(this.mutationTarget, {
				childList:true,
				subTree: this.observeSubtree,
				attributes: this.observeAttributes,
				charachterData: this.observeCharacterData
			});
		},

		detached: function() {
			this._observer.disconnect();
			this.items = null;
		},

		ready: function() {
			this.items = Polymer.dom(this.$$("content")).getDistributedNodes().forEach(function(node) {
				this.push("items", node);
			},this);
			if (this.items && this.items.length > 0) {
				this.fire("added", {nodes:this.items.slice()});
			}
		},

		_nodesChanged: function(mutations) {

			Array.prototype.slice.call(mutations).forEach( function(mutation) {
				var added = Array.prototype.slice.call(mutation.addedNodes);
				var removed = Array.prototype.slice.call(mutation.removedNodes);

				if (added.length) {
					this.fire("added", {nodes:added});
					added.forEach(function(node) {
						this.push("items",node);
					},this);
				}
				if (removed.length) {
					this.fire("removed", {nodes:removed});
					removed.forEach(function(node) {
						this.splice("items", this.items.indexOf(node), 1);
					});
				}
				if (added.length === 0 && removed.length === 0) {
					this.fire("modified", {nodes:[mutation.target]});
				}

			}, this);
		}

	 };
})(window.StrandTraits = window.StrandTraits || {}); 