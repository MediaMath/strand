var should = chai.should();

describe("mm-checkbox", function() {
	
	it("should have an element constructor", function() {
		var a = new MMCheckbox();
		a.nodeName.should.equal("MM-CHECKBOX");
	});

	it("value should equal 'true' if checked attribute set", function(done) {
		var a = document.querySelector("#cbx");
		a.setAttribute("checked", null);

		setTimeout(function() {
			a.value.should.equal(true);
			done();
		}, 150);
	});

	it("should have a style of 'selected' applied to the inner #checkbox div", function(done) {
		var a = document.querySelector("#cbx"),
			aInner = a.shadowRoot.querySelector("._mm_checkbox"),
			cssClass = "selected",
			hasSelected = null;

		setTimeout(function() {
			hasSelected = aInner.classList.contains(cssClass);
			hasSelected.should.equal(true);
			done();
		}, 150);
	});

	it("width of '#cbxLabel' should be 148px if it rendered correctly", function(done) {
		var a = document.querySelector("#cbxLabel"),
			style = null,
			width = 0;

		setTimeout(function() {
			width = TestHelper.widthIntRounded(a);
			width.should.equal(148);
			done();
		}, 150);
	});

	it("the inner icon color should be 'Colors.D0' if default", function(done) {
		var a = document.querySelector("#cbx"),
			aInner = a.shadowRoot.querySelector("mm-icon").shadowRoot.querySelector("#iconGlyph"),
			expectedColor = TestHelper.hexToRgb(Colors.D0),
			color = null;

		setTimeout(function() {
			color = TestHelper.getRgbNoSpace(aInner, "color");
			color.should.equal(expectedColor);
			done();
		}, 150);
	});

	it("should set icon primaryColor if custom icon is set", function(done) {
		var a = document.querySelector("#cbxIcon"),
			aInner = a.shadowRoot.querySelector("mm-icon"),
			expectedColor = a.iconColor,
			color = null;

		setTimeout(function() {
			color = aInner.primaryColor;
			color.should.equal(expectedColor);
			done();
		}, 150);
	});

});