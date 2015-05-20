var should = chai.should();

describe("mm-inline-box", function() {
	
	it("should have an element constructor", function() {
		var a = new MMInlineBox();
		a.nodeName.should.equal("MM-INLINE-BOX");
	});

	it("should have default type of 'info'", function() {
		var a = new MMInlineBox();
		should.exist(a.type);
		should.equal(a.type, "info");
	});

	it("should have default layout of 'default'", function() {
		var a = new MMInlineBox();
		should.exist(a.layout);
		should.equal(a.layout, "default");
	});

	it("should assign corect primaryColor when type is changed", function() {
		var a = document.querySelector("#warning"),
			expectedColor = Colors.E5,
			outputColor = null;

		a.type = "error";
		outputColor =  a.$.warningIcon.primaryColor;
		outputColor.should.equal(expectedColor);
	});

	it("should assign corect icon when type is changed", function() {
		var a = document.querySelector("#warning"),
			expectedType = "success",
			outputType = null;

		a.type = "success";

		outputType = a.type;
		outputType.should.equal(expectedType);
	});

	it("should have no border box if type = 'message'", function(done) {
		var a = document.querySelector("#message"),
			aInner = a.shadowRoot.querySelector(".box"),
			noBorder = null,
			noPadding = null;

		setTimeout(function() {
			noBorder = TestHelper.getPropertyValue(aInner, "border-left-width");
			noPadding = TestHelper.getPropertyValue(aInner, "padding-left");
			noBorder = noBorder.indexOf("0px") !== -1;
			noPadding = noPadding.indexOf("0px") !== -1;
			noBorder.should.equal(true);
			noPadding.should.equal(true);
			done();
		}, 150);
	});

});