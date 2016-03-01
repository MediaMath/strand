/*
	NOTE: GENERATED FILE DO NOT MANUALLY EDIT -- 
		EDIT TEMPLATE SOURCE IN `build/lib_color.js`
		EDIT COLORS in sass/_colors.scss
*/

(function () {
	
	var colors = {
	{{{colors}}}
	};

	function getValue(key) {
		var h = "#";
		if (key[0] === h) {
			return key;
		} else {
			return h + this[key].toString(16);
		}
	}

	colors.getValue = getValue;
	window.Colors = colors;
})(); 

