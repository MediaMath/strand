var should = chai.should();

describe("mm-footer", function() {
	
	it("should have an element constructor", function() {
		var a = new MMFooter();
		a.nodeName.should.equal("MM-FOOTER");
	});

	it("footer message should be display: none if message has a value", function(done) {
		var a = document.querySelector("#footerMsg"),
			msg = a.shadowRoot.querySelector("#messageBox"),
			display = null;

		setTimeout(function() {
			display = TestHelper.getPropertyValue(msg, "display");
			display.should.equal("none");
			done();
		}, 150);
	});

	it("footer padding should be 15px", function(done) {
		var a = document.querySelector("#footerMsg"),
			aInner = a.shadowRoot.querySelector(".footer"),
			paddingTop = null,
			paddingRight = null,
			paddingBottom = null,
			paddingLeft = null,
			allSame = false;

		setTimeout(function() {
			paddingTop = TestHelper.getPropertyValue(aInner, "padding-top");
			paddingRight = TestHelper.getPropertyValue(aInner, "padding-Right");
			paddingBottom = TestHelper.getPropertyValue(aInner, "padding-bottom");
			paddingLeft = TestHelper.getPropertyValue(aInner, "padding-left");
			allSame = (paddingTop = paddingRight = paddingBottom = paddingLeft) ? true : false;
			allSame.should.equal(true);
			paddingTop.should.equal("15px");
			done();
		}, 150);
	});

	it("light dom mm-button NOT :last-child should have margin-right: 10px", function(done) {
		var a = document.querySelector("#footerMsg"),
			saveAndClose = document.querySelector("#saveAndClose"),
			marginRight = null;

		setTimeout(function() {
			marginRight = TestHelper.getPropertyValue(saveAndClose, "margin-right");
			marginRight.should.equal("10px");
			done();
		}, 150);
	});

	it("light dom mm-button :last-child should have margin-right: 0px", function(done) {
		var a = document.querySelector("#footerMsg"),
			saveAndAdd = document.querySelector("#saveAndAdd"),
			marginRight = null;

		setTimeout(function() {
			marginRight = TestHelper.getPropertyValue(saveAndAdd, "margin-right");
			marginRight.should.equal("0px");
			done();
		}, 150);
	});

});