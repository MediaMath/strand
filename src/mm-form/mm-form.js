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
		}
	
	});

})(window.Strand = window.Strand || {});