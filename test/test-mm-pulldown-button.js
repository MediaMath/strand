var should = chai.should();

describe("mm-pulldown-button", function() {
	
	it("should have an element constructor", function() {
		var a = new MMPulldownButton();
		a.nodeName.should.equal("MM-PULLDOWN-BUTTON");
	});

	it("should return icon if one was added", function() {
		var a = document.querySelector("#pdb"),
			icon = document.querySelector("#icon");
		should.exist(a.icon);
		should.equal(a.icon[0], icon);
	});

	it("should toggle", function() {
		var a = document.querySelector("#pdb");

		a.toggle();
		should.equal(a.state, a.STATE_OPENED);
	});

	it("should set close panel width correctly", function(done) {
		var a = document.querySelector("#pdbFit"),
			cp = a.$.closePanel,
			btn = a.$.buttonMain;

		a.async(function() {
			should.equal(TestHelper.widthIntRounded(cp), TestHelper.widthIntRounded(btn));
			done();
		});
	});

});