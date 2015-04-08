Polymer('mm-inline-box', {
	ver:"<<version>>",
	maxlines: 1,
	LINE_HEIGHT: 18,

	publish: {
		type: { value: "info", reflect: true },
		layout: "default"
	},

	ready: function() {
		this.typeChanged("",this.type);
	},

	typeChanged: function(oldVal, newVal) {
		var primaryColor, 
			icon;

		switch (this.type) {
			case "error":
				icon = this.$.warningIcon;
				primaryColor = Colors.C3;
			break;
			case "warning":
				icon = this.$.warningIcon;
				primaryColor = Colors.E5;
			break;
			case "success":
				icon = this.$.successIcon;
				primaryColor = Colors.B6;
			break;
			case "info":
				icon = this.$.infoIcon;
				primaryColor = Colors.D3;
			break;
		}
		
		if(icon){
			icon.primaryColor = primaryColor;
		}
	},

	layoutChanged: function(oldVal, newVal) {
		// console.log('layoutChanged: ' + newVal);
	}
});