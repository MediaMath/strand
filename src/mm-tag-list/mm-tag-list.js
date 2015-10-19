(function(scope) {

	var Rectangle = StrandLib.Rectangle;

	scope.TagList = Polymer({

		is: 'mm-tag-list',

		properties: {
			data: {
				// Should add a _sortIndex to all the items here so we can keep track of order independent of DOM/how they are ordered in the array
				type: Array,
				value: function() { return []; },
				notify: true
			},

			sortable: {
				type: Boolean,
				value: false
			},


			_dropTarget: {
				type: Object,
				value: null
			},
			_placeholder: {
				type: Object,
				value: null
			},
			_tagToMove: {
				type: Object,
				value: null
			}
		},

		_compareItems: function(a,b) {
			
		},

		_removeTag: function(e) {
			var repeater = this.$.repeater,
				item = repeater.itemForElement(e.target),
				index = this.data.indexOf(item),
				removed = this.splice('data', index, 1);
			this.fire('removed', {removed: removed, index: index});
		},

		_handleDrag: function(e) {
			if(e.target.classList.contains('tag')) this._tagToMove = e.target;

			this._tagToMove.style.opacity = '0';
			this._tagToMove.style.position = 'absolute';

			if(!this._placeholder) {
				var ph = document.createElement('li');
				ph.className = 'placeholder';
				var tagRect = Rectangle.fromElement(this._tagToMove);
				ph.style.height = tagRect.height+"px";
				ph.style.width = tagRect.width+"px";

				Polymer.dom(this.$.list).appendChild(ph);
				this._placeholder = ph;
			}
		},

		_handleDragenter: function(e) {
			if(e.target !== this._tagToMove && e.target.classList.contains('tag')) {
				this._dropTarget = e.target;
				var targetRect = Rectangle.fromElement(this._dropTarget);
				
				if(this._placeholder) {
					if(e.x <= targetRect.center) this.$.list.insertBefore(this._placeholder, this._dropTarget);
					else if(this._dropTarget.nextElementSibling) this.$.list.insertBefore(this._placeholder, this._dropTarget.nextElementSibling);
					else this.$.list.appendChild(this._placeholder);
				}
			}
		},

		_handleDragend: function() {
			// TODO: Reflect these changes to the data model
			this.$.list.insertBefore(this._tagToMove, this._placeholder);
			this.$.list.removeChild(this._placeholder);
			this._placeholder = null;

			this._tagToMove.style.opacity = null;
			this._tagToMove.style.position = null;

			// console.table(this.data);
		},

	});

})(window.Strand = window.Strand || {});