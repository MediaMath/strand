var should = chai.should();

describe("mm-inline-box", function() {
	
	it("should have an element constructor", function() {
		var a = new Strand.InlineBox();
		a.nodeName.should.equal("MM-INLINE-BOX");
	});

	it("should have default type of 'info'", function() {
		var a = new Strand.InlineBox();
		should.exist(a.type);
		should.equal(a.type, "info");
	});


	it("should assign corect primaryColor when type is changed", function() {
		var a = document.querySelector("#warning"),
			expectedColor = Colors.C3,
			outputColor = null;

		a.type = "error";
		outputColor = a.$.icon.primaryColor;
		outputColor.should.equal(expectedColor);
	});

	it("should assign corect icon when type is changed", function() {
		var a = document.querySelector("#warning"),
			expectedType = "success";

		a.type = "success";
		a.type.should.equal(expectedType);
	});

	it("should have no border box if type = 'message'", function(done) {
		var a = document.querySelector("#message"),
			noBorder = null,
			noPadding = null;

		setTimeout(function() {
			noBorder = TestHelper.getPropertyValue(a, "border-left-width");
			noPadding = TestHelper.getPropertyValue(a, "padding-left");
			noBorder = noBorder.indexOf("0px") !== -1;
			noPadding = noPadding.indexOf("0px") !== -1;
			noBorder.should.equal(true);
			noPadding.should.equal(true);
			done();
		}, 0);
	});

});