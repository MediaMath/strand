var should = chai.should();

describe("mm-dropdown", function() {
	
	it("should have an element constructor", function() {
		var a = new MMDropdown();
		a.nodeName.should.equal("MM-DROPDOWN");
	});

	it("ddl should fit to parent", function(done) {
		var ddl = document.querySelector("#ddlFit"),
			width = 0;

		setTimeout(function() {
			width = TestHelper.widthIntRounded(ddl);
			width.should.equal(500);
			done();
		}, 150);
	});

	it("ddl should be in open state on click", function(done) {
		var ddl = document.querySelector("#ddl"),
			ddlInner = ddl.shadowRoot.querySelector(".button"),
			evtMd = new Event("mousedown");

		ddlInner.dispatchEvent(evtMd);

		setTimeout(function() {
			ddl.state.should.equal(ddl.STATE_OPENED);
			done();
		}, 150);
	});

	it("ddl close panel should be the width of a list item if 'overflow = visible'", function(done) {
		var ddl = document.querySelector("#ddlOverflow"),
			cpWidth = 0,
			itemWidth = 0,
			borderWidth = 0;

		setTimeout(function() {
			itemWidth = TestHelper.widthIntRounded(ddl.items[0]);
			cpWidth = TestHelper.widthIntRounded(ddl.$.closePanel);
			borderWidth = Measure.getBorderWidth(ddl.$.closePanel.$.container);
			itemWidth += borderWidth;
			itemWidth.should.equal(cpWidth);
			done();
		}, 150);
	});

	it("ddl close panel height should be 'itemHeight * maxItems' if 'maxItem = n'", function(done) {
		var ddl = document.querySelector("#ddlFit"),
			cpHeight = 0,
			itemHeight = 0,
			maxItems = 0,
			borderHeight = 0,
			panelHeight = null;

		setTimeout(function() {
			itemHeight = ddl.itemHeight;
			maxItems = ddl.maxItems;
			cpHeight = TestHelper.heightIntRounded(ddl.$.closePanel);
			borderHeight = Measure.getBorderWidth(ddl.$.closePanel.$.container);
			panelHeight = (itemHeight * maxItems) + borderHeight;
			panelHeight.should.equal(cpHeight);
			done();
		}, 150);
	});

	it("ddl button font weight should NOT be bold", function(done) {
		var ddl = document.querySelector("#ddlFit"),
			expectedWeight = true,
			fontWeight = null;

		setTimeout(function() {
			function notBold(input) {
				return (input === "400" || input === "normal") ? true : false;
			}
			fontWeight = TestHelper.getPropertyValue(ddl.shadowRoot.querySelector(".button"), "font-weight");
			fontWeight = notBold(fontWeight);
			fontWeight.should.equal(expectedWeight);
			done();
		}, 150);
	});

	it("ddl button text color should be Colors.A2", function(done) {
		var ddl = document.querySelector("#ddlFit"),
			expectedColor = TestHelper.hexToRgb(Colors.A2),
			color = null;

		setTimeout(function() {
			color = TestHelper.getRgbNoSpace(ddl.shadowRoot.querySelector(".button"), "color");
			color.should.equal(expectedColor);
			done();
		}, 150);
	});

	// TODO: mm-close-panel related post refactor(?)

});