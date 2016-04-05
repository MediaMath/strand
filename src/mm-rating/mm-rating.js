( function (scope) {
    scope.Rating = Polymer({
        is: 'mm-rating',
        hovered: false,
        properties: {
            icon: {
                type: String,
                value: 'star'
            },
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
            values: {
                type: Object,
                value: {0: 'Poor', 1: 'Need Improvement', 2: 'Reasonable', 3: 'Good', 4: 'Excellent'}
            }
        },

        ready: function() {
            this._defaultNoOfIcons = [];
            if(typeof this.values === 'string'){
                var greetObj = eval("("+ this.values +")");
                this._noOfIcons = Object.keys(greetObj).length;
            } else if(typeof this.values === 'object'){
                this._noOfIcons = Object.keys(this.values).length;
            }
            for (var i = this._noOfIcons - 1; i >= 0; i--) {
                this._defaultNoOfIcons.push(i+1);
            }
        },
        isCustomIcon: function() {
            return this.customIcon;
        },
        isActive: function(index) {
            if ((index - this._noOfIcons) * -1 == this.rating) {
                return "active";
            }
        },
        isDisplayTotals: function(showtotals) {
            return showtotals;
        },
        isDisplayGreetings: function(showgreetings) {
            return showgreetings;
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
                if(typeof this.values === 'string'){
                    var greetObj = eval("("+ this.values +")");
                    this.greetArr = Object.keys(greetObj).map(function (key) {return greetObj[key]});
                    this.finalGreet = this.greetArr.reverse();
                    this.greeting = this.finalGreet[index];
                }
            }
        },
        _overHandler: function(e) {
            var index = e.model.index;
            if(typeof this.values === 'string'){
                var greetObj = eval("("+ this.values +")");
                this.greetArr = Object.keys(greetObj).map(function (key) {return greetObj[key]});
                this.finalGreet = this.greetArr.reverse();
                this.greeting = this.finalGreet[index];
            } else if(typeof this.values === 'object'){
                var greetObj = this.values;
                this.greetArr = Object.keys(greetObj).map(function (key) {return greetObj[key]});
                this.finalGreet = this.greetArr.reverse();
                this.greeting = this.finalGreet[index];
            }

        },
        _outHandler: function(e) {
            if(typeof this.values === 'string') {
                var greetObj = eval("(" + this.values + ")");
                this.greeting = greetObj[this.rating - 1];
            } else if(typeof this.values === 'object') {
                var greetObj = this.values;
                this.greeting = greetObj[this.rating - 1];
            }
        }
    });
})(window.Strand = window.Strand || {});