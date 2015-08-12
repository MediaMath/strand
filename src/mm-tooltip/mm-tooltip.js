(function(scope) {

	scope.Tooltip = Polymer({
		is: 'mm-tooltip',

		behaviors: [
			StrandTraits.Stackable,
			StrandTraits.PositionablePanel,
			StrandTraits.Stylable
		],

		properties: {
			CLOSE_ICON_COLOR: {
				type: String,
				value: Colors.A4
			},
			CLOSE_ICON_HOVER: {
				type: String,
				value: Colors.F0
			},
			auto: { 
				type: Boolean,
				value: false, 
				refelctToAttribute: true,
				observer: '_autoChanged'
			},
			direction: {
				value: 'n'
			},
			tipWidth: {
				type: Number,
				value: false, // if not set, assume it should be the width of it's content
				refelctToAttribute: true,
				observer: '_widthChanged'
			}
		},

		attached: function() {
			this.async(function() {
				if (this.target) {
					this.target.addEventListener('mouseover', this._overHandler.bind(this));
					this.target.addEventListener('mouseout', this._outHandler.bind(this));
					this.target.style.cursor = 'pointer';
				}
			});
		},

		removed: function() {
			if (this.target) {
				this.target.removeEventListener('mouseover', this._overHandler.bind(this));
				this.target.removeEventListener('mouseout', this._outHandler.bind(this));
				this.target.style.cursor = 'default';
			}
		},

		// see StrandTraits.AutoClosable for 'open' & 'close'
		// also see positionable-tip where we extend 'open' & 'close' 
		_overHandler: function(e) {
			this.open();
		},

		_outHandler: function(e) {
			if(!this.auto) {
				this.close();
			}
		},

		_widthChanged: function(newVal, oldVal) {
			this.style.width = newVal + 'px';
		},

		_autoChanged: function(newVal, oldVal) {
			if (newVal && typeof newVal === 'string') {
				newVal = JSON.parse(newVal.toLowerCase());
			}
		},

		_updateClass: function(auto) {
			var o = {};
			o.auto = auto;
			return this.classBlock(o);
		},

		_closeFilter: function(instance, e, original) {
			var closeIcon = instance.$$('.close-icon');
			if(e.path.indexOf(closeIcon) > -1){
				instance.close();
			}
		}

	});

})(window.Strand = window.Strand || {});