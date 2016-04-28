(function(scope) {

	scope.Menu = Polymer({
		is: 'strand-menu',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.AutoClosable,
			StrandTraits.AutoTogglable,
			StrandTraits.PositionablePanel,
			StrandTraits.Stackable,
			StrandTraits.Refable
		],

		attached: function() {
			this.async(function() {
				if (this._target) this._target.style.cursor = 'pointer';
			});
		}
	});

})(window.Strand = window.Strand || {});