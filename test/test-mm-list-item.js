var should = chai.should();

describe("mm-list-item", function() {
	
	it("should have an element constructor", function() {
		var a = new MMListItem();
		a.nodeName.should.equal("MM-LIST-ITEM");
	});

	it("should set title attribute when it's container's width is changed", function(done) {
		var a = document.querySelector("#resizee"),
			r = document.querySelector("#resize"),
			title = null;

		r.style.width = "150px";

		setTimeout(function(){
			title = a.getAttribute("title");
			done();
		}, 150);
	});

});