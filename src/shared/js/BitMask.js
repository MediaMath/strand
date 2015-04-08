function BitMask() {
	var args = [].slice.call(arguments);
	this.data = [];
	for(var i=0; i<args.length; i++) {
		this[args[i]] = 1 << i;
		this.data[1 << i] = args[i];
	}
}