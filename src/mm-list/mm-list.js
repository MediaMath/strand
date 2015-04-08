/* test.js */
Polymer('mm-list', {

	ver:"<<version>>",

	publish: {
		selectedIndex:-1,
		activeIndex:-1,
		valueAttr:"value",
		selectedClass:"selected",
		activeAttr:"active",
		itemSelector:"mm-list-item",
		target: null,
		scope: null,
	},

	ready: function() {
		if (!this.target) {
			this.target = this;
		}
		this.model = {};
	},

	attached: function() {
		if (!this.scope) {
			this.scope = this;
		}
	},

	targetChanged: function(oldValue, newValue) {
		if (oldValue) {
			document.querySelector(oldValue).removeEventListener("down");
			document.querySelector(oldValue).removeEventListener("mouseover");
		}
		if (newValue) {
			this.updateModel();
			this.addBinds();
			this.targetNode.addEventListener("down", this.selectItem.bind(this) );
			this.targetNode.addEventListener("mouseover", this.activeItem.bind(this) );
		}
	},

	activeAttrChanged: function(oldValue, newValue) {
		this.addBinds();
	},

	selectedClassChanged: function(oldValue, newValue) {
		this.addBinds();
	},

	itemAdded: function(e) {
		this.updateModel(true);
		e.detail.nodes.forEach(this.addBind.bind(this));
	},

	itemRemoved: function(e) {
		this.updateModel(true);
	},

	addBinds: function() {
		this.items.forEach(this.addBind.bind(this));
	},

	addBind: function(item) {
		if (item.nodeType === 1) {
			var m = this.model[this.items.indexOf(item)];
			item.bind(this.activeAttr + '?', new PathObserver(m, 'active'));
			item.bind(this.selectedClass + '?', new PathObserver(m, 'selected'));
			item.bind('index', new PathObserver(m, 'index'));
		}
	},

	selectItem: function(input) {
		var index;
		if (input instanceof Event && this.items.indexOf(input.target) !== -1) {
			this.selectedIndex = parseInt(input.target.getAttribute("index"));
		}
	},

	activeItem: function(input) {
		var i;
		if (input instanceof Event) {
			i = parseInt(input.target.getAttribute("index"));
			this.activeIndex = i;
		}
	},

	getIndexByValue: function(value) {
		if (this.model) {
			var keys = Object.keys(this.model), 
				o;

			keys.forEach(function(key) {
				if (this.model[key].value === value) {
					o = this.model[key].index;
				}
			}.bind(this));

			return o;
		}
	},

	selectedIndexChanged: function(oldIndex, newIndex) {
		this.fire("selected", this.model[this.selectedIndex]);
		if (oldIndex >= 0) {
			if (this.model[oldIndex]) 
			this.model[oldIndex].selected = false; 
		}
		if (newIndex >=0) {
			if (this.model[newIndex]) 
			this.model[newIndex].selected = true; 
		}
	},

	activeIndexChanged: function(oldIndex, newIndex) {
		if (oldIndex >= 0) {
			if (this.model[oldIndex]) 
			this.model[oldIndex].active = false; 
		}
		if (newIndex >=0) {
			if (this.model[newIndex])
			this.model[newIndex].active = true; 
		}
	},

	updateModel: function(reset) {
		var index;
		if (reset) this.model = {};
		function updateItem(item) {
			index = this.items.indexOf(item);
			if(!this.model[index]) {
				this.model[index] = {
					item: item,
					index: index,
					value: item.getAttribute(this.valueAttr) || item.textContent.trim(),
					selected: index ==(this.selectedIndex-1),
					active: index == (this.activeIndex-1),
				};
			}
		}

		this.items.forEach(updateItem.bind(this));
	},

	get items() {
		var items = [];
		if (this.target === this) {
			items = Array.prototype.slice.call(this.$.content.getDistributedNodes());
		} else {
			items = Array.prototype.slice.call(this.targetNode.querySelectorAll(this.itemSelector));
		}
		return items.filter(function(item) { return item.nodeName !== "TEMPLATE"; });
	},

	get targetNode() {
		if (typeof this.target === "string") {
			document.querySelector(this.target);
		} else if (this.target instanceof HTMLElement) {
			return this.target;
		}
		return this;
	}

});