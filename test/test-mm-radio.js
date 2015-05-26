var should = chai.should();

describe("mm-radio", function() {
	
	it("should have an element constructor", function() {
		var a = new MMRadio();
		a.nodeName.should.equal("MM-RADIO");
	});

	it("should be checked on mouseup", function() {
		var a = new MMRadio();
		a.radioMouseUp();
		a.checked.should.equal(true);
	});

	it("should fire selected when checked", function(done) {
		var a = document.querySelector("#r1"),
			s = sinon.spy();

		a.addEventListener("selected", s);
		a.checkedChanged(false, true);

		a.async(function() {
			should.equal(s.calledOnce, true);
			done();
		});
	});

});