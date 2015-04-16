/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt
*/
/*jshint loopfunc: true */
(function () {

	var priv = "@@";

	Polymer('mm-data-observer', {
		ver:"<<version>>",

		created: function() {

			var flagName,
				internal,
				deep;

			if (this.deepPublish) {
				deep = JSON.parse(JSON.stringify(this.deepPublish));
				this.__obs = {};
				if (!this.computed) this.computed = {};

				Object.keys(deep).forEach(function(i) {
					internal = [priv + i];

					if ( DataUtils.isType(deep[i], "array") ) {
						internal.push(i + ".length");
					}
					
					this.__obs[i] = DataUtils.compoundObserverFactory(deep[i], function(ch, i) {
						this.triggerUpdate(i);
					});
					
					this.__obs[i].open(function(ch, i) {
						this.triggerUpdate(i);
					}.bind(this));

					Object.defineProperty(this, i, {
						get: Function("return this['"+priv+i+"']"),
						set: Function("input", "this['"+priv+i+"'] = input; this.triggerUpdate('"+i+"')")
					});

					flagName = priv + i + "UpdateFlag";
					internal.push(flagName);
					this[flagName] = 0; //init update flag to 0
					this[priv + i] = deep[i] || null; //init our value if passed
					this.computed[i] = "update(" + internal.join(",") + ")";
				}, this);
			}

			//TODO: (dlasky) this requires investigation around why binds update but change handlers do not
			// if(this.silentPublish) {
			// 	deep = JSON.parse(JSON.stringify(this.silentPublish));
			// 	Object.keys(deep).forEach(function(i) {
			// 		this[priv + i] = deep[i] || null;
			// 		Object.defineProperty(this, i, {
			// 			get: Function("return this['"+priv+i+"']"),
			// 			set: Function("input", "this['"+priv+i+"']=input")
			// 		});
			// 		this.computed[i] = "update("+i+")";
			// 	}, this);
			// }
		},

		update: function(input) {
			return input;
		},

		triggerUpdate: function(prop) {
			this[priv + prop + "UpdateFlag"]++;
		},

		attached: function() {
			if (this.__cleanup) {
				console.warn("Warning -- observers were closed when node was detached from dom. Consider instantiating or calling 'created' manually");
			}
		},

		detached: function() {
			for(var i in this.__obs) {
				this.__obs[i].close();
			}
			this.__cleanup = true;
		}

	});

})(); 