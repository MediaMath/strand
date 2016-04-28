(function (scope) {
    "use strict";
    scope.pagination = Polymer({
        is: 'strand-pagination',
        echo_class: function (item, page, className) {
            return item === (page + 1) ? className : '';
        },
        ready: function () {
            this.populatePageNumbers();
            this._populateAllpageNumbers();
            this.addEventListener('datachanged', this._dataChanged.bind(this));
        },
        _populateAllpageNumbers: function () {
            var lastPageNum = this.getLastPageNumber();
            var allPages = [];
            for (var i = 0; i <= lastPageNum; i++) {
                allPages[i] = i + 1;
            }
            this.allPages = allPages;
        },
        pageNumberChange: function (evt) {
            this.goto(evt.detail.value - 1);
        },
        pageNumberTap: function (evt) {
            this.goto(evt.model.item - 1);
        },
        observers: [
        ],
        _dataChanged:function (info) {
            var data = info.value;
            if(!data && info.detail && info.detail.data){
                data = info.detail.data;
            }

            var datalength = data?data.length:1;
            this.totalRows = datalength - 1;
            this.page = 0;
            this._pageChanged(0);
            this._populateAllpageNumbers();
        },
        _pageChanged: function (page) {
            this.populatePageNumbers();
            var child = this.querySelector('strand-data-provider');
            child && (child.page = page);
            this.fire('pagechanged', { name: 'pagechanged', page: this.page });
        },
        populatePageNumbers: function () {
            var list = [];
            var offset = 5;
            var currentPage = this.page;
            var lastPageNum = +this.getLastPageNumber();
            var leftNumber = +currentPage;
            var offset_l = lastPageNum - currentPage < offset ? (offset + (offset - (lastPageNum - currentPage))) : offset;
            for (var i = 0; i < +offset_l; i++) {
                list.push(leftNumber + 1);
                leftNumber = leftNumber - 1;
                if (leftNumber < 0) {
                    break;
                }
            }
            var offset_r = currentPage < offset ? offset + (offset - currentPage - 1) : offset;
            var rightNumber = this.page;
            for (var j = 0; j < +offset_r; j++) {
                rightNumber = +rightNumber + 1;
                if (rightNumber > lastPageNum) {
                    break;
                }
                list.push(+rightNumber + 1);
            }
            this.pages = list.sort(function (a, b) {
                return a - b;
            });
        },
        properties: {
            pages: {
                type: Number,
                value: [],
                notify: true,
                reflectToAttribute: true
            },
            data: {
                type: Array,
                value: [],
                notify: true
            }
        },
        behaviors: [
            StrandTraits.PageableExtended,
            StrandTraits.Resolvable
        ]
    });
})(window.Strand = window.Strand || {});