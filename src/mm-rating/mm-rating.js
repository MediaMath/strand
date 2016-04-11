( function (scope) {
    scope.Rating = Polymer({
        is: 'mm-rating',
        behaviors: [
            StrandTraits.Stylable
        ],
        properties: {
            customIcon: {
                type: String,
                value: null
            },
            iconWidth: {
                type: Number,
                value: 20
            },
            iconHeight: {
                type: Number,
                value: 20
            },
            rating: {
                type: Number,
                value: 0
            },
            displayTotals: {
                type: Boolean,
                value: false
            },
            displayGreetings: {
                type: Boolean,
                value: false
            },
            readonly: {
                type: Boolean,
                value: false
            },
            data: {
                type: Array,
                value: function() {
                    return [{name: 'Poor'}, {name: 'Need Improvement'}, {name: 'Reasonable'}, {name: 'Good'}, {name: 'Excellent'}];
                }
            }
        },
        ready: function() {
            this._defaultNoOfIcons = [];
            this._noOfIcons = this.data.length;
            for (var i = this._noOfIcons - 1; i >= 0; i--) {
                this._defaultNoOfIcons.push(i+1);
            }
        },
        isCustomIcon: function(item) {
            if(item) {
                if (this.customIcon === null && item.icon === undefined) return true;
            } else {
                return this.customIcon;
            }
        },
        calculateRating: function(e) {
            deep = Polymer.dom(this.root);
            if(!this.readonly){
                var index = e.model.index;
                var indexOld = (this.rating * -1) + this._noOfIcons;
                this.rating = (index - this._noOfIcons) * -1;
                if (indexOld < this._noOfIcons) {
                    deep.querySelector('[data-index="'+ indexOld +'"]').classList.remove("active");
                }
                deep.querySelector('[data-index="'+ index +'"]').classList.add("active");
                var greetObj = this.data;
                this.greetArr = Object.keys(greetObj).map(function (key) {return greetObj[key]});
                this.finalGreet = this.greetArr.reverse();
                this.greeting = this.finalGreet[index];
            }
        },
        _overHandler: function(e) {
            var index = e.model.index;
            var greetObj = this.data;
            this.greetArr = Object.keys(greetObj).map(function (key) {return greetObj[key]});
            this.finalGreet = this.greetArr.reverse();
            this.greeting = this.finalGreet[index];
        },
        _outHandler: function(e) {
            this.greeting = this.data[this.rating - 1];
        },
        updateClass: function(index) {
            var o = {};
            if ((index - this._noOfIcons) * -1 == this.rating) {
                o.active = true;
            }
            return this.classBlock(o);
        }
    });
})(window.Strand = window.Strand || {});