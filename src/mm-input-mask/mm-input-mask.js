/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var Measure = StrandLib.Measure,
		FontLoader = StrandLib.FontLoader;

	var _types = {
		SEP:0,
		GROUP:1
	};

	var _restrict = {
		alpha:/[A-Za-z]+/g,
		numeric:/\d+/ig,
		alphaNumeric:/[A-Za-z\d]+/g,
		all:/.+/g
	};

	var _applyReg = function(reg, val) {
		if (reg) {
			reg.lastIndex = 0;
			return reg.test(val);
		}
		return false;
	};

	var _rules = {
		hour12:function(char, input, group, field) {

			var val = input+char,
				first = field.selectionStart === 0,
				second = field.selectionStart === 1,
				imp = parseInt(char);

			if (first) {
				if (imp > 1) {
					field.value = "0" + input;
					return false;
				}
			} else if (second) {
				if (imp > 2 && parseInt(input) === 1) {
					field.value = input + "2";
					return false;
				}
			}
			return true;
		},
		hour24: function(char, input, group, field) {
			//TODO: support for 24
			var val = input+char,
				first = field.selectionStart === 0,
				second = field.selectionStart === 1,
				imp = parseInt(char);

		},
		minutes: function(char, input, group, field) {
			var first = field.selectionStart === 0;
			var imp = parseInt(char);
			if (first) {
				if (imp > 5) {
					field.value = "5";
					return false;
				}
			}
			return true;
		},
		range:function(char, input, group, field) {
			if (input.length < group.max) { return true; }
			var i = parseInt(input),
				rng = _parseRange(group.args);
			return i >= rng[0] && i <= rng[1];
		},
		exact: function(char, input, group, field) {
			return input === group.args;
		},
		all: function() {
			return true;
		}
	};

	var _parseRange = function(range) {
		if (!range) return [];
		return range.split("-").map(function(i) { return parseInt(i); });
	};

	var _groupRange = function(range) {
		if (!range) return [];
		if (_isRange(range)) {
			return _parseRange(range);
		} else {
			var s = parseInt(range);
			return [s,s];
		}
	};

	var _isRange = function(range) {
		return range.indexOf("-") !== -1;
	};

	scope.InputMask = Polymer({
		is: 'mm-input-mask',

		behaviors: [
			StrandTraits.DomGettable,
			StrandTraits.Stylable,
		],

		properties: {
			value: {
				type: String,
				reflectToAttribute: true,
				notify: true,
				value: null,
				observer: '_valueChanged'
			},
			mask: {
				type: String,
				value: "",
			},
			maskConfig: {
				type: Array,
				value: function() { return []; },
				notify: true,
			},
			seps: {
				type: Array,
				value: function() { return []; }
			},
			groups: {
				type: Array,
				value: function() { return []; }
			},
			groupSel: {
				type: Array,
				value: function() { return []; }
			},
			rules: {
				type: Object,
				value: null,
			},
			restrict: {
				type: Object,
				value: null,
			},
			placeholder: {
				type: String,
				reflectToAttribute: true,
				value: null,
			},
		},

		created: function() {
			this.loader = new FontLoader();
			this.loader.add("Arimo");
		},

		attached: function() {
			this.updateGroups();
		},

		_maskTemplate: function() {
			var template = [];
			var nodes = this.getLightDOM();
			for(var i=0; i<nodes.length; i++) {
				var node = nodes[i];
				if(node.nodeName === "SEP") template.concat(node.attributes.chars.value.split(''));
				else for(var j=0; j<node.attributes.size.value; j++) template.push(null);
			}
			return template;
		},

		_valueChanged: function(value) {
			// this._sanitizeValue(value);
			if(value) this._chunkValue(value,false);
			else this._chunkValue(this.placeholder,true);
		},

		_sanitizeValue: function(value) {
			if(!value) return;
			var rest = value;
			var template = this._maskTemplate();
			for(var i=0; i<template.length; i++) {
				if(template[i] === null) {
					template[i] = rest[0];
					rest = rest.substring(1);
				};
			}
			template = template.join('');
			console.log(template);
			this.value = template;
		},

		_chunkValue: function(value, isPlaceholder) {
			console.log("chunking");
			if(!value) return;
			if(!this.groupSel) return;
			if(this.groupSel.reduce(function(curr,prev){ !curr || !prev; })) return;
			this.async(function() {
				var nodes = this.getLightDOM();
				var rest = value;
				var groupCount = 0;

				for(var i=0; i<nodes.length; i++) {
					var node = nodes[i];
					if(node.nodeName === 'GROUP' && isPlaceholder) {
						var size = Math.min(node.attributes.size.value,this.groupSel[groupCount].placeholder.length);
						this.maskConfig[i].placeholder = rest.substring(0,size);
						this.groupSel[groupCount].placeholder = this.maskConfig[i].placeholder;
						rest = rest.substring(size);
						groupCount++;
					} else if(node.nodeName === 'GROUP') {
						var size = Math.min(node.attributes.size.value,this.groupSel[groupCount].value.length);
						this.maskConfig[i].value = rest.substring(0,size);
						this.groupSel[groupCount].value = this.maskConfig[i].value;
						rest = rest.substring(size);
						groupCount++;
					} else {
						rest = rest.substring(node.attributes.chars.value.length);
					}
				}
			});
		},

		ready: function() {
			if (!this.rules) {
				this.rules = _rules;
			}
			if(!this.restrict) {
				this.restrict = _restrict;
			}
			//TODO: remove this in favor of dom notifier
			this._parseMask();

			this.async(function() {
				this.$.input.$$("input").setAttribute("tabIndex",-1);
			});
		},

		_parseMask: function() {
			this.sepsLen = 0; //used to check 'empty' state for placeholder styling
			var nodes = Polymer.dom(this).children,
				maskConfig = [],
				groups = [],
				seps = [],
				pl = this.value,
				rest = this.placeholder;

			for(var i=0; i<nodes.length; i++) {
				var node = nodes[i];
				switch(node.nodeName) {
					case "GROUP":
						var rng = _groupRange(node.attributes.size.value),
							rule = this.rules[node.attributes.rule.value],
							restrict = this.restrict[node.attributes.restrict.value],
							// auto = node.attributes.autofill.value,
							auto = false,
							args = node.textContent.trim(),
							style = {
								width:"auto"
							};
						if (restrict !== _restrict.numeric) style = {};

						var o = {
							id:"mini"+i,
							max:rng[1],
							min:rng[0], 
							rule:rule, 
							restrict:restrict, 
							args:args, 
							auto:auto,
							type:_types.GROUP, 
							style:style,
							loaded: false,
							value: (pl) ? pl.substring(0,node.attributes.size.value) : '',
							placeholder: (rest) ? rest.substring(0,node.attributes.size.value) : ''
						};
						rest = (rest) ? rest.substring(node.attributes.size.value) : '';
						pl = (pl) ? pl.substring(node.attributes.size.value) : '';
						maskConfig.push(o)
						groups.push(o);
						break;

					case "SEP":
						var chars = node.attributes.chars.value;
						this.sepsLen += chars.length;
						var s = {
							type:_types.SEP, 
							value:chars, 
							style: this.classBlock({
								sep: true, 
								placeholder: true
							})
						};
						pl = (pl) ? pl.substring(chars.length) : '';
						rest = (rest) ? rest.substring(chars.length) : '';
						maskConfig.push(s);
						seps.push(s);
						break;
				}
			}
			this.maskConfig = maskConfig;
			this.seps = seps;
			this.groups = groups;

			this.loader.add("Arimo").then(function(e) {
				this.arimoLoaded = true;
				this.async(function() {
					this.groups.forEach(function(group) {
						group.loaded = true;
						},this);
					});
			}.bind(this));
		},

		_sepClass: function(val) {
			if(!val) var val = "";
			var placeholder = val.length <= this.sepsLen;
			return this.classBlock({
				sep: true,
				placeholder: placeholder
			});
		},

		_groupStyle: function(inputValue,item,loaded) {
			// console.log('styling group');
			var w = 0.0;
			var check = item.value || item.placeholder || "";
			while(check.length < item.max) {
				check += "S";
			}
			console.log(check);
			w = Measure.textWidth(null, check, "13px Arimo");

			return this.styleBlock({
				width: w+"px"
			});
		},

		updateGroups: function() {
			this.groupSel = this.groups.map(function(o) {
				return this.querySelector("#"+o.id);
			}.bind(this));
		},

		_handleFocus: function(e) {
			this.updateGroups();
			this._handleInputFocus();       
		},

		_handleInputFocus: function(e) {
			this.$.input.$$("input").setAttribute("forceFocus",true);
		},

		_handleBlur: function(e) {
			this.$.input.$$("input").removeAttribute("forceFocus");
		},

		validateGroup: function(e, target) {
			var val = String.fromCharCode(e.keyCode);
			var group = this.getGroup(target);
			var restrict = group.restrict && _applyReg(group.restrict, val);
			var rule = group.rule && group.rule(val, target.value, group, target);
			return restrict && rule;
		},

		focusLeft: function(target) {
			var idx = this.groupSel.indexOf(target);
			if (idx > 0) {
				idx--;
				this.groupSel[idx].focus();
				return this.groupSel[idx];
			}
			return target;
		},

		focusRight: function(target) {
			var idx = this.groupSel.indexOf(target);
			idx++;
			if (idx < this.groupSel.length) {
				this.groupSel[idx].focus();
				return this.groupSel[idx];
			}
			return target;
		},

		handleFill: function(target) {
			var group = this.getGroup(target),
				delta = group.max - target.value.length;
			if (group.auto && delta > 0) {
				var o = new Array(delta+1).join(group.auto);
				var val = target.value;
				target.value = o + val;
			}
		},

		getGroup: function(target) {
			return this.groups[this.groupSel.indexOf(target)];
		},

		cellKey: function(e) {
			this.updateGroups();
			var target = e.target,
				code = e.keyCode,
				alpha = (code >= 48 && code <= 57),
				numeric =  (code >= 65 && code <= 90),
				alphaNumeric = alpha || numeric,
				left = code === 37,
				right = code === 39,
				back = code === 8,
				tab = code === 9,
				selLength = target.selectionEnd - target.selectionStart,
				max = this.getGroup(e.target).max;


			if (back && target.value.length === 0 && selLength === 0) {
				target = this.focusLeft(target);
			} else
			if (alphaNumeric && target.value.length === max && selLength === 0) {
				target = this.focusRight(target);
			} else
			if (left && e.target.selectionStart === 0) {
				target = this.focusLeft(target);
			} else
			if (right && e.target.selectionStart === max) {
				target = this.focusRight(target);
			}
			if (alphaNumeric && !this.validateGroup(e, target) && selLength === 0) {
				e.preventDefault();
				if (target.value.length === max)
					this.focusRight(target);
			}
			if (tab) {
				this.handleFill(target);
			}
		},

		cellVal: function(e) {
			this.$.domRepeat.itemForElement(e.target).value = e.target.value;

			var val = this.maskConfig.reduce(function(prev,item) {
				return item.value ? prev + item.value : prev;
			},"");
			if (val !== this.value) {
				this.ignoreInternal = true;
			}
			this.value = val;
		}

	});

})(window.Strand = window.Strand || {});
