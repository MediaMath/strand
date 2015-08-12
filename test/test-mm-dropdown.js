var should = chai.should();

describe("mm-dropdown", function() {

	it("should have an element constructor", function() {
		var a = new Strand.Dropdown();
		a.nodeName.should.equal("MM-DROPDOWN");
	});

	it("should fit to parent if fitparent set", function(done) {
		var ddlFit = document.querySelector("#ddlFit"),
			width = 0;

		setTimeout(function() {
			width = TestHelper.widthIntRounded(ddlFit);
			width.should.equal(500);
			done();
		}, 150);
	});

	it("should toggle", function() {
		var ddl = document.getElementById('ddl');
		ddl.state.should.equal(ddl.STATE_CLOSED);
		ddl.toggle();
		ddl.state.should.equal(ddl.STATE_OPENED);
		ddl.toggle();
		ddl.state.should.equal(ddl.STATE_CLOSED);
	});

	// TODO: mm-close-panel related post refactor(?)

	it("should be able to select item by value", function(done) {
		var ddl = document.getElementById('ddl');
		setTimeout(function() {
			ddl.selectItemByValue(2);
			ddl.selectedItem.should.equal(ddl.items[1]);
			done();
		}, 150);
	});

	it("should update label when selected", function(done) {
		var ddl = document.getElementById('ddl');
		setTimeout(function() {
			ddl.selectItemByValue(2);
			ddl.selectedItem.innerText.should.equal(ddl.target.querySelector('label').innerText);
			done();
		}, 150);
	});


	it("should fire 'selected' event when selected", function() {
		var ddl = document.getElementById('ddl');
		var selectSpy = sinon.spy(function(e) { return e.detail; });
		ddl.addEventListener("selected", selectSpy);
		ddl.selectItemByValue(3);
		selectSpy.returnValues[0].item.should.equal(ddl.selectedItem);
		selectSpy.returnValues[0].index.should.equal(2);
		selectSpy.returnValues[0].value.should.equal(ddl.selectedItem.value);
		selectSpy.returnValues[0].selected.should.equal(true);
	});

	it("should be Jqueryable", function(done) {
		var a = $('#ddlJquery');
		for(var i=0; i<100; i++) {
			var item = $("<mm-list-item id='item" + i +"'>List Item Here" + i + "</mm-list-item>");
			item.appendTo(a);
		}

		setTimeout(function() {
			var b = document.getElementById('ddlJquery');
			b.panel.$.container.children.length.should.equal(102); // 2 additional children should be <template>s
			done();
		}, 150);
	});

	it("should clamp height", function(done) {
		var a = document.getElementById('ddlLarge');
		for(var i=0; i<10; i++) {
			var item = document.createElement('mm-list-item');
			item.innerText = "mm-list-item " + i;
			a.appendChild(item);
		}
		a.open();

		setTimeout(function() {
			var panelRect = a.panel.getBoundingClientRect();
			panelRect.height.should.be.lessThan(window.innerHeight);
			panelRect.top.should.be.at.least(0);
			panelRect.bottom.should.be.at.most(window.innerHeight);
			done();
		}, 150);
	});
});