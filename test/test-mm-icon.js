var should = chai.should();

describe("mm-icon", function() {
	
	it("should have an element constructor", function() {
		var a = new MMIcon();
		a.nodeName.should.equal("MM-ICON");
	});

	it("should have a unique id", function() {
		var a = new MMIcon();
		should.exist(a.uid);
	});

	it("should have a default width and height of 28px by 28px", function(done) {
		var a = document.querySelector("#plus"),
			aInner = a.shadowRoot.querySelector("#iconGlyph"),
			fontSize = "",
			width = 0,
			height = 0;

		should.exist(a.width);
		should.exist(a.height);
		a.width.should.equal(28);
		a.height.should.equal(28);

		setTimeout(function() {
			fontSize = TestHelper.getPropertyValue(aInner, "font-size");
			width = TestHelper.widthIntRounded(aInner);
			height = TestHelper.heightIntRounded(aInner);
			fontSize.should.equal("28px");
			height.should.equal(28);
			width.should.equal(28);
			done();
		}, 150);
	});

	it("should have the correct primaryColor", function(done) {
		var a = document.querySelector("#alerts"),
			aInner = a.shadowRoot.querySelector("#iconGlyph"),
			expectedColor = TestHelper.hexToRgb("#00FF00"),
			color = null;

		a.primaryColor = expectedColor;

		setTimeout(function() {
			color = TestHelper.getRgbNoSpace(aInner, "color");
			color.should.equal(expectedColor);
			done();
		}, 150);
	});

	it("should have a hover class which matches it's uid", function() { 
		var a = document.querySelector("#geoHover"),
			styleNodes = a.shadowRoot.querySelector("style[no-shim]"),
			expectedHoverClass = "._mm_icon." + a.uid + ":hover{color:" + a.hoverColor + "}",
			tc = styleNodes.textContent..replace(/\s/ig,"");
			hoverClass = tc.indexOf(expectedHoverClass) !== -1;

		hoverClass.should.equal(true);
	});

});