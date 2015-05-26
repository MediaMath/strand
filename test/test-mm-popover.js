var should = chai.should();

describe("mm-popover", function() {
	
	it("should have an element constructor", function() {
		var a = new MMPopover(),
			t = document.querySelector("#target");
		a.target = t;
		a.nodeName.should.equal("MM-POPOVER");
	});

	it("should fire 'opened' when stateChanged", function() {
		var a = document.querySelector("#popover"),
			s = sinon.spy();

		a.addEventListener("opened", s);
		a.stateChanged(a.STATE_CLOSED, a.STATE_OPENED);
		should.equal(s.calledOnce, true);
	});

	it("should fire 'closed' when stateChanged", function() {
		var a = document.querySelector("#popover"),
			s = sinon.spy();

		a.addEventListener("closed", s);
		a.stateChanged(a.STATE_OPENED, a.STATE_CLOSED);
		should.equal(s.calledOnce, true);
	});

	it("should correctly pass target to it's internal mm-close-panel", function(done) {
		var a = document.querySelector("#popover"),
			ot = document.querySelector("#target"),
			nt = document.querySelector("#newTarget"),
			c = a.$.closePanel;

		a.targetChanged(ot, nt);

		a.async(function(){
			c.target.should.equal(nt);
			done();
 		});
 	});

});