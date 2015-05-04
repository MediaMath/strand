var should = chai.should();

describe("mm-list", function() {
	
	it("should have an element constructor", function() {
		var a = new MMList();
		a.nodeName.should.equal("MM-LIST");
	});

	it("should have a target", function() {
		var a = new MMList();
		should.exist(a.target);
	});

	it("should have a scope", function(done) {
		var a = new MMList();
		document.body.appendChild(a);
		a.async(function() {
			should.exist(a.scope);
			done();
		});
	});

	it("should correctly set the activeIndex", function(done) {
		var a = document.querySelector("#tl");

		a.items[2].dispatchEvent(new MouseEvent("mouseover", {
			view: window,
			bubbles: true,
			cancelable: true,
			clientX: 10,
			clientY: 10
		}));

		a.async(function() {
			should.equal(a.activeIndex, 2);
			done();
		});
	});

	it("should correctly set the selectedIndex", function(done) {
		var a = document.querySelector("#tl");

		a.items[2].dispatchEvent(new MouseEvent("down", {
			view: window,
			bubbles: true,
			cancelable: true,
			clientX: 10,
			clientY: 10
		}));

		a.async(function() {
			should.equal(a.selectedIndex, 2);
			done();
		});
	});

	it("should fire 'selected' when selectedIndex changes", function() {
		var a = document.querySelector("#tl"),
			s = sinon.spy();

		a.addEventListener("selected", s);
		a.selectedIndexChanged(2, 0);
		should.equal(s.calledOnce, true);
	});

	it("should update the model", function(done) {
		var a = document.querySelector("#tl");

		a.updateModel(true);
		
		a.async(function() {
			a.model[1].selected.should.equal(true);
			a.model[1].active.should.equal(true);
			done();
		});
	});

});