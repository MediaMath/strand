/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

*/
(function () {

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

	Polymer('mm-input-mask', {
		ver:"<<version>>",

		publish: {
			mask:"",
			rules:null,
			restrict:null
		},

		created: function() {
			this.loader = new FontLoader();
			this.loader.add("Arimo");

			this._focusHandler = this.handleFocus.bind(this);
			this._blurHandler = this.handleBlur.bind(this);
		},

		ready: function() {

			this.super();
			if (!this.rules) {
				this.rules = _rules;
			}
			if(!this.restrict) {
				this.restrict = _restrict;
			}
			//TODO: remove this in favor of dom notifier
			this.parseMask();
		},

		domReady: function() {
			this.$.input.setAttribute("disabled",true);
			this.updateGroups();
		},

		attached: function() {
			this.$.input.addEventListener("focus", this._focusHandler);
			this.$.input.addEventListener("blur", this._blurHandler);
		},

		detached: function() {
			this.$.input.removeEventListener("focus", this._focusHandler);
			this.$.input.removeEventListener("blur", this._blurHandler);
		},

		parseMask: function() {
			this.sepsLen = 0; //used to check 'empty' state for placeholder styling
			var nodes = DataUtils.clone( this.$.content.getDistributedNodes() ),
				groups = [],
				seps = [];
			this.maskConfig = nodes.map(function(node, index) {
				switch(node.nodeName) {
					case "GROUP":
						var rng = _groupRange(node.getAttribute("size")),
							rule = this.rules[node.getAttribute("rule")],
							restrict = this.restrict[node.getAttribute("restrict")],
							auto = node.getAttribute("autofill"),
							args = node.textContent.trim(),
							style = {
								width:"auto"
							};
						if (restrict !== _restrict.numeric) style = {};

						var o = {
							index:index,
							max:rng[1],
							min:rng[0], 
							rule:rule, 
							restrict:restrict, 
							args:args, 
							auto:auto,
							type:_types.GROUP, 
							style:style,
							loaded: false,
							contentWidth:this.contentWidthHandler
						};
						groups.push(o);
						return o;

					case "SEP":
						var chars = node.getAttribute("chars");
						this.sepsLen += chars.length;
						var s = {
							type:_types.SEP, 
							value:chars, 
							style:{
								sep:true, 
								placeholder:true
							}
						};
						seps.push(s);
						return s;
				}
			}, this);
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

		contentWidthHandler: function(style, val, placeholder, loaded) {
			var w = 0.0;
			var check = val || placeholder || "";
			while(check.length < this.max) {
				check += "S";
			}
			if (!val && placeholder) {
				w = Measure.textWidth(null, check, "italic 13px Arimo");
			} else {
				w = Measure.textWidth(null, check, "13px Arimo");
			}
			style.width = w + "px";
			return style;
		},

		placeholderChanged: function(oldPlaceholder, newPlaceholder) {
			this.applyValue(this.chunkValue(this.placeholder, "placeholder"), "placeholder");
		},

		valueChanged: function(oldValue, newValue) {
			if (newValue) {
				var placeholder = newValue.length <= this.sepsLen;
				this.seps.forEach(function(sep) {
					sep.style = {sep:true, placeholder:placeholder};
				},this);
			}
			if (this.ignoreInternal) {
				this.ignoreInternal = false;
				return;
			}
			this.applyValue(this.chunkValue(newValue));
		},

		chunkValue: function(value, type) {
			if (!type) type = "value";
			//clear case
			if (value === "" || value === null) {
				// for(var i=0; i<this.groups.length; i++) {
				// 	var g = this.groups[i];
				// 	g[type] = "";
				// }
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
				return this.shadowRoot.querySelector("#mini"+o.index);
			}.bind(this));
		},

		handleFocus: function(e) {
			this.updateGroups();
			this.handleInputFocus();
		},

		handleInputFocus: function(e) {
			this.$.input.setAttribute("forceFocus",true);
		},

		handleBlur: function(e) {
			this.$.input.removeAttribute("forceFocus");
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
			var val = this.maskConfig.reduce(function(prev, item) {
				return item.value ? prev + item.value : prev;
			},"");
			if (val !== this.value) {
				this.ignoreInternal = true;
			}
			this.value = val;
		}

	});
})();
