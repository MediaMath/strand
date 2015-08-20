var should = chai.should();

describe("mm-input-mask", function() {

	it("should implement validation rules", function() {

		var t1 = document.querySelector("#test1");
		t1.rules.should.have.property('hour12');
		t1.rules.should.have.property('hour24');
		t1.rules.should.have.property('minutes');
		t1.rules.should.have.property('range');
		t1.rules.should.have.property('exact');
		t1.rules.should.have.property('all');

		var field = document.createElement('input');

		var h12 = t1.rules.hour12;
		h12('a','',{},field).should.be.true;
		h12('1','',{},field).should.be.true;
		h12('2','',{},field).should.be.false;

		field = document.createElement('input');

		var m = t1.rules.minutes;
		m('a', '', {}, field).should.be.true;
		m('0', '', {}, field).should.be.true;
		m('1', '', {}, field).should.be.true;
		m('5', '', {}, field).should.be.true;
		m('6', '', {}, field).should.be.false;

		field = document.createElement('input');
		var r = t1.rules.range;
		r('1', '', {max:2, min:1, args:"1-2"}, field).should.be.true;
		r('01', '01', {max:2, min:1, args:"1-2"}, field).should.be.true;
		r('02', '02', {max:2, min:1, args:"1-2"}, field).should.be.true;

		field = document.createElement('input');
		var e = t1.rules.exact;
		e('','', {args:'123'}, field).should.be.false;
		e('123','', {args:'123'}, field).should.be.false;
		e('','123', {args:'123'}, field).should.be.true;

		field = document.createElement('input');
		var a = t1.rules.all;
		a('','',{},field).should.be.true;
		a('1','1',{},field).should.be.true;
		a('a','a',{},field).should.be.true;
		a('Z','Z',{},field).should.be.true;
	});

	it("should parse mask sets into a data array", function() {
		var t2 = document.querySelector("#test3");

		t2.maskConfig.should.have.length(6);
		t2.maskConfig[0].should.have.keys("type","value","style");
		t2.maskConfig[0].type.should.equal(0);
		t2.maskConfig[1].should.have.keys("id", "max", "min", "rule", "restrict", "args", "auto", "type", "style", "loaded", "value", "placeholder");

	});

	it("should support value chunking into subfields", function() {
		var t3 = document.querySelector("#test3");
		console.log(t3._chunkValue(""));
		t3._chunkValue("").should.deep.equal([]);
		t3._chunkValue("(123) 123-1234").should.deep.equal(["123","123","1234"]);
		t3._chunkValue("(AAA) AAA-AAAA").should.deep.equal([]);
		t3._chunkValue("(AAA) AAA-AAAA","placeholder").should.deep.equal(["AAA","AAA","AAAA"]);

		var t3a = document.querySelector("#test3a");

		t3a._chunkValue("").should.deep.equal([]);
		t3a._chunkValue("12:12").should.deep.equal(["12","12"]);
		t3a._chunkValue("AA:AA").should.deep.equal([]);
		t3a._chunkValue("AA:AA","placeholder").should.deep.equal(["AA","AA"]);

	});
	
	it("should support autofill values for subfields", function(done) {

		var t4 = document.querySelector("#test4");
		t4.value = "(123) 123-1234";
		t4.async(function() {
			var check = Array.prototype.slice.apply(Polymer.dom(t4.root).querySelectorAll("input")).map(function(inputElement) {
				return inputElement.value;
			});
			check.join("").should.equal("1231231234");
			done();
		});
	});

});