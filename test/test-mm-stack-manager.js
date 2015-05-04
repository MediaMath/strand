var should = chai.should();

describe("mm-stack-manager", function() {
	
	it("should have an element constructor", function() {
		var a = new MMStackManager();
		a.nodeName.should.equal("MM-STACK-MANAGER");
	});

	it("should be checked on mouseup", function(done) {
		var a = new MMStackManager(),
			s = sinon.spy();

		a.addEventListener("depthChanged", s);
		a.depthChanged(10000, 20000);
		a.async(function() {
			should.equal(s.calledOnce, true);
			done();
		});
	});

	it("should move to top", function(done) {
		var a = document.querySelector("#sm"),
			index = null;
		
		index = a.moveToTop();

		a.async(function() {
			should.equal(index, 10003);
			done();
		});
	});

});