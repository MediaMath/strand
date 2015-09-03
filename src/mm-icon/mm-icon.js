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
				value: Colors.A2,
				observer: "_primaryColorChanged"
			},
			hoverColor: {
				type:String, 
				value: null,
				observer: "_hoverColorChanged"
			}
		},

		_hoverColorChanged: function(newVal, oldVal) {
			this.customStyle['--icon-hover-color'] = newVal;
			this.debounce("callUpdateStyles", this._callUpdateStyles, 100);
		},

		_primaryColorChanged: function(newVal, oldVal) {
			this.customStyle['--icon-color'] = newVal;
			this.debounce("callUpdateStyles", this._callUpdateStyles, 100);
		},

		_callUpdateStyles: function() {
			this.async(function() {
				this.updateStyles();
			});
		},

		_updateClass: function(type) {
			var o = {};
			o["icon-"+type] = true;
			o["_mm_icon"] = true;
			return this.classBlock(o);
		},

		_updateStyle: function(width, height) {
			return this.styleBlock({
				minWidth: width + "px",
				minHeight: height + "px", 
				lineHeight: height + "px",
				fontSize: height + "px"
			});
		}

	});

})(window.Strand=window.Strand || {}); 