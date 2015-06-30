var should = chai.should();

describe("mm-spinner", function() {
	
	it("should have an element constructor", function() {
		var a = new Strand.Spinner();
		a.nodeName.should.equal("MM-SPINNER");
	});

});