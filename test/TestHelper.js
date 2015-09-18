(function() {

	var testHelper = {

		rgbToHex: function(rgb) {
			rgb = rgb.split("(")[1].split(")")[0];
			rgb = rgb.split(",");
			var output = rgb.map(function(x) {
				x = parseInt(x).toString(16);
				return (x.length==1) ? "0" + x : x;
			});
			output = output.join("").toUpperCase();
			return output;
		},

		// see: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
		hexToRgb: function(hex) {
			var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})|([a-f\d]{1})([a-f\d]{1})([a-f\d]{1})$/i.exec(hex),
				r = parseInt(hex.length <= 4 ? result[4]+result[4] : result[1], 16),
				g = parseInt(hex.length <= 4 ? result[5]+result[5] : result[2], 16),
				b = parseInt(hex.length <= 4 ? result[6]+result[6] : result[3], 16),
				arr = [r, g, b];
			return "rgb(" + arr.join(",").toUpperCase() + ")";
		},

		style: function(elem) {
			return window.getComputedStyle(elem, null);
		},

		getPropertyValue: function(elem, property) {
			var style = this.style(elem);
			return style.getPropertyValue(property);
		},

		getPropIntRounded: function(elem, property) {
			return Math.round(this.getPropertyValue(elem, property).replace("px", ''));
		},

		widthIntRounded: function(elem) {
			return Math.round(this.getPropertyValue(elem, "width").replace("px", ''));
		},

		heightIntRounded: function(elem) {
			return Math.round(this.getPropertyValue(elem, "height").replace("px", ''));
		},

		getRgbNoSpace: function(elem, property) {
			return this.getPropertyValue(elem, property).replace(/\s+/g, '');
		}

	};

	window.TestHelper = testHelper;

})();