var should = chai.should();

describe("mm-header", function() {
	
	it("should have an element constructor", function() {
		var a = new MMHeader();
		a.nodeName.should.equal("MM-HEADER");
	});

	it("should have a default size: 'large'", function() {
		var a = new MMHeader(),
			size = a.size;

		a.should.have.property("size");
		size.should.equal("large");
	});

	it("should use font Arimo", function(done) {
		var large = document.querySelector("#large"),
			medium = document.querySelector("#medium"),
			small = document.querySelector("#small"),
			normal = document.querySelector("#normal"),
			tiny = document.querySelector("#tiny"),
			lrgDiv = large.shadowRoot.querySelector("div"),
			medDiv = medium.shadowRoot.querySelector("div"),
			smDiv = small.shadowRoot.querySelector("div"),
			nrmDiv = normal.shadowRoot.querySelector("div"),
			tnDiv = tiny.shadowRoot.querySelector("div"),
			ffLrg = false,
			ffMed = false,
			ffSm = false,
			ffNrm = false,
			ffTn = false,
			isArimo = false;

		setTimeout(function() {
			ffLrg = TestHelper.getPropertyValue(lrgDiv, "font-family").indexOf("Arimo") !== -1;
			ffMed = TestHelper.getPropertyValue(medDiv, "font-family").indexOf("Arimo") !== -1;
			ffSm = TestHelper.getPropertyValue(smDiv, "font-family").indexOf("Arimo") !== -1;
			ffNrm = TestHelper.getPropertyValue(nrmDiv, "font-family").indexOf("Arimo") !== -1;
			ffTn = TestHelper.getPropertyValue(tnDiv, "font-family").indexOf("Arimo") !== -1;
			isArimo = ffLrg === ffMed === ffSm === ffNrm === ffTn;
			isArimo.should.equal(true);
			done();
		}, 150);
	});

	it("should have the correct font size", function(done) {
		var large = document.querySelector("#large"),
			medium = document.querySelector("#medium"),
			small = document.querySelector("#small"),
			normal = document.querySelector("#normal"),
			tiny = document.querySelector("#tiny"),
			lrgDiv = large.shadowRoot.querySelector("div"),
			medDiv = medium.shadowRoot.querySelector("div"),
			smDiv = small.shadowRoot.querySelector("div"),
			nrmDiv = normal.shadowRoot.querySelector("div"),
			tnDiv = tiny.shadowRoot.querySelector("div"),
			ffLrg = "",
			ffMed = "",
			ffSm = "",
			ffNrm = "",
			ffTn = "";

		setTimeout(function() {
			ffLrg = TestHelper.getPropertyValue(lrgDiv, "font-size");
			ffMed = TestHelper.getPropertyValue(medDiv, "font-size");
			ffSm = TestHelper.getPropertyValue(smDiv, "font-size");
			ffNrm = TestHelper.getPropertyValue(nrmDiv, "font-size");
			ffTn = TestHelper.getPropertyValue(tnDiv, "font-size");
			ffLrg.should.equal("20px");
			ffMed.should.equal("15px");
			ffSm.should.equal("13px");
			ffNrm.should.equal("11px");
			ffTn.should.equal("9px");
			done();
		}, 150);
	});

	it("normal and tiny should have text-transform: uppercase", function(done) {
		var normal = document.querySelector("#normal"),
			tiny = document.querySelector("#tiny"),
			nrmDiv = normal.shadowRoot.querySelector("div"),
			tnDiv = tiny.shadowRoot.querySelector("div"),
			ffNrm = "",
			ffTn = "",
			upper = false;

		setTimeout(function() {
			ffNrm = TestHelper.getPropertyValue(nrmDiv, "text-transform");
			ffTn = TestHelper.getPropertyValue(tnDiv, "text-transform");
			upper = ffNrm === ffTn;
			upper.should.equal(true);
			done();
		}, 150);
	});

	it("normal should have color Colors.D2", function(done) {
		var normal = document.querySelector("#normal"),
			nrmDiv = normal.shadowRoot.querySelector("div"),
			expectedColor = TestHelper.hexToRgb(Colors.D2),
			color = null;

		setTimeout(function() {
			color = TestHelper.getRgbNoSpace(nrmDiv, "color");
			color.should.equal(expectedColor);
			done();
		}, 150);
	});

});