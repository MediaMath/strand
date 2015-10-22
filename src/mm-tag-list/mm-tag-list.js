(function(scope) {

	var Rectangle = StrandLib.Rectangle;

	scope.TagList = Polymer({

		is: 'mm-tag-list',

		properties: {
			data: {
				type: Array,
				value: function() { return []; },
				notify: true,
				observer: '_dataChanged'
			},
			sortField: {
				type: String,
				value: "sortIndex"
			},
			sortable: {
				type: Boolean,
				value: false
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

		save: function() {
			if(this.sortable && this.sortField) {
				var items = this.$.list.querySelectorAll('li');
				for(var i=0; i<items.length; i++) {
					var item = items[i];
					var model = this.$.repeater.modelForElement(item);
					model.set('item.'+[this.sortField], i);
				}
			}
		},

		_dataChanged: function() {
			if (this.sortField && this.data.length > 0 && !this.data[0][this.sortField]) {
				for(var i=0; i<this.data.length; i++) {
					this.data[i][this.sortField] = i;
				}
			}
		},

		_compareItems: function(a,b) {
			return a[this.sortField] - b[this.sortField];
		},

		_removeTag: function(e) {
			var repeater = this.$.repeater,
				index = repeater.indexForElement(e.target),
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
				var referenceElement = e.target;
				var referenceRect = Rectangle.fromElement(referenceElement);
				
				if(this._placeholder) {
					if(e.x <= referenceRect.center) this.$.list.insertBefore(this._placeholder, referenceElement);
					else if(referenceElement.nextElementSibling) this.$.list.insertBefore(this._placeholder, referenceElement.nextElementSibling);
					else this.$.list.appendChild(this._placeholder);
				}
			}
		},

		_handleDragend: function() {
			this.$.list.insertBefore(this._tagToMove, this._placeholder);
			this.$.list.removeChild(this._placeholder);
			this._placeholder = null;
			this._tagToMove.style.opacity = null;
			this._tagToMove.style.position = null;
			this._tagToMove = null;
		}

	});

})(window.Strand = window.Strand || {});