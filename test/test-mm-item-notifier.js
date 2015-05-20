var should = chai.should();

describe("mm-item-notifier", function() {
	
	it("should have an element constructor", function() {
		var a = new MMItemNotifier();
		a.nodeName.should.equal("MM-ITEM-NOTIFIER");
	});

	it("should have an observer", function(done) { 
		var a = new MMItemNotifier();
		document.body.appendChild(a);

		setTimeout(function() {
			should.exist(a.observer);
			done();
		}, 150);
	});

	it("should sort mutation records correctly - added", function() {
		var m = { addedNodes:["", "", ""], removedNodes:[] },
			n = new MMItemNotifier(),
			s = sinon.spy();

		n.addEventListener("added", s);
		n.mutationHandler(m);
		should.equal(s.calledOnce, true);
	});

	it("should sort mutation records correctly - removed", function() {
		var m = { addedNodes:[], removedNodes:["", "", ""] },
			n = new MMItemNotifier(),
			s = sinon.spy();

		n.addEventListener("removed", s);
		n.mutationHandler(m);
		should.equal(s.calledOnce, true);
	});

	it("should sort mutation records correctly - modified", function() {
		var m = { addedNodes:[], removedNodes:[] },
			n = new MMItemNotifier(),
			s = sinon.spy();

		n.addEventListener("modified", s);
		n.mutationHandler(m);
		should.equal(s.calledOnce, true);
	});

});