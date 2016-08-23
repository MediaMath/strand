(function(scope) {
  HTMLImports.whenReady(function () {

    scope.Gallery = Polymer({
      is: "mm-gallery",
      properties: {
        data: {
          type: Array,
          value: []
        },
        selectedImg: {
          type: Object,
          reflectToAttribute: true,
          value: {},
          observer: "_selectionChange"
        }
      },
      behaviors: [
        StrandTraits.Stylable
      ],
      _hasheader: {
        type: Boolean
      },
      _hasfooter: {
        type: Boolean
      },
      _current: {
        type: Number,
        value: 0
      },

      _setData: function(data) {
        this.data = data;
      },
      ready: function() {
        this._current = 0;
        this.selectedImg = this.data[0];
        this._checkHeader();
        this._checkFooter();
      },
      _checkHeader: function() {
        if(undefined != this.selectedImg || null != this.selectedImg)
          this._hasheader = (this.selectedImg.caption_position == 'top'? true:false);
      },
      _checkFooter: function() {
        if(undefined != this.selectedImg || null != this.selectedImg)
          this._hasfooter = (this.selectedImg.caption_position == 'bottom'? true:false);
      },
      _selectionChange: function () {
        this._checkHeader();
        this._checkFooter();
      },
      _checkIfEmpty: function(value) {
        if(undefined != value && null != value)
          return value;
        else return '';
      },
      _handleActiveClass: function(ev) {
        var activeimg = this.$.imgslider.querySelector("img.active");
        if(null != activeimg)
          activeimg.classList.remove("active");
        this.selectedImg = JSON.parse(ev.srcElement.attributes.selectedimg.nodeValue);
        this.toggleClass("active", true, ev.srcElement);
        this.toggleClass("blur", true, activeimg);
      },
      _isOnScreen: function(obj, wrapper, direction) {
        if(direction === 'right') {
          var viewportArea = wrapper.getBoundingClientRect();
          var eltBound = obj.getBoundingClientRect();
          return (eltBound.right < viewportArea.right ? true : false);
        }
        if(direction === 'left') {
          var eltScroll = window.screenTop;
          var visibleArea = window.screenTop + window.innerHeight;
          var objPos = (obj.offsetTop + obj.innerHeight);
          return(visibleArea >= objPos && eltScroll <= objPos ? true : false);
        }
      },
      _slideLeft: function(ev) {
        var imgSlider = this.$.imgslider;
        var isOnscreen = (this._isOnScreen(imgSlider.firstChild.nextElementSibling, this.$.sliderpanel, 'left'));
        if(this._current == 0 || isOnscreen) {
          ev.preventDefault();
        } else {
          var imgDiv = this.$.imglinks;
          if(undefined != imgDiv) {
            var lastImg = Polymer.dom(imgSlider).querySelector('img:nth-child('+this._current+')');
            if(undefined != lastImg) {
              lastImg.classList.remove('slide_right');
              lastImg.classList.add('slide_left');
              this._current--;
            }
          }
        }
      },
      _slideRight: function(ev) {
        var imgSlider = this.$.imgslider;
        var isOnScreen = (this._isOnScreen(Polymer.dom(imgSlider).querySelector('img:nth-child('+this.data.length+')'), this.$.sliderpanel, 'right'));
        if(isOnScreen || (this._current >= this.data.length - 1)) {
          ev.preventDefault();
        } else {
          var imgDiv = this.$.imglinks;
          if (undefined != imgDiv) {
            var firstImg = Polymer.dom(imgSlider).querySelector('img:not(.slide_right)');
            if (undefined != firstImg) {
              firstImg.classList.add('slide_right');
              this._current++;
            }
          }
        }
      },
      _updateClass: function(index) {
        var o = {};
        if(index == 0)
          o.active = true;
        else
          o.blur = true;
        return this.classBlock(o);
      }
    });
  });
})(window.Strand = window.Strand || {});