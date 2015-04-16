/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt
*/
/* test.js */
Polymer('mm-item-notifier', {

	ver:"<<version>>",

	publish: {
		target:null,
		removedNodes: [],
		addedNodes:[],
		subtree:false,
		characterData: false,
		watchAttributes: false,
	},

	attached: function() {
		this.addObserver();
	},

	observe: {
		"target subtree characterData":"addObserver"
	},

	addObserver: function() {
		if (this.observer) {
			this.observer.disconnect();
		}
		this.observer = new MutationObserver(this.nodesChanged.bind(this));
		this.observer.observe(this.targetNode, {
			childList:true,
			subtree: this.subtree,
			attributes: this.watchAttributes,
			characterData: this.characterData
		});
	},

	nodesChanged: function(mutations) {
		Array.prototype.slice.call(mutations).forEach(this.mutationHandler.bind(this));
	},

	mutationHandler: function(mutation) {
		if (mutation.addedNodes.length) {
			this.fire("added", {nodes:Array.prototype.slice.call(mutation.addedNodes)});
			this.addedNodes = mutation.addedNodes;
		}
		if (mutation.removedNodes.length) {
			this.fire("removed", {nodes:Array.prototype.slice.call(mutation.removedNodes)});
			this.removedNodes = mutation.removedNodes;
		}
		if (mutation.addedNodes.length === 0 && mutation.removedNodes.length === 0) {
			this.fire("modified", {nodes:[mutation.target]});
		}
	},

	detached: function() {
		this.observer.disconnect();
	},

	get targetNode() {
		if (this.target && this.target instanceof String) {
			document.querySelector(this.target);
		} else if (this.target && this.target instanceof HTMLElement) {
			return this.target;
		}
		return this;
	}
});