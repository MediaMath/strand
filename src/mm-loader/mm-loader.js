Polymer("mm-loader", {
	ver:"<<version>>",

	publish: {
		bgColor: "#000000",
		bgOpacity: 0.5,
		paddingTop: 5,
		paddingLeft: 20
	},

	ready: function() {
		this.hasUserSpinner = this.$.userSpinner.getDistributedNodes().length !== 0;
		this.spinner = this.hasUserSpinner ? this.querySelector("mm-spinner") : this.$.spinner;
	},

	show: function () {
		this.style.display = "block";
		this.spinner.start();
	},

	hide: function () {
		this.style.display = "none";
		this.spinner.stop();
	},
	// util methods:
	convertHex: function (value) {
		// expects a 6 digit hex value:
		hex = value.replace("#","");
		r = parseInt(hex.substring(0,2), 16);
		g = parseInt(hex.substring(2,4), 16);
		b = parseInt(hex.substring(4,6), 16);

		result = "rgba("+r+","+g+","+b+","+this.bgOpacity+")";
		return result;
	}
});