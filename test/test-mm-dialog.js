var should = chai.should();

describe("mm-dialog", function() {
	
	it("should have an element constructor", function() {
		var a = new Strand.Dialog();
		a.nodeName.should.equal("MM-DIALOG");
	});

	it("should be hidden by default", function() {
		var a = new Strand.Dialog();
		a.modal.hidden.should.equal(true);
	});

	it("should be visible when shown", function() {
		var a = new Strand.Dialog();
		a.show();
		a.modal.hidden.should.equal(false);
	});

	it("should have an icon if type is present", function() {
		var withType = document.querySelector('#dialogWithType .content-top mm-icon');
		withType.should.exist;
		var withNoType = document.querySelector('#dialog .content-top mm-icon');
		should.not.exist(withNoType);
	});

	it("should have a header if header is present", function() {
		var withHeader = document.querySelector('#dialogWithHeader .content-top mm-header');
		withHeader.should.exist;
		var withNoHeader = document.querySelector('#dialog .content-top mm-header');
		should.not.exist(withNoHeader);
	});

	it("should have a single 'OK' button by default", function() {
		var button = document.querySelector('#dialog mm-button');
		button.querySelector('label').innerHTML.should.equal('OK');
	});

});