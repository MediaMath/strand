var should = chai.should();

describe("mm-loader", function() {
	
	it("should have an element constructor", function() {
		var a = new MMLoader();
		a.nodeName.should.equal("MM-LOADER");
	});

	it("should hide", function(done) {
		var a = document.querySelector("#loader");
		a.hide();
		a.async(function() {
			a.style.display.should.equal("none");
			done();
		});
	});

	it("should show", function(done) {
		var a = document.querySelector("#loader");
		a.show();
		a.async(function() {
			a.style.display.should.equal("block");
			done();
		});
	});

	it("should convert hex", function() {
		var a = document.querySelector("#loader");
		a.convertHex("#ff0000").should.equal("rgba(255,0,0,"+a.bgOpacity+")");
	});

});