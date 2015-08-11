var should = chai.should();

describe("mm-autocomplete", function() {
	
	it("should have an element constructor", function() {
		var a = new Strand.AutoComplete();
		a.nodeName.should.equal("MM-AUTOCOMPLETE");
	});

	it("should open if there are matching items", function(done) {
		var ac = document.getElementById('ac');
		ac.value = 'a';
		setTimeout(function() {
			ac.panel.state.should.equal(ac.panel.STATE_OPENED);
			done();
		}, 100);
	});

	it("should not open if there are no matches", function(done) {
		var ac = document.getElementById('ac');
		ac.value = 'abcdefghijkl';
		setTimeout(function() {
			ac.panel.state.should.equal(ac.panel.STATE_CLOSED);
			done();
		}, 100);
	});

	it("should filter items", function(done) {
		var ac = document.getElementById('ac');
		ac.value = 'ab';
		setTimeout(function() {
			ac.searchItems.length.should.equal(1);
			should.equal(ac.panel.$.container.firstElementChild.value, ac.searchItems[0].value);			
			done();
		}, 100);
	});

	it("should update value when selected", function(done) {
		var ac = document.getElementById('ac');
		ac.value = 'om';
		setTimeout(function() {
			var expected = ac.panel.$.container.firstElementChild.value;
			ac.selectedItem = ac.panel.$.container.firstElementChild;
			ac.value.should.equal(expected);
			done();
		}, 100);
	});

});