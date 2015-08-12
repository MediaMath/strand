var should = chai.should();

fireKeyEvent = function(keyCode) {
	var ke = new Event('Event');
	if(ke.initEvent) {
		ke.initEvent('keydown', true, true);
	}
	ke.keyCode = keyCode;
	ke.which = keyCode;

	document.activeElement.dispatchEvent(ke);
}

describe("mm-pulldown-button", function() {
	
	it("should have an element constructor", function() {
		var a = new Strand.PulldownButton();
		a.nodeName.should.equal("MM-PULLDOWN-BUTTON");
	});

	it("should return icon if one was added", function() {
		var a = document.getElementById("pdb"),
			icon = document.getElementById("icon");
		icon.should.exist;
	});

	it("should toggle", function() {
		var a = document.getElementById("pdb");
		a.toggle();
		a.state.should.equal(a.STATE_OPENED);
		a.toggle();
		a.state.should.equal(a.STATE_CLOSED);
	});

	it("should set panel width correctly", function() {
		var overflow = document.getElementById("pdbOverflow"),
			truncate = document.getElementById("pdbTruncate");
		overflow.open();
		truncate.open();
		overflow.target.getBoundingClientRect().width.should.be.lessThan(overflow.panel.getBoundingClientRect().width);
		truncate.target.getBoundingClientRect().width.should.equal(truncate.panel.getBoundingClientRect().width);
	});

	it("should position panel correctly", function() {
		var a = document.getElementById("pdbTransform");
		a.open();

		var targetRect = a.target.getBoundingClientRect(),
			panelRect = a.panel.getBoundingClientRect();

		targetRect.left.should.equal(panelRect.left);
		targetRect.right.should.equal(panelRect.right);

		(a.direction === 'n' || a.direction === 's').should.be.true;
		if(a.direction === 'n') targetRect.top.should.equal(panelRect.bottom);
		if(a.direction === 's') targetRect.bottom.should.equal(panelRect.top);
	});

	// keyboardable behavior tests
	it("should open on keypress if closed", function(done) {
		var button = document.getElementById('pdb');
		button.close();
		button.target.focus();
		setTimeout(function() {
			fireKeyEvent(40);
			button.state.should.equal(button.STATE_OPENED);
			done();
		}, 100);
	});

	it("should not respond to keypress when not focused", function(done) {
		var button = document.getElementById('pdb');
		button.close();
		button.target.blur();
		setTimeout(function() {
			fireKeyEvent(40);
			button.state.should.equal(button.STATE_CLOSED);
			done();
		}, 100);
	});

	it("should be navigable with arrow keys", function(done) {
		var button = document.getElementById('pdb');
		button.target.focus();
		setTimeout(function() {
			var items = Polymer.dom(button).children.filter(function(e) { return e.localName === 'mm-list-item' });
			fireKeyEvent(40);
			fireKeyEvent(40);
			button.focusedItem.should.equal(items[0]);
			fireKeyEvent(38);
			button.focusedItem.should.equal(items[2]);
			fireKeyEvent(38)
			button.focusedItem.should.equal(items[1]);
			done();
		}, 100);
	});

	it("should also be navigable with home/end, pg up/pg dn keys", function(done) {
		var button = document.getElementById('pdb');
		button.target.focus();
		setTimeout(function() {
			var items = Polymer.dom(button).children.filter(function(e) { return e.localName === 'mm-list-item' });
			for(var i=0; i<100*Math.floor(Math.random()); i++) {
				fireKeyEvent(40);
			}
			fireKeyEvent(33);
			button.focusedItem.should.equal(items[0]);
			fireKeyEvent(34);
			button.focusedItem.should.equal(items[2]);
			fireKeyEvent(36);
			button.focusedItem.should.equal(items[0]);
			fireKeyEvent(35);
			button.focusedItem.should.equal(items[2]);
			done();			
		}, 100);
	});

	it("should select item on return", function(done) {
		var button = document.getElementById('pdb')
		button.target.focus();
		setTimeout(function() {
			var items = Polymer.dom(button).children.filter(function(e) { return e.localName === 'mm-list-item' });
			for(var i=0; i<100*Math.floor(Math.random()); i++) {
				fireKeyEvent(40);
			}
			var sel = button.focusedItem;
			fireKeyEvent(13);
			button.selectedItem.should.equal(sel);
			button.state.should.equal(button.STATE_CLOSED);
			done();
		}, 100);
	});

	it("should close panel on escape", function(done) {
		var button = document.getElementById('pdb');
		button.target.focus();
		setTimeout(function() {
			fireKeyEvent(27);
			button.state.should.equal(button.STATE_CLOSED);
			done();
		}, 100);
	});

});