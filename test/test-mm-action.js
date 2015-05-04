var should = chai.should();

describe("mm-action", function() {
	
	it("should have an element constructor", function() {
		var a = new MMAction();
		a.nodeName.should.equal("MM-ACTION");
	});

	it("should set icon primaryColor if an icon is present", function(done) {
		var a = document.querySelector("#awesome"),
			color = a.PRIMARY_ICON_COLOR;

		setTimeout(function() {
			a.items[0].getAttribute("primaryColor").should.equal(color);
			done();
		}, 150);
	});

	it("width of '#awesome' should be 78px if it rendered correctly", function(done) {
		var a = document.querySelector("#awesome"),
			width = null;

		setTimeout(function() {
			width = TestHelper.widthIntRounded(a);
			width.should.equal(78);
			done();
		}, 150);

	});

	it("the inner a element in shadowRoot should have style text-decoration: 'underline'", function(done) {
		var a = document.querySelector("#underline"),
			aInner = a.shadowRoot.querySelector(".action");

		setTimeout(function() {
			underline = TestHelper.getPropertyValue(aInner, "text-decoration");
			underline.should.equal("underline");
			done();
		}, 150);
	});

	it("action text color should be Colors.D0", function(done) {
		var a = document.querySelector("#awesome"),
			aInner = a.shadowRoot.querySelector(".action"),
			expectedColor = TestHelper.hexToRgb(Colors.D0),
			color = null;

		setTimeout(function() {
			color = TestHelper.getRgbNoSpace(aInner, "color");
			color.should.equal(expectedColor);
			done();
		}, 150);
	});

});