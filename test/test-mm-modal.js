var should = chai.should();

describe("mm-modal", function() {
	
	it("should have an element constructor", function() {
		var a = new MMModal();
		a.nodeName.should.equal("MM-MODAL");
	});

	it("should be visible when shown", function() {
		var a = new MMModal();
		a.show();
		a.async(function(){
			a.visible.should.equal(true);
		});
	});

	it("should not be visible when hidden", function() {
		var a = new MMModal();
		a.hide();
		a.async(function(){
			a.visible.should.equal(false);
		});
	});

	it("should disable document scroll if noscroll flag is set", function() {
		var a = new MMModal();
		a.noscroll = true;
		a.show();
		a.async(function(){
			document.body.style.overflow.should.equal("hidden");
		});
	});

});