var should = chai.should();

describe("mm-group", function() {
	
	it("should have an element constructor", function() {
		var a = new MMGroup();
		a.nodeName.should.equal("MM-GROUP");
	});

	// Test Unique ID:
	it("should create a group id if one is not specified", function() {
		var exist = document.querySelector("#exist"),
			id = exist.group;
	
		exist.should.have.property("group");
		id.should.be.a("string");
	});

	it("should NOT create a group id if one is specified", function() {
		var a = document.querySelector("#preselect2"),
			id = a.group;
	
		a.should.have.property("group");
		id.should.equal("myRadGroup2");
	});

	// Test type:
	it("should have type: 'mm-button' if it's an all button group", function() {
		var a = document.querySelector("#horizontalBtn"),
			type = a.type;

		a.should.have.property("type");
		type.should.equal("mm-button");
	});

	it("should have type: 'mm-radio' if it's an all radio group", function() {
		var a = document.querySelector("#editselect"),
			type = a.type;

		a.should.have.property("type");
		type.should.equal("mm-radio");
	});

	it("should have type: null if it's a mixed item group", function() {
		var a = document.querySelector("#searchGroup"),
			type = a.type;

		a.should.have.property("type");
		should.equal(type, null);
	});

	// Radio Group:
	it("should expose a value property", function() {
		var exist = document.querySelector("#exist");
		exist.should.have.property("value");
	});

	it("should have an empty value when none are preselected", function() {
		var exist = document.querySelector("#exist");
		exist.value.should.equal("");

		var $exist = $("#exist");
		$exist.val().should.equal("");
	});

	it("should have a value when one is preselected", function() {
		var preselect = document.querySelector("#preselect");
		preselect.should.have.property("value");
		preselect.value.should.equal("1");

		var $preselect = $("#preselect");
		$preselect.val().should.equal("1");
	});

	it("should have a value when an item is selected but does not have value attrs", function() {
		var preselect = document.querySelector("#preselect2");
		preselect.should.have.property("value");
		preselect.value.should.equal("Rad Group Item 1");

		var $preselect = $("#preselect2");
		$preselect.val().should.equal("Rad Group Item 1");
	});

	it("should not have a value before we have clicked anything", function() {
		var editselect = document.querySelector("#editselect");
		editselect.should.have.property("value");
		editselect.value.should.equal("");

		var $editselect = $("#editselect");
		$editselect.val().should.equal("");
	});

	it("should have a value after select the first radio", function(done) {
		var editselect = document.querySelector("#editselect");
		var $editselect = $("#editselect");

		var first = document.querySelector("#editfirst");
		first.checked = true;

		setTimeout(function() {
			editselect.should.have.property("value");
			editselect.value.should.equal("Rad Group Item 1");

			$editselect.val().should.equal("Rad Group Item 1");
			done();
		}, 300); // higher ms settimeout was necessary with the compiled lib.html (idk why?)
	});

	// Horizontal Radio Group:
	it("should have a margin right of 20px if not :last-child", function(done) {
		var a = document.querySelector("#exist"),
			firstItem = null,
			lastItem = null,
			firstMarginRight = 0,
			lastMarginRight = 0;

		setTimeout(function() {
			firstItem = a.items[0];
			lastItem = a.items[a.items.length-1];
			firstMarginRight = TestHelper.getPropertyValue(firstItem, "margin-right");
			lastMarginRight = TestHelper.getPropertyValue(lastItem, "margin-right");
			firstMarginRight.should.equal("20px");
			lastMarginRight.should.not.equal("20px");
			done();
		}, 150);
	});

	it("should have display: inline-flex if align = 'horizontal'", function(done) {
		var a = document.querySelector("#exist"),
			display = null,
			inlineFlex = false;

		setTimeout(function() {
			display = TestHelper.getPropertyValue(a, "display");
			inlineFlex = display === "inline-flex" || display === "-webkit-inline-flex";
			inlineFlex.should.equal(true);
			done();
		}, 150);
	});

	it("should justify content if align = 'horizontal' and fitparent", function(done) {
		var a = document.querySelector("#editselect"),
			justify = null;

		setTimeout(function() {
			justify = TestHelper.getPropertyValue(a, "justify-content") ? TestHelper.getPropertyValue(a, "justify-content") : TestHelper.getPropertyValue(a, "-webkit-justify-content");
			justify.should.equal("space-between");
			done();
		}, 150);
	});

	// Vertical Radio Group:
	it("should have column orientation if align = 'vertical'", function(done) {
		var a = document.querySelector("#vertical"),
			display = null;

		setTimeout(function() {
			display = TestHelper.getPropertyValue(a, "flex-direction") ? TestHelper.getPropertyValue(a, "flex-direction") : TestHelper.getPropertyValue(a, "-webkit-flex-direction");
			display.should.equal("column");
			done();
		}, 150);
	});

	// Button Group

	// TODO: Selection tests should be handled in mm-list(?)

	// Horizontal Button Group
	it("items should have layout attributes set correctly", function(done) {
		var a = document.querySelector("#horizontalBtn"),
			items = null,
			alignFirst = null,
			alignCenter = null,
			alignLast = null;

		setTimeout(function() {
			items = a.items;
			alignFirst = items[0].getAttribute("layout");
			alignCenter = items[1].getAttribute("layout");
			alignLast = items[items.length-1].getAttribute("layout");
			alignFirst.should.equal("hgroup-left");
			alignCenter.should.equal("hgroup-center");
			alignLast.should.equal("hgroup-right");
			done();
		}, 150);
	});

	it("items should have equal width if align = 'horizontal' and fitparent", function(done) {
		var a = document.querySelector("#horizontalBtn"),
			width = 0,
			previousWidth = 0,
			items = null,
			allEqual = false;

		setTimeout(function() {
			items = a.items;
			width = TestHelper.widthIntRounded(a);
			items.forEach(function(item) {
				var w = TestHelper.widthIntRounded(item);
				previousWidth = w;
				allEqual = previousWidth === w;
			});
			width.should.equal(600);
			allEqual.should.equal(true);
			done();
		}, 150);
	});

	// Vertical Button Group
	it("items should have valign attributes set correctly", function(done) {
		var a = document.querySelector("#verticalBtn"),
			items = null,
			alignFirst = null,
			alignCenter = null,
			alignLast = null;

		setTimeout(function() {
			items = a.items;
			alignFirst = items[0].getAttribute("layout");
			alignCenter = items[1].getAttribute("layout");
			alignLast = items[items.length-1].getAttribute("layout");
			alignFirst.should.equal("vgroup-top");
			alignCenter.should.equal("vgroup-center");
			alignLast.should.equal("vgroup-bottom");
			done();
		}, 150);
	});

	// Mixed Grouping Scenarios
	// Search Group
	it("input and dropdown should have layout attributes set correctly", function(done) {
		var a = document.querySelector("#searchGroup"),
			items = null,
			alignFirst = null,
			alignLast = null;

		setTimeout(function() {
			items = a.items;
			alignFirst = items[0].getAttribute("layout");
			alignLast = items[items.length-1].getAttribute("layout");
			alignFirst.should.equal("hgroup-left");
			alignLast.should.equal("hgroup-right");
			done();
		}, 150);
	});

});