var should = chai.should();

describe("mm-tooltip", function() {
	
	it("should have an element constructor", function() {
		var a = new MMTooltip();
		a.nodeName.should.equal("MM-TOOLTIP");
	});

	it("should be open on 'over'", function(done) {
		var a = document.querySelector("#tt");
		a.overHandler();
		a.async(function() {
			a.state.should.equal(a.STATE_OPENED);
			done();
		});
	});

	it("should be closed on 'out'", function(done) {
		var a = document.querySelector("#tt");
		a.outHandler();
		a.async(function() {
			a.state.should.equal(a.STATE_CLOSED);
			done();
		});
	});

	it("should NOT be closed on 'out' if auto = false", function(done) {
		var a = document.querySelector("#tt");
		a.auto = false;
		a.overHandler();
		a.outHandler();
		a.async(function() {
			a.state.should.equal(a.STATE_OPENED);
			done();
		});
	});

});