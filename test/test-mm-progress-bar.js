var should = chai.should();

describe("mm-progress-bar", function() {

	it("should have an indeterminate state", function() {
		var normal = document.querySelector('#myProgressBar');
		var indet = document.querySelector('#indeterminateBar');
		normal.indeterminate.should.equal(false);
		indet.indeterminate.should.equal(true);
	});

	it("should have a filled bar when indeterminate", function() {
		var indet = document.querySelector('#indeterminateBar .fill');
		indet.style.width.should.equal("100%");
	});

	it("should have numerical height and width", function() {
		var myPB = document.querySelector('#myProgressBar');
		var indet = document.querySelector('#indeterminateBar');
		myPB.height.should.be.a('number');
		myPB.width.should.be.a('number');
		indet.height.should.be.a('number');
		indet.width.should.be.a('number');
	});

	it("should have a percent complete between 0 and 100", function() {
		var myPB = document.querySelector('#myProgressBar');
		myPB.percentComplete.should.be.a('number')
			.and.be.at.least(0)
			.and.be.at.most(100);
	});
});