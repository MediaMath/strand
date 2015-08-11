(function(scope) {

	scope.Menu = Polymer({
		is: 'mm-menu-alt',

		behaviors: [
			StrandTraits.AutoClosable,
			StrandTraits.AutoTogglable,
			StrandTraits.Stackable,
			StrandTraits.PositionablePanel
		],

		attached: function() {
			this.async(function() {
				if (this.target) this.target.style.cursor = 'pointer';
			});
		}
	});

})(window.Strand = window.Strand || {});