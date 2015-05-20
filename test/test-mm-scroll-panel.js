var should = chai.should();

describe("mm-scroll-panel", function() {
	
	it("should have an element constructor", function() {
		var a = new MMScrollPanel();
		a.nodeName.should.equal("MM-SCROLL-PANEL");
	});

	it("should correctly calculate layout metrics on initialize", function(done) {
		var a = document.querySelector("#sp");
		setTimeout(function() {
			should.exist(a.scrollBarSize);
			should.exist(a.scrollRange);
			should.exist(a.contentRange);
			should.exist(a.viewportHeight);
			should.exist(a.initContentHeight);
			a.scrollBarSize.should.equal(50);
			a.scrollRange.should.equal(100);
			a.contentRange.should.equal(714);
			a.viewportHeight.should.equal(150);
			a.contentHeight.should.equal(864);
			a.initContentHeight.should.equal(864);
			done();
		}, 150);
	});

	it("should update the viewport scroll top", function(done) {
		var a = document.querySelector("#sp");
		a.currentY = 0;
		a.updateViewport(27);
		a.async(function() {
			a.$.viewport.scrollTop.should.equal(192);
			done();
		});
	});

	it("should update the scroll bar", function(done) {
		var a = document.querySelector("#sp");
		a.updateScrollbar(192);
		a.async(function() {
			a.$.scrollbarY.style.top.should.equal("26px");
			done();
		});
	});

});