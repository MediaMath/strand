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
                value: 0,
                observer: "_valueChanged"
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
            this._customIcons = this.data.reverse();
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
        calculateRating: function() {
            var deep = Polymer.dom(this.root);
            if(!this.readonly){
                var index = this.$.domRepeat.indexForElement(event.target);
                this.indexOld = (this.rating * -1) + this._noOfIcons;
                this.rating = (index - this._noOfIcons) * -1;
                this.greeting = this._customIcons[index];
            }
        },
        _overHandler: function() {
            var index = this.$.domRepeat.indexForElement(event.target);
            this.greeting = this._customIcons[index];
        },
        _outHandler: function() {
            var greetObj = this._customIcons;
            this.greetArr = Object.keys(greetObj).map(function (key) {return greetObj[key]});
            this.finalGreet = this.greetArr.reverse();
            this.greeting = this.finalGreet[this.rating - 1];
        },
        _valueChanged: function(newVal, oldVal) {
            if (newVal !== null) {
                this.debounce("valueChanged", this._handleChangeValue);
                this.indexOld =  newVal;
            }
        },
        _handleChangeValue: function() {
            this.indexOld = this.rating - 1;
        },
        _updateClass: function(index) {
            var o = {};
            if ((index - this._noOfIcons) * -1 <= this.rating) {
                o.active = true;
            }
            return this.classBlock(o);
        }
    });
})(window.Strand = window.Strand || {});