var should = chai.should();

describe("mm-button", function() {
	
	it("should have an element constructor", function() {
		var a = new MMButton();
		a.nodeName.should.equal("MM-BUTTON");
	});

	it("should set icon primaryColor if an icon is present", function(done) {
		var a = document.querySelector("#btnIcon"),
			color = a.PRIMARY_ICON_COLOR;

		setTimeout(function() {
			a.items[0].getAttribute("primaryColor").should.equal(color);
			done();
		}, 150);
	});

	it("width of '#btnIcon' should be 146px if it rendered correctly", function(done) {
		var a = document.querySelector("#btnIcon"),
			width = 0;

		setTimeout(function() {
			width = TestHelper.widthIntRounded(a);
			width.should.equal(146);
			done();
		}, 150);

	});

	it("button width should match container width if fitparent", function(done) {
		var a = document.querySelector("#btnSec"),
			width = 0;

		setTimeout(function() {
			width = TestHelper.widthIntRounded(a);
			width.should.equal(500);
			done();
		}, 150);

	});

	it("button color should be Colors.A2 if type 'secondary'", function(done) {
		var a = document.querySelector("#btnSec"),
			bInner = a.shadowRoot.querySelector(".button"),
			secondaryColor = TestHelper.hexToRgb(Colors.A2),
			color = null;

		setTimeout(function() {
			color = TestHelper.getRgbNoSpace(bInner, "color");
			color.should.equal(secondaryColor);
			done();
		}, 150);
	});

	it("button color should be Colors.D0 if type 'primary'", function(done) {
		var a = document.querySelector("#btnIcon"),
			bInner = a.shadowRoot.querySelector(".button"),
			primaryColor = TestHelper.hexToRgb(Colors.D0),
			color = null;

		setTimeout(function() {
			color = TestHelper.getRgbNoSpace(bInner, "color");
			color.should.equal(primaryColor); 
			done();
		}, 150);
	});
	
});