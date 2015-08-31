/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function (scope) {
	
	scope.Icon = Polymer({
		is:"mm-icon",

		behaviors: [
			StrandTraits.Stylable
		],

		properties: {
			type: {
				type:String,
				value:"plus", 
				reflectAsAttribute:true 
			},
			width:{
				type:Number, 
				value: 28
			},
			height: {
				type:Number, 
				value: 28
			},
			primaryColor: {
				type:String, 
				value: Colors.A2 
			},
			hoverColor: {
				type:String, 
				value: null,
				observer: "_hoverColorChanged"
			}
		},

		_primaryColor: null,
		
		detached: function() {
			this._removeListeners();
		},

		_hoverColorChanged: function(newVal, oldVal) {
			if (newVal) {
				this.addEventListener("mouseover", this._over);
				this.addEventListener("mouseout", this._out);
			} else {
				this._removeListeners();
			}
		},

		_removeListeners: function() {
			this.removeEventListener("mouseover", this._over);
			this.removeEventListener("mouseout", this._out);
		},

		_over: function(e) {
			if (this.hoverColor) {
				this._primaryColor = this.primaryColor;
				this.primaryColor = this.hoverColor;
			}
		},

		_out: function(e) {
			if (this.hoverColor) {
				this.primaryColor = this._primaryColor;
			}
		},

		_updateClass: function(type) {
			var o = {};
			o["icon-"+type] = true;
			o["_mm_icon"] = true;
			return this.classBlock(o);
		},

		_updateStyle: function(width, height, primaryColor) {
			var h = this.hoverColor ? "pointer" : "default";

			return this.styleBlock({
				color: primaryColor,
				cursor: h,
				minWidth: width + "px",
				minHeight: height + "px", 
				lineHeight: height + "px",
				fontSize: height + "px"
			});
		}

	});

})(window.Strand=window.Strand || {}); 