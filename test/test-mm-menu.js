var should = chai.should();

describe("mm-menu", function() {
	
	it("should have an element constructor", function() {
		var a = new Strand.Menu();
		a.nodeName.should.equal("MM-MENU");
	});

});