/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {
	
	scope.MMForm = Polymer({
		is: 'mm-form',

		behaviors: [
			StrandTraits.LightDomGettable,
			StrandTraits.Resolvable
		],

		properties: {
			columns: {
				type: Number,
				value: 4,
				reflectToAttribute: true
			},
			spacing: {
				type: Number,
				value: 10,
				reflectToAttribute: true
			},
			// submitMessage: {
			// 	type: String,
			// 	notify: true
			// },
			formItems: {
				type: Array
			},
			formData: {
				type: Object,
				value: function() { return {}; }
			}
		},

		observers: [
			"_applyStyles(columns, spacing)"
		],

		ready: function() {
			// build form data object
			// TODO: consider effective children apis once we get to v1.2.3
			// https://www.polymer-project.org/1.0/docs/devguide/local-dom.html#effective-children
			this.async(function() {
				this.formItems = Polymer.dom(this).querySelectorAll('[form-id]');
				this.formItems.forEach(function(item) {
					this.formData[item.formId] = item.value;
				}.bind(this));
				console.log("this.formData: ", this.formData);
			});
		},

		submitForm: function() {
			var invalid = [],
				valid = [];

			// UI validation pass:
			// console.log('submitForm');
			this.formItems.forEach(function(item){
				// update the form data object:
				this.formData[item.formId] = item.value;

				// validate UI:
				var isValid = item.validate(item.value);

				// track invalids
				if (!isValid) {
					invalid.push(item.formId);
				} else {
					valid.push(item.formId);
				}

				// show error state:
				item.error = !isValid;

				// show target message:
				if(item._errorTarget && !isValid) {
					// item._errorTarget.display();
					item._errorTarget.style.display = 'block';
				} else {
					// item._errorTarget.hide();
					item._errorTarget.style.display = 'none';
				}
			}.bind(this));

			if (invalid.length > 0) {
				// there were errors
				// show footer error
				// console.log('invalids:', invalids);	
				this.submitMessage = 'This form contains errors';
			} else {
				// send the data to some endpoint
				// handle that response
			}

			// fire an invalid form event:
			this.fire('form-submit', {
				isValid: !invalid.length > 0,
				invalidFields: invalid,
				validFields: valid,
				data: this.formData 
			});
		},

		// styling concerns (columns)
		_applyStyles: function(columns, spacing) {
			var items = this.getLightDOM();

			if (items.length > 0) {
				var spanItems = items.filter(function(item){
						return item.hasAttribute('span');
					}),
					columnWidth = 100/columns;

				spanItems.forEach(function(item, index){
					var span = parseInt(item.getAttribute('span')),
						colWidth = columnWidth * span,
						calc = 'calc(' + colWidth + '% - ' + spacing + 'px)';

					item.style.width = calc;
					item.style.marginRight = spacing + 'px';
					item.style.marginBottom = spacing + 'px';
				});
			}
		},
	
	});

})(window.Strand = window.Strand || {});