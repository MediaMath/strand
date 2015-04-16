/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt
*/
function BitMask() {
	var args = [].slice.call(arguments);
	this.data = [];
	for(var i=0; i<args.length; i++) {
		this[args[i]] = 1 << i;
		this.data[1 << i] = args[i];
	}
}