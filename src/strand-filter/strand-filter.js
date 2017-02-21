/**
 * @license
 * Copyright (c) 2015 MediaMath Inc. All rights reserved.
 * This code may only be used under the BSD style license found at http://mediamath.github.io/strand/LICENSE.txt

 */
(function (scope) {
    'use strict';
    scope.filter =   Polymer({
        is: 'strand-filter',
        created:function(){
            this._injector = this.getInjector();
            this.comparisonFunctions = this._injector.resolve('comparisonFunctions');

        },
        attached: function () {
            if(this.comparisonFunctions){
                this.comparisons = Object.keys(this.comparisonFunctions).map(function(itemk, index){
                    var item = this.comparisonFunctions[itemk];
                    return {
                        name:item.displayName || item.key,
                        value:item.key,
                        comparison:item
                    };
                }.bind(this));
            }
            this._switchMode();

        },

        _switchMode:function(){
            // Adds default searchConfig row as per the mode of component. If non-advance mode, the search term is searched (for contains) in all columns.
            var isSearchConfigEmpty = (!this.searchConfig || this.searchConfig.length === 0);
            if( !this._isAdvance()){
                this.searchConfig = isSearchConfigEmpty ? [
                    { 'searchValue': this._simpleSearchValue || '',
                        'column': 'ALL',//'first_name',
                        'comparison': this.comparisonFunctions.contains,
                        'logicalOperator': "AND"

                    }
                ]:this.searchConfig;
                this.searchConfig[0].column = 'ALL';
            }else{
                //for advance mode, first column is selected initially. User is free to change this.
                this.searchConfig = isSearchConfigEmpty ?  [
                    { 'searchValue': '',
                        'column': this.columns[0].value,
                        'comparison': this.comparisonFunctions.contains,
                        'logicalOperator': "AND"  }
                ]:this.searchConfig;

            }
        },
        _isAdvance:function (a) {

            if (a === 'advance') {
                return true;
            }
            return false;
        },
        setFirstRowSearchConfig: function (item) {
            item.logicalOperator = 'AND';
            item.index = 0;
            item.level = 0;
            item.parent = null;
            item.id = 0;
        },
        _toSelectLogicalOperation: function (index, item) {
            // for index 0  row logical operation is defaulted to 'AND'. and user do not need to change it.
            if ( index === 0) {
                this.setFirstRowSearchConfig(item);
            }
            return index !== 0;
        },
        _getLeftMarginPerLevel:function (item) {
            var px = item.level * 100;
            return px+'px';
        },
        _addConfig:function (e) {
            if(this.searchConfig){
                var isRootAddButton = (!e.model || !e.model.item);
                var currentLevel = !isRootAddButton ? (e.model.item.level || 0):null;

                var index = !isRootAddButton?e.model.index + 1 :this.searchConfig.length;
                index = index || 0;

                this.splice('searchConfig', index, 0, {
                    comparison:this.comparisonFunctions.contains,
                    logicalOperator:'AND',
                    level:(currentLevel === null ? -1:currentLevel)+ 1,
                    parentLevel:currentLevel,
                    id:index,
                    parent:isRootAddButton?null:e.model.item.id
                });
                // this.push('searchConfig', )
            }

        },
        _deleteConfig:function (e) {
            var model = e.model;
            this.splice('searchConfig', model.index, 1);
            if(model.item && this.errorItems && this.errorItems[model.item.id]){
                this.errorItems[model.item.id] && delete this.errorItems[model.item.id];
                this.errorText = JSON.stringify(this.errorItems);
            }
        },
        _comparisonChanged:function (e) {
            var model = e.model;
            //All not allowed for these comparisons.
            if(['LessThan', 'GreaterThan'].indexOf(e.detail.value) > -1){
                if(model.item.column === 'ALL') {
                    model.set('item.column', this.columns[1].value);
                }
                model.set('item.showInclusive', true);
            }else{
                model.set('item.showInclusive', false);
            }
            // model.set('item.comparison', e.detail.value);

            var comparisonFunction = this.comparisonFunctions[e.detail.value];
            model.set('item.comparison', comparisonFunction);
        },
        _conditionChanged:function (e) {
            var model = e.model;
            model.set('item.logicalOperator', e.detail.value);
        },
        _selectColumnChanged:function (e) {
            var model = e.model;
            model.set('item.column', e.detail.value);
        },
        _populateColumns:function () {
            this.columns = this.columns || [{name:'ALL', value:'ALL'}];
            if(this.data && this.data.length>0) {
                var cols = Object.keys(this.data[0]);
                for (var i = 0; i < cols.length; i++) {
                    var col = cols[i];
                    if(!this.data[0].hasOwnProperty(col)){
                        continue;
                    }
                    this.columns.push({
                        value: col,
                        name:  this._beautifyName(col)
                    });
                }
            }
        },
        _beautifyName:function(name){
            return name.replace('_',' ').toUpperCase();
        },
        observers: [
            '_dataChanged(data.*)',
            '_searchConfigChanged(searchConfig.*)',
            '_simpleSearchValueChanged(_simpleSearchValue)'
        ],
        _simpleSearchValueChanged:function () {
            this.searchConfig[0].searchValue = this._simpleSearchValue ;
            this._searchConfigChanged();
        },
        _dataChanged:function () {
            //datais Changed :                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  this.data
            this._populateColumns();
        },
        _showError:function(item, index){
            return    this.errorItems[(item.id || 0).toString()];
        },
        validate:function(){
            var toReturn = true;
            this.errors = {};
            for (var i = 0; i < this.searchConfig.length; i++) {
                var item = this.searchConfig[i];
                var err =  item.comparison.validate ? item.comparison.validate(item) : '';
                this.errorItems = this.errorItems || {};
                this.errorItems[item.id || 0] = err;
                this.errorText = JSON.stringify(this.errorItems) +new Date(); // error text refresher. Not used anywhere but to notify polymer that, errors may be changed.
                toReturn = toReturn && !err; // consolidate the validation for all search config rows.
            }
            return toReturn;
        },
        _searchConfigChanged:function() {
            //searchconfig changed
            this.searchString  = JSON.stringify(this.searchConfig);
            this._simpleSearchValue = this._simpleSearchValue||'';
            if(  this.autoSearch &&
                (this.searchMode === 'simple' && (this._simpleSearchValue.length > this.minLength || !this._simpleSearchValue ) || (this.searchMode === 'advance'))){
                this.debounce('doSearch', function () {
                    if(this.validate()) { // validates before emitting the event. All rows validation mandatory.
                        this.fire('search', {data: this});
                    }
                }.bind(this), this.debounceDelay || 0);
            }
        },
        _modeChanged:function () {
            this._switchMode();
        },
        properties: {
            data: {
                type: Array,
                value: [],
                notify: true
            },
            searchMode:{
                type:String,
                value:'simple',
                notify:true,
                observer:'_modeChanged'

            },

            autoSearch:{
                type:Boolean,
                value:true,
                notify:true
            },
            minLength:{
                type:Number,
                value:-1,
                notify:true
            },
            debounceDelay:{
                type:Number,
                value:0,
                notify:true
            }
        },
        behaviors: [
            StrandTraits.Resolvable,
            StrandTraits.ComparisonRulesProvider
        ]
    });
})(window.Strand = window.Strand || {});

