Polymer('mm-footer', {
	ver:"<<version>>",
	publish: {
		message: "",
		type: "info"
	},

	messageChanged: function(oldVal, newVal) {
		// console.log("messageChanged: " + newVal);
	},

	typeChanged: function(oldVal, newVal) {
		// console.log("typeChanged: " + newVal);
	},

	showMessage: function() {
		this.$.messageBox.style.display = "block";
	},

	hideMessage: function() {
		this.$.messageBox.style.display = "none";
	}
});