/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function(scope) {

	var Measure = StrandLib.Measure;

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
				value: null,
			},
			mask: {
				type: String,
				value: "",
			},
			maskConfig: {
				type: Array,
				value: function() { return []; }
			},
			seps: {
				type: Array,
				value: function() { return []; }
			},
			groups: {
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
			// this._parseMask();
		},

		attached: function() {
			this.updateGroups();
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
		},

		// contentWidth: function(item,value) {
		// 	console.log(item);
		// 	console.log(value);
		// 	var val = item.value,
		// 		placeholder = item.placeholder;
		// 	var w = 0.0;
		// 	var check = val || placeholder || "";
		// 	while(check.length < this.max) {
		// 		check += "S";
		// 	}
		// 	if (!val && placeholder) {
		// 		w = Measure.textWidth(null, check, "italic 13px Arimo");
		// 	} else {
		// 		w = Measure.textWidth(null, check, "13px Arimo");
		// 	}
		// 	return this.styleBlock({
		// 		background: "red",
		// 	});
		// },

		_sepClass: function(val) {
			if(!val) var val = "";
			var placeholder = val.length <= this.sepsLen;
			return this.classBlock({
				sep: true,
				placeholder: placeholder
			});
		},

		_groupStyle: function(inputValue,item) {
			var w = 0.0;
			var check = item.value || item.placeholder || "";
			while(check.length < item.max) {
				check += "S";
			}
			if (!item.value && item.placeholder) {
				w = Measure.textWidth(null, check, "italic 13px Arimo");
			} else {
				w = Measure.textWidth(null, check, "13px Arimo");
			}

			return this.styleBlock({
				width: w+"px"
			});
		},

		chunkValue: function(value, type) {
			if (!type) type = "value";
			//clear case
			if (value === "" || value === null) {
				for(var i=0; i<this.groups.length; i++) {
					var g = this.groups[i];
					g[type] = "";
				}
				return [];

			//chunk our values and assign them to sub fields
			} else {
				var sepReg = "[" +  this.seps.map(function (sep) {
						return sep.value;
					}).join("")+ "]+",
					srcPath = Path.get("restrict.source"),
					base = this.maskConfig.map(function(item) {
						switch(item.type) {
							case _types.GROUP:
								item = this.groups.filter(function(g) {
									return g.index === item.index;
								})[0];
								var src = srcPath.getValueFrom(item) || ".*";
								if (type === "placeholder") {
									src = ".*";
								}
								if (item.min !== item.max) {
									return "(" + src + ")";
								} else {
									src = src.replace("+","");
									src = src.replace("*","");
									return "(" + src + "{" + item.min + "})";
								}
								break;
							case _types.SEP:
								return sepReg;
						}
					},this),
					r = new RegExp(base.join(""), "g"),
					res = r.exec(value);
				if (res) {
					res.shift();
					return Array.prototype.slice.apply(res);
				}
				return [];
			}
		},

		applyValue:function(valArray, type) {
			if (!type) type = "value";
			if (!valArray) valArray = [];
			var g, value;
			for(var i=0; i<this.groups.length; i++) {
				g = this.groups[i];
				value = valArray.length > 0 ? valArray[i] : "";
				g[type] = value;
			}
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
