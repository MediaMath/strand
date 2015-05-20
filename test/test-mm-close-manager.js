var should = chai.should();

describe("mm-close-manager", function() {
	
	it("should have an element constructor", function() {
		var a = new MMCloseManager();
		a.nodeName.should.equal("MM-CLOSE-MANAGER");
	});

	it("should fire a close event", function(done) {
		var a = new MMCloseManager(),
			s = sinon.spy();

		a.addEventListener("close", s);
		a.closeHandler();

		a.async(function() {
			should.equal(s.calledOnce, true);
			done();
		});
	});

	it("ddl should close on window down", function(done) {
		var ddl = document.querySelector("#ddl"),
			s = sinon.spy(),
			evt = document.createEvent("MouseEvents");

  		evt.initMouseEvent("down", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

		ddl.addEventListener("close", s);
		document.dispatchEvent(evt);

		ddl.async(function() {
			should.equal(s.calledOnce, true);
			done();
		});
	});

});