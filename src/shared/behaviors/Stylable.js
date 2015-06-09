(function (scope) {
	 var Stylable = {

	 	styleList: function(styles) {
			var out = [];
			for (var style in styles) {
				var n = String(style).replace(/[A-Z]/g, function(c) {
					return '-' + c.toLowerCase();
				});
			out.push(n + ': ' + styles[style]);
			}
			return out.join('; ');
	 	},

	 	classList: function(classes) {
			var out = [];
			for (var cl in classes) {
				if (classes[cl]) out.push(cl);
			}
			return out.join(' ');
		},
	 };
	 scope.Stylable = Stylable;
})(window.StrandTraits = window.StrandTraits || {}); 