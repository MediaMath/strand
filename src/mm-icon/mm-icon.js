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
			ver:{
				type:String,
				value:"<<version>>",
			},
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
				value:null 
			},
			uid: {
				type: String,
				value: function() { 
					var timestamp = new Date().valueOf(),
						rndNum	= Math.floor((Math.random()*99)+1),
						id = 'id_' + rndNum + '_' + timestamp;
					return id;
				}
			}
		},

		updateClass: function(uid, type) {
			var o = {};
			o["icon-"+type] = true;
			o["_mm_icon"] = true;
			o[this.uid] = true;
			return this.classList(o);
		},

		updateStyle: function(width, height) {
			return this.styleList({
				minWidth: width + "px",
				minHeight: height + "px", 
				lineHeight: height + "px",
				fontSize: height + "px"
			});
		},

		updateInternalStyle: function(uid, hoverColor, primaryColor) {
			return "._mm_icon."+uid+" { color: "+primaryColor+";}._mm_icon."+uid+":hover {color: "+hoverColor+";}";
		}

	});

})(window.Strand=window.Strand || {}); 