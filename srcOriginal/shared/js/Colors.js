/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
/*
	NOTE: GENERATED FILE DO NOT MANUALLY EDIT -- 
		EDIT TEMPLATE SOURCE IN `build/lib_color.js`
		EDIT COLORS in sass/_colors.scss
*/

(function () {
	
	var colors = {
	// greys
	"A0":"#000",
	"A1":"#191919",
	"A2":"#333",
	"A3":"#4C4C4C",
	"A4":"#666",
	"A5":"#7F7F7F",
	"A6":"#999",
	"A7":"#B2B2B2",
	"A8":"#CCC",
	"A9":"#E5E5E5",
	"A10":"#F0F0F0",
	"A11":"#FBFBFB",
	"A12":"#f1f3f7",
	"A13":"#cbcbcb",
	"A14":"#e9e9e9",
	"A15":"#d6d6d6",
	"A16":"#e0e0e0",
	"A17":"#b9b9b9",
	"A18":"#c2c2c2",
	"A19":"#f2f4f8",
	"A20":"#d5d5d5",
	"A21":"#c2c2c2",

// greens 
	"B0":"#3C5918",
	"B1":"#476F13",
	"B2":"#59881B",
	"B3":"#6DA424",
	"B4":"#78B429",
	"B5":"#89BF40",
	"B6":"#9ECB5C",
	"B7":"#B3D878",
	"B8":"#C6E492",
	"B9":"#D4ECA5",
	"B10":"#E8F4CA",
	"B11":"#F3F9E4",
	"B12":"#86c633",
	"B13":"#d2e995",
	"B14":"#9ecb5c",

// reds
	"C0":"#BC0505",
	"C1":"#D30505",
	"C2":"#E73939",
	"C3":"#EA5151",
	"C4":"#ED6A6A",
	"C5":"#F08383",
	"C6":"#F39C9C",
	"C7":"#F6B4B4",
	"C8":"#F9CDCD",
	"C9":"#FBDEDE",
	"C10":"#FDEEEE",
	"C11":"#FEF6F6",
	"C12":"#f85252",
	"C13":"#e10707",
	"C14":"#f99",

// blues 
	"D0":"#003C71",
	"D1":"#194F7F",
	"D2":"#2E6C9E",
	"D3":"#438ECA",
	"D4":"#55ADF3",
	"D5":"#77BDF5",
	"D6":"#96D4F8",
	"D7":"#AADCF9",
	"D8":"#BFE5F9",
	"D9":"#D5EEFA",
	"D10":"#E9F6FB",
	"D11":"#F4FAFD",
	"D12":"#2f93c8",
	"D13":"#79a8ce",
	"D14":"#89c3f1",
	"D15":"#a9d3f5",
	"D16":"#77b0dc",
	"D17":"#8fbee2",
	"D18":"#7193af",
	"D19":"#5fa0d5",
	"D20":"#abd3f7",
	"D20":"#98cbf3",
	"D21":"#438eca",
	"D22":"#5ca1d7",
	"D23":"#d5edf9",
	"D24":"#7dbef1",
	"D25":"#c7f1fe",

// oranges
	"E0":"#FF9700",
	"E1":"#FFA205",
	"E2":"#FFAD0A",
	"E3":"#FEB80F",
	"E4":"#FEC515",
	"E5":"#FED01A",
	"E6":"#FEE066",
	"E7":"#FFEDA6",
	"E8":"#FEEFB6",
	"E9":"#FFF8E0",
	"E10":"#FDFBF0",
	"E11":"#FEFDF8",
	"E12":"#fdb600",
	"E13":"#ffffcc",
	"E14":"#fed01a",

// default
	"F0":"#FFF",
	"F1":"#000",

	};

	function getValue(key) {
		var h = "#";
		if (key[0] === h) {
			return key;
		} else {
			return h + this[key].toString(16);
		}
	}

	colors.getValue = getValue;
	window.Colors = colors;
})(); 

