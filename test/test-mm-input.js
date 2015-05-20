
var should = chai.should();

describe("mm-input", function() {

	it("should have an element constructor", function() {
		var a = new MMInput();
		a.nodeName.should.equal("MM-INPUT");
	});

	it("should default to type: 'text' if set to an unexpected string", function(done) {
		var a = new MMInput();
		a.type = "skittles";
		setTimeout(function() {
			a.type.should.equal("text");
			done();
		}, 150);
	});

	it("should have the correct type", function(done) {
		var a = new MMInput();
		a.type = "email";
		setTimeout(function() {
			a.type.should.equal("email");
			done();
		}, 150);
	});

	it("should have data", function(done) {
		var a = new MMInput(),
			data = [
				{name: "text"}, 
				{name: "password"}, 
				{name: "email"}, 
				{name: "number"}, 
				{name: "tel"}, 
				{name: "search"}, 
				{name: "url"}
			];
		a.data = data;
		setTimeout(function() {
			a.data.should.equal(data);
			done();
		}, 150);
	});

	it("should accept data as a string, and parse", function(done) {
		var a = document.querySelector("#search"),
			data = '[{"name":"text"},{"name":"password"},{"name":"email"},{"name":"number"},{"name":"tel"},{"name":"search"},{"name":"url"}]';
		should.exist(a.data);
		a.data = data;
		setTimeout(function() {
			a.data[2].should.deep.equal({name:"email"});
			a.data[6].should.deep.equal({name:"url"});
			done();
		}, 150);
	});

	it("should display search icon if search = true", function(done) {
		var a = document.querySelector("#search"),
			icon = a.shadowRoot.querySelector("#icon"),
			input = a.shadowRoot.querySelector("#input"),
			iconDisplay = null,
			inputPaddingRight = null;
		should.exist(a.search);
		a.search = true;
		setTimeout(function() {
			iconDisplay = TestHelper.getPropertyValue(icon, "display");
			inputPaddingRight = TestHelper.getPropertyValue(input, "padding-right");
			iconDisplay.should.equal("block");
			inputPaddingRight.should.equal("25px");
			done();
		}, 150);

	});

	it("should display close icon / clear button if clear = true", function(done) {
		var a = document.querySelector("#clear"),
			clearBtn = a.shadowRoot.querySelector("#clearBtn"),
			input = a.shadowRoot.querySelector("#input"),
			iconDisplay = null,
			inputPaddingRight = null;
		should.exist(a.clear);
		a.clear = true;
		a.value = "blah";
		setTimeout(function() {
			iconDisplay = TestHelper.getPropertyValue(clearBtn, "display");
			inputPaddingRight = TestHelper.getPropertyValue(input, "padding-right");
			iconDisplay.should.equal("block");
			inputPaddingRight.should.equal("25px");
			done();
		}, 150);
	});

	it("should validate email if validation: 'email'", function(done) {
		var a = document.querySelector("#email"),
			input = a.shadowRoot.querySelector("#input"),
			expectedColor = TestHelper.hexToRgb(Colors.C12),
			error = null,
			errorClass = null;

		should.exist(a.validation);
		should.exist(a.error);
		a.validation.should.equal("email");
		a.value = "blah";

		setTimeout(function() {
			error = TestHelper.getRgbNoSpace(input, "border-left-color");
			errorClass = Array.prototype.slice.call(input.classList).indexOf("invalid") > -1;
			error.should.equal(expectedColor);
			errorClass.should.equal(true);
			done();
		}, 150);
	});

	it("should validate empty if validation: 'empty'", function(done) {
		var a = document.querySelector("#empty"),
			input = a.shadowRoot.querySelector("#input"),
			expectedColor = TestHelper.hexToRgb(Colors.C12),
			error = null,
			errorClass = null;

		should.exist(a.validation);
		should.exist(a.error);
		a.validation.should.equal("empty");
		a.value = "";

		setTimeout(function() {
			error = TestHelper.getRgbNoSpace(input, "border-left-color");
			errorClass = Array.prototype.slice.call(input.classList).indexOf("invalid") > -1;
			error.should.equal(expectedColor);
			errorClass.should.equal(true);
			done();
		}, 150);
	});

	it("should validate empty if validation: 'empty'", function(done) {
		var a = document.querySelector("#empty"),
			input = a.shadowRoot.querySelector("#input"),
			expectedColor = TestHelper.hexToRgb(Colors.C12),
			error = null,
			errorClass = null;

		a.validation.should.equal("empty");
		a.value = "";

		setTimeout(function() {
			error = TestHelper.getRgbNoSpace(input, "border-left-color");
			errorClass = Array.prototype.slice.call(input.classList).indexOf("invalid") > -1;
			error.should.equal(expectedColor);
			errorClass.should.equal(true);
			done();
		}, 150);
	});

	it("should validate int if validation: 'int'", function(done) {
		var a = document.querySelector("#int"),
			input = a.shadowRoot.querySelector("#input"),
			expectedColor = TestHelper.hexToRgb(Colors.C12),
			error = null,
			errorClass = null;

		a.validation.should.equal("int");
		a.value = "blah";

		setTimeout(function() {
			error = TestHelper.getRgbNoSpace(input, "border-left-color");
			errorClass = Array.prototype.slice.call(input.classList).indexOf("invalid") > -1;
			error.should.equal(expectedColor);
			errorClass.should.equal(true);
			done();
		}, 150);
	});

	it("should validate decimal if validation: 'decimal'", function(done) {
		var a = document.querySelector("#decimal"),
			input = a.shadowRoot.querySelector("#input"),
			expectedColor = TestHelper.hexToRgb(Colors.C12),
			error = null,
			errorClass = null;

		a.validation.should.equal("decimal");
		a.value = "blah";

		setTimeout(function() {
			error = TestHelper.getRgbNoSpace(input, "border-left-color");
			errorClass = Array.prototype.slice.call(input.classList).indexOf("invalid") > -1;
			error.should.equal(expectedColor);
			errorClass.should.equal(true);
			done();
		}, 150);
	});

	it("should validate alpha if validation: 'alpha'", function(done) {
		var a = document.querySelector("#alpha"),
			input = a.shadowRoot.querySelector("#input"),
			expectedColor = TestHelper.hexToRgb(Colors.C12),
			error = null,
			errorClass = null;

		a.validation.should.equal("alpha");
		a.value = "Blah blah";

		setTimeout(function() {
			error = TestHelper.getRgbNoSpace(input, "border-left-color");
			errorClass = Array.prototype.slice.call(input.classList).indexOf("invalid") > -1;
			error.should.equal(expectedColor);
			errorClass.should.equal(true);
			done();
		}, 150);
	});

	it("should bind values to it's model", function(done) {
		var a = document.querySelector("#search"),
			model = {name:"blah"};

		a.bindModel(model, "name");
		should.exist(a.model);
		should.exist(a.property);
		a.value = "socks";

		setTimeout(function() {
			a.model.name.should.equal("socks");
			done();
		}, 150);
	});

});