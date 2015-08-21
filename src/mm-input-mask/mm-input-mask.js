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
		range: function(char, input, group, field) {
			if (input.length < group.max) { return true; }
			var i = parseInt(input),
				rng = _parseRange(group.args);
			if(rng.length > 0) return i >= rng[0] && i <= rng[1]
			else return true;
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
			StrandTraits.Keyboardable,
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
				value: null,
				notify: true,
			},
			seps: {
				type: Array,
				value: null
			},
			groups: {
				type: Array,
				value: null,
			},
			groupSel: {
				type: Array,
				value: null
			},
			rules: {
				type: Object,
				value: _rules,
			},
			restrict: {
				type: Object,
				value: _restrict,
			},
			disabled: {
				type: Boolean,
				value: false,
				reflectToAttribute: true,
				observer: '_disabledChanged'
			},
			placeholder: {
				type: String,
				reflectToAttribute: true,
				value: null,
				observer: '_placeholderChanged'
			},
			icon: {
				type: String,
				value: ""
			},
			_arimoLoaded: {
				type: Boolean,
				value: false
			}
		},

		created: function() {
			this.loader = new FontLoader();
			this.loader.add("Arimo");
		},

		attached: function() {
			this.updateGroups();
		},

		clear: function() {
			this.value = "";
		},

		_valueChanged: function(newValue, oldValue) {
			if (this.ignoreInternal) {
				this.ignoreInternal = false;
				return;
			} else {
				this.async(function() {
					this._applyValue(this._chunkValue(newValue));
				});
			}
		},

		_disabledChanged: function(newDisabled) {
			if(this.maskConfig)
				for(var i=0; i<this.maskConfig.length; i++)
					this.set('maskConfig.'+i+'.disabled',newDisabled);
		},

		_placeholderChanged: function(newPlaceholder) {
			this.async(function() {
				this._applyValue(this._chunkValue(newPlaceholder,"placeholder"),"placeholder");
			});
		},

		_chunkValue: function(value, type) {
			if (!type) type = "value";
			//clear case
			if (value === "" || value === null) {
				for(var i=0; i<this.groups.length; i++) {
					var g = this.groups[i];
					g[type] = "";
				}
				return [];
			}
			//chunk our values and assign them to sub fields
			else {
				var sepReg = "[" +  this.seps.map(function (sep) {
						return sep.value;
					}).join("")+ "]+",
					base = this.maskConfig.map(function(item) {
						switch(item.type) {
							case _types.GROUP:
								item = this.groups.filter(function(g) {
									return g.id === item.id;
								})[0];
								var src = this.get("restrict.source",item) || ".*";
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

		_applyValue: function(valArray, type) {
			if (!type) type = "value";
			if (!valArray) valArray = [];
			var g, value;
			for(var i=0; i<this.groups.length; i++) {
				g = this.groups[i];
				value = valArray.length > 0 ? valArray[i] : "";
				index = this.maskConfig.indexOf(g);
				modelPath = 'maskConfig.'+index+'.'+type;
				inputPath = 'groupSel.'+i+'.'+type;

				this.set(modelPath, value);
				this.set(inputPath, value);
			}
		},

		ready: function() {
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
				seps = [];

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
							disabled: this.disabled,
							value: '',
							placeholder: ''
						};
						maskConfig.push(o);
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
						maskConfig.push(s);
						seps.push(s);
						break;
				}
			}
			this.maskConfig = maskConfig;
			this.seps = seps;
			this.groups = groups;

			this.loader.add("Arimo").then(function(e) {
				this._arimoLoaded = true;
				this.async(function() {
					this.groups.forEach(function(group) {
						var index = this.maskConfig.indexOf(group);
						var path = 'maskConfig.'+index+'.loaded';
						this.set(path,true);
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
			var w = 0.0;
			var check = item.value || item.placeholder || "";
			while(check.length < item.max) {
				check += "S";
			}
			w = Measure.textWidth(this.$.input.$$('input'),check);

			return this.styleBlock({
				width: w+"px"
			});
		},

		updateGroups: function() {
			this.groupSel = this.groups.map(function(o) {
				return Polymer.dom(this.root).querySelector("#"+o.id);
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

		_handleCut: function(e) {
			this.updateGroups();
			setTimeout(this._cellVal.bind(this,e), 0);
		},

		_handlePaste: function(e) {
			e.preventDefault();
			var group = this._getGroup(e.target),
				pasteData = e.clipboardData.getData('text/plain'),
				max = group.max;
			if(pasteData.length > group.max) this._applyValue(this._chunkValue(pasteData));
			else if(this._validateGroup(e,e.target)) e.target.value = pasteData;
			this._cellVal(e);
		},

		_isKeyboardShortcut: function(e) {
			if(!(e instanceof KeyboardEvent)) return false;
			else if(!e.metaKey && !e.ctrlKey) return false;
			else switch(e.keyCode) {
				case 65: // Select all (a)
				case 67: // Copy (c)
				case 88: // Cut (x)
				case 86: // Paste (v)
					return true;
				break;
				default:
					return false;
				break;
			}
		},

		_validateGroup: function(e,target) {
			var val;
			if(e instanceof KeyboardEvent) val = String.fromCharCode(e.keyCode);
			else if(e instanceof ClipboardEvent) val = e.clipboardData.getData('text/plain');

			var group = this._getGroup(target);
			// If alphanumeric throw out all modifiers except capital letters
			if(group.restrict !== _restrict.all) {
				if(e.altKey) return false;
				if(e.shiftKey && (e.keyCode < 65 || e.keyCode > 90)) return false;
			}
			var restrict = group.restrict && _applyReg(group.restrict, val);
			var rule = group.rule && group.rule(val, target.value, group, target);
			return restrict && rule;
		},

		_focusLeft: function(target) {
			var idx = this.groupSel.indexOf(target);
			if (idx > 0) {
				idx--;
				this.groupSel[idx].focus();
				return this.groupSel[idx];
			}
			return target;
		},

		_focusRight: function(target) {
			var idx = this.groupSel.indexOf(target);
			idx++;
			if (idx < this.groupSel.length) {
				this.groupSel[idx].focus();
				return this.groupSel[idx];
			}
			return target;
		},

		_handleFill: function(target) {
			var group = this._getGroup(target),
				delta = group.max - target.value.length;
			if (group.auto && delta > 0) {
				var o = new Array(delta+1).join(group.auto);
				var val = target.value;
				target.value = o + val;
			}
		},

		_getGroup: function(target) {
			return this.groups[this.groupSel.indexOf(target)];
		},

		_cellKey: function(e) {
			this.updateGroups();
			this._routeKeyEvent(e);
		},

		_onAlpha: function(e) {
			if(this._isKeyboardShortcut(e)) return;
			var max = this._getGroup(e.target).max,
				selLength = e.target.selectionEnd - e.target.selectionStart;
			if(e.target.value.length === max && selLength === 0) e.target = this._focusRight(e.target);
			else if(!this._validateGroup(e,e.target)) {
				e.preventDefault();
			}
		},
		_onNum: function(e) {
			this._onAlpha(e);
		},

		_onLeft: function(e) {
			if(e.target.selectionStart === 0) {
				var oldTarget = e.target;
				var newTarget = this._focusLeft(e.target);
				if(oldTarget !== newTarget) newTarget.selectionStart = newTarget.selectionEnd = newTarget.value.length;
			}
		},
		
		_onRight: function(e) {
			var max = this._getGroup(e.target).max,
				selLength = e.target.selectionEnd - e.target.selectionStart;
			if(e.target.selectionStart === e.target.value.length && selLength === 0) {
				var oldTarget = e.target;
				var newTarget = this._focusRight(e.target);
				if(oldTarget !== newTarget) newTarget.selectionStart = newTarget.selectionEnd = 0;
			}
		},
		
		_onTab: function(e) {
			this._handleFill(e.target);
		},

		_onBackspace: function(e) {
			if(e.target.selectionStart === 0 && e.target.selectionEnd === 0) e.target = this._focusLeft(e.target);
		},

		_onOther: function(e) { e.preventDefault(); },

		_updateGroupValues: function() {
			for(var i=0; i<this.groupSel.length; i++) {
				var item = this.$.domRepeat.itemForElement(this.groupSel[i]);
				item.value = this.groupSel[i].value;
			}
		},

		_cellVal: function(e) {
			this._updateGroupValues();
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
