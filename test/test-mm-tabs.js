var should = chai.should();

describe("mm-tabs", function() {
	
	it("should have an element constructor", function() {
		var a = new Strand.Tabs();
		a.nodeName.should.equal("MM-TABS");
	});

	it("should collect tabs", function() {
		var a = document.querySelector('#default');
		a.tabs.should.not.be.empty;
	});

	it("should set the active tab", function() {
		var a = document.querySelector('#default');
		a.$.selector.selected.should.equal(a.querySelector('mm-tab[active]'));
		var b = document.querySelector('#allActive');
		b.$.selector.selected.should.equal(b.querySelector('mm-tab[active]'));
		var c = document.querySelector('#testTabs');
		c.$.selector.selected.should.equal(c.querySelector('mm-tab[active]'));
	});

});

describe("mm-tab", function() {
	it("should have an element constructor", function() {
		var a = new Strand.Tab();
		a.nodeName.should.equal("MM-TAB");
	});

	it("should load external content and fire an event", function(done) {
		var a = document.querySelector('#testTab');
		a.active = true;
		a.addEventListener('loaded', function(detail) {
			var tmpl = detail.target.querySelector('template');
			tmpl.addEventListener('dom-change', function(e) {
				e.target.$.aux.should.exist;
				done();
			});
		});
	});

	it("should load external content imperatively and have a callback", function(done) {
		var a = document.querySelector('#testTab2');
		a.loadExternal('test-mm-tabs-aux.html', function() {
			var ext = a.querySelector('template');
			ext.should.exist;
			done();
		});
		a.active = true;
	});
})