(function(scope) {

	scope.Menu = Polymer({
		is: 'strand-menu',

		behaviors: [
			StrandTraits.Resolvable,
			StrandTraits.AutoClosable,
			StrandTraits.AutoTogglable,
			StrandTraits.PositionablePanel,
			StrandTraits.Stackable,
			StrandTraits.LightDomGettable,
			StrandTraits.Refable
		],

		listeners: {
			'click':'_handleSelect'
		},

		attached: function() {
			this.async(function() {
				if (this._target) this._target.style.cursor = 'pointer';
			});
		},

		_handleSelect: function(e) {
			if (e.target !== this.$.container) {
				this.fire('selected',{
					item: e.target,
					index: this.getLightDOM().indexOf(e.target),
					value: e.target.getAttribute('value') || e.target.textContent.trim()
				});
			}
		}
	});

})(window.Strand = window.Strand || {});