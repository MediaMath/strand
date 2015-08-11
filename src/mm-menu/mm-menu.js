(function(scope) {

	scope.Menu = Polymer({
		is: 'mm-menu',

		properties: {
			target: {
				type: Object,
				value: function() { return this.$.target; }
			},
			scope: {
				type: Object,
				value: function() { return this; }
			},
			state: {
				type: String,
				value: "closed",
			},
			direction: {
				type: String,
				value: "s"
			},
			offset: {
				type: Number,
				value: 0,
			}
		},

		behaviors: [
			StrandTraits.AutoClosable,
		],

	});

})(window.Strand = window.Strand || {});