var should = chai.should();

describe("mm-dialog", function() {
	
	it("should have an element constructor", function() {
		var a = new Strand.Dialog();
		a.nodeName.should.equal("MM-DIALOG");
	});

	it("should be hidden by default", function() {
		var a = new Strand.Dialog();
		a.async(function(){
			a.modal.visible.should.equal(false);
		});
	});

	it("should be visible when shown", function() {
		var a = new Strand.Dialog();
		a.show();
		a.async(function(){
			a.modal.visible.should.equal(true);
		});
	});
	
});