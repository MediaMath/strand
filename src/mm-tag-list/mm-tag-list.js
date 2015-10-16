(function(scope) {

	scope.TagList = Polymer({

		is: 'mm-tag-list',

		properties: {
			data: {
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

		_removeTag: function(e) {
			var repeater = this.$.repeater,
				item = repeater.itemForElement(e.target),
				index = this.data.indexOf(item),
				removed = this.splice('data', index, 1);
			this.fire('removed', {removed: removed, index: index});
		},

		_handleDrag: function(e) {
			if(e.target.classList.contains('tag')) this._tagToMove = e.target;

			var tagRect = this._tagToMove.getBoundingClientRect();

			if(!this._placeholder) {
				var ph = document.createElement('li');
				ph.className = 'placeholder';
				ph.textContent = 'test';

				ph.style.borderRadius = '2px';
				ph.style.display = 'inline-block';
				ph.style.height = tagRect.height+"px";
				ph.style.width = tagRect.width+"px";

				this.$.list.appendChild(ph);
				this._placeholder = ph;
			}
		},

		_handleDragenter: function(e) {
			if(e.target !== this._tagToMove && e.target !== this._tagToMove.nextElementSibling && e.target.classList.contains('tag')) {
				this._dropTarget = e.target;
				if(this._placeholder) this.$.list.insertBefore(this._placeholder, this._dropTarget);
			}
		},

		_handleDragend: function() {
			this.$.list.insertBefore(this._tagToMove, this._placeholder);
			this.$.list.removeChild(this._placeholder);
		},

	});

})(window.Strand = window.Strand || {});