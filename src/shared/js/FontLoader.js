(function (scope) {

	var _test = "Hello World help computer";
	var _size = "1000px ";
	function FontLoader() {

		this.shouldCheck = false;
		this.fonts = {};
		this.canv = document.createElement("canvas");

		this.ctx = this.canv.getContext("2d");
		this.ctx.font = _size + "_sans";
		this.sans = this.ctx.measureText(_test).width;
	}

	FontLoader.prototype = {
		add:function(family) {
			if (!this.fonts[family]) {
				this.fonts[family] = pinkySwear();
				this.shouldCheck = true;
			}
			if (this.shouldCheck) {
				window.requestAnimationFrame(this.checkLoad.bind(this));
			}
			return this.fonts[family];
		},
		checkLoad: function() {
			var w=0.0;
			var check = false;
			for(var i in this.fonts) {
				this.ctx.font = _size + i;
				w = this.ctx.measureText(_test).width;
      			if (this.sans !== w) {
					this.fonts[i](true, [i,w]);
					check = this.fonts[i]() || check;
				}

			}
			if (!check){
				window.requestAnimationFrame(this.checkLoad.bind(this));
			} else {
				this.shouldCheck = false;
			}
		}

	};
	scope.FontLoader = FontLoader;
	
})(window.StrandLib = window.StrandLib || {});
