(function(scope) {

	scope.FileUpload = Polymer({
		is: 'strand-file-upload',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.Refable
		],

		properties: {
			accept: {
				type: String,
				value: ''
			},

			useDataUrls: {
				type: Boolean,
				value: false
			},

			multiple: {
				type: Boolean,
				value: false
			},

			disabled: {
				type: String,
				value: false,
				reflectToAttribute: true
			},

			dragDropEnabled: {
				type: Boolean,
				value: false
			},

			error: {
				type: Boolean,
				value: false
			},
			
			dataUrls: {
				type: Array,
				value: function() { return []; },
				notify: true
			},

			files: {
				type: Array,
				value: function() { return []; },
				notify: true
			},

			fileNames: {
				type: String,
				computed: '_getFileNames(files.splices)',
				readOnly: true
			},

			placeholder: {
				type: String,
				value: 'No file chosen'
			},

			browseLabel: {
				type: String,
				value: 'Browse'
			}
		},

		listeners: {
			'dragenter': '_handleDrag',
			'dragover': '_handleDrag',
			'drop': '_handleDrop'
		},

		_getFileNames: function(changeRecord) {
			return this.files.length > 0 ? this.files.map(function(f) { return f.name; }).join(', ') : '';
		},

		_handleChange: function(e) {
			if(e.target.files.length > 0) {
				this._handleFiles(e.target.files);
			}
		},

		_handleFiles: function(fileList) {
			var files = Array.prototype.slice.call(fileList),
				filtered = files.filter(this._validateFile.bind(this));

			if(files.length !== filtered.length) this.error = true;
			else this.error = false;

			if(this.useDataUrls) {
				for(var i=filtered.length-1; i>=0; i--) {
					(function(file) {

						var reader = new FileReader();
						reader.onload = function() {
							this.push('dataUrls',reader.result);
						}.bind(this);

						reader.readAsDataURL(file);

					}.bind(this))(filtered[i]);
				}
			}
			this.files = (this.multiple) ? filtered : filtered.splice(0,1);
		},

		_handleKeydown: function(e) {
			e.preventDefault();
		},

		_handleTap: function(e) {
			// this.fire('click', null, {node: this.$.fileInput});
			this.$.fileInput.click();
			e.preventDefault();
		},

		_handleDrag: function(e) {
			e.stopPropagation();
			e.preventDefault();
		},

		_handleDrop: function(e) {
			e.stopPropagation();
			e.preventDefault();

			if(this.dragDropEnabled) {
				this._handleFiles(e.dataTransfer.files);
			}
		},

		// Validate a file against this.accept
		_validateFile: function(file) {
			if(!this.accept) return true;
			else {
				var validators = this.accept.split(',')
					.map(function(exp) {
						if(exp.indexOf('.') === 0) {
							return exp;
						} else {
							return new RegExp(exp.replace('*','(.*?)'));
						}
					});
				var isValid = validators.reduce(function(prev, curr) {
					if(curr instanceof RegExp) {
						return prev || Boolean(file.type.match(curr));
					} else {
						return prev || (file.name.indexOf(curr) > 0);
					}
				}, false);
				return isValid;
			}
		},

		clear: function() {
			this.files = [];
			this.dataUrls = [];
			this.error = false;
		}

	});

})(window.Strand = window.Strand || {});
