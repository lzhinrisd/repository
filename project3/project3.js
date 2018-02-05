(function() {
  (function($, window, document, undefined_) {
    var Panelize;
    Panelize = {
      init: function(elements, options) {
        var count, lastPosition, self;
        self = this;
  
        self.options = $.extend({}, $.fn.panelize.options, options);
        self.outerContainer = elements;
        self.panels = elements.children();
        if (self.options.containerSelector !== null) {
          self.innerContainers = elements.find(self.options.containerSelector);
        } else {
          self.innerContainers = self.panels.children();
          self.options.containerSelector = self.innerContainers.first().prop('tagName');
        }

        count = self.options.startZ;
        self.panels.each(function() {
          $(this).css('z-index', count);
          count -= self.options.zStep;
        });

        self.resize();
        self.panels.css({
          'padding-bottom': $(window).height(),
          'position': 'fixed',
          'left': 0,
          'top': 0
        }).addClass('static');
        self.panels.first().css('position', 'relative').removeClass('static').addClass('scroll');
        self.panels.last().css('padding-bottom', 0);
        lastPosition = 0;
        $(window).on('scroll', function() {
          var $element, position, scroll, staticPanels;
          position = $(this).scrollTop();

          $element = $('.scroll').last().find(self.options.containerSelector);
          if (position > lastPosition) {
            // down
            if (($element.offset().top + $element.outerHeight()) <= position) {
              staticPanels = $('.static');
              $('.scroll').last().css('padding-bottom', 0);
              if (staticPanels.length === 1) {
                $('.static').first().addClass('scroll').removeClass('static').css({
                  'position': 'relative',
                  'padding-bottom': 0
                });
              } else {
                staticPanels.first().addClass('scroll').removeClass('static').css({
                  'position': 'relative'
                });
              }
            }
          } else {
            //up
            if ($element.offset().top > position) {
              scroll = $('.scroll');
              if (scroll.length > 1) {
                scroll.last().addClass('static').removeClass('scroll').css('padding-bottom', $(window).height());
                $('.static').first().css('position', 'fixed');
              }
            }
          }
          lastPosition = position;
        });
        $(window).resize(function() {
          var resizeDelay;
          clearTimeout(resizeDelay);
          resizeDelay = setTimeout(self.resize(), self.options.resizeDelay);
        });
        return self.outerContainer;
      },
      slide: function(id) {
        var curPos, dest, self, time;
        self = this;
        curPos = $(window).scrollTop();
        dest = self.locations[id];
        time = (Math.abs(curPos - dest) / self.options.speed) * 1000;
        $('html,body').animate({
          scrollTop: dest
        }, time);
        return self.outerContainer;
      },
      resize: function() {
        var self;
        self = this;
        self.setHeights();
        setTimeout((function() {
          return self.setOffsets();
        }), 100);
        return self.outerContainer;
      },
      setHeights: function() {
        var self;
        self = this;

        self.innerContainers.css('min-height', $(window).height());
        self.outerContainer.css('min-height', self.getOuterHeight());
        return self.outerContainer;
      },
      setOffsets: function() {
        var self, startingPos;
        self = this;

        self.locations = {};
        startingPos = 0;
        self.panels.each(function() {
          var height;
          height = $(this).find(self.options.containerSelector).outerHeight();
          startingPos += height;
          self.locations['#' + $(this).attr('id')] = startingPos - height;
        });
        return self.outerContainer;
      },
      getOuterHeight: function() {
        var height, self;
        self = this;
        height = 0;
        self.innerContainers.each(function() {
          height += $(this).outerHeight();
        });
        return height;
      }
    };
    $.fn.panelize = function() {
      if ($.fn.panelize.instance == null) {
        $.fn.panelize.instance = Object.create(Panelize);
      }
      if (typeof arguments[0] === 'object' || arguments[0] === void 0) {
        return $.fn.panelize.instance.init(this, arguments[0]);
      } else if (arguments[0] === 'resize') {
        return $.fn.panelize.instance.resize();
      } else if (arguments[0] === 'slide' && (arguments[1] != null)) {
        return $.fn.panelize.instance.slide(arguments[1]);
      } else {
        return $.error('Method ' + method + ' does not exists on jQuery.panelize');
      }
    };
    return $.fn.panelize.options = {
      containerSelector: null,
      speed: 1000,
      startZ: 1000,
      zStep: 50,
      resizeDelay: 300
    };
  })(jQuery, window, document);

  $(document).ready(function() {
    var $nav, $panels;
    $panels = $('.panelize').panelize({
      containerSelector: 'article',
      speed: 2000,
      startZ: 1000,
      zStep: 50
    });
    $nav = $('#header a');
    return $nav.click(function(e) {
      e.preventDefault();
      $nav.removeClass('active');
      $(this).addClass('active');
      return $panels.panelize('slide', $(this).attr('href'));
    });
  });

}).call(this);



$( document ).ready(function() {

    scaleVideoContainer();

    initBannerVideoSize('.video-container .poster img');
    initBannerVideoSize('.video-container .filter');
    initBannerVideoSize('.video-container video');

    $(window).on('resize', function() {
        scaleVideoContainer();
        scaleBannerVideoSize('.video-container .poster img');
        scaleBannerVideoSize('.video-container .filter');
        scaleBannerVideoSize('.video-container video');
    });

});

function scaleVideoContainer() {

    var height = $(window).height() + 5;
    var unitHeight = parseInt(height) + 'px';
    $('.homepage-hero-module').css('height',unitHeight);

}

function initBannerVideoSize(element){

    $(element).each(function(){
        $(this).data('height', $(this).height());
        $(this).data('width', $(this).width());
    });

    scaleBannerVideoSize(element);

}

function scaleBannerVideoSize(element){

    var windowWidth = $(window).width(),
    windowHeight = $(window).height() + 5,
    videoWidth,
    videoHeight;


    $(element).each(function(){
        var videoAspectRatio = $(this).data('height')/$(this).data('width');

        $(this).width(windowWidth);

        if(windowWidth < 1000){
            videoHeight = windowHeight;
            videoWidth = videoHeight / videoAspectRatio;
            $(this).css({'margin-top' : 0, 'margin-left' : -(videoWidth - windowWidth) / 2 + 'px'});

            $(this).width(videoWidth).height(videoHeight);
        }

        $('.homepage-hero-module .video-container video').addClass('fadeIn animated');

    });
}
