var should = chai.should();

describe("mm-textarea", function() {
	
	it("should have an element constructor", function() {
		var a = new MMTextArea();
		a.nodeName.should.equal("MM-TEXTAREA");
	});

});