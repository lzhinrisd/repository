(function($){
	$(window).load(function(){
		
		// .scrollTo - Plugin
		$.fn.scrollTo = function( target, options, callback ){
		  if(typeof options == 'function' && arguments.length == 2){ callback = options; options = target; }
		  var settings = $.extend({
			scrollTarget  : target,
			offsetTop     : 50,
			duration      : 500,
			easing        : 'swing'
		  }, options);
		  return this.each(function(){
			var scrollPane = $(this);
			var scrollTarget = (typeof settings.scrollTarget == "number") ? settings.scrollTarget : $(settings.scrollTarget);
			var scrollY = (typeof scrollTarget == "number") ? scrollTarget : scrollTarget.offset().top + scrollPane.scrollTop() - settings.offsetTop;
			scrollPane.animate({scrollTop : scrollY }, settings.duration, settings.easing, function(){
			  if (typeof callback == 'function') { callback.call(this); }
			});
		  });
		}
		
		
		$('header.mobile').click(function() {
			$(body).scrollTo('.exhibition .content',{duration:500, offsetTop : 0});
		});
		
		var scroll_time = 1500;
		var old_scroll_top = [false, false, false];
		
		function activateLink (timeout, link_num) {
			setTimeout(function(){ 
				$('a').removeClass('not_active');
				$('a[data-link-num='+link_num+']').addClass('active');
			}, timeout);
			
		}
		
		
		$('section').hover(function() {
			$('section').removeClass('hover');
			$(this).addClass('hover');
			var link_num = $(this).attr('data-col-num');
			old_scroll_top[link_num] = false;
		})
		
		$('header li').hover(function() {
			$('section').removeClass('hover');
			var link_num = $(this).find('a').attr('data-link-num');
			$('section[data-col-num='+link_num+']').addClass('hover');
		})
		
		// Manual scrolling
		$("section").mCustomScrollbar({
			scrollInertia: 0,
			scrollbarPosition: "outside",
			callbacks:{			
				whileScrolling:function(){ 
					var link_num = $(this).attr('data-col-num');
					if (!$(this).hasClass('hover')) {
						$('section').removeClass('hover');
						$(this).addClass('hover');
					}
					var current_scroll_top = this.mcs.top;
					if (old_scroll_top[link_num]) {
						var scroll_delta = current_scroll_top - old_scroll_top[link_num];
					} else {
						var scroll_delta = 0;
					}
					$.each($('section'), function( index, value ) {
						if (!$(this).hasClass('hover')) {
							var current_link_num = $(this).attr('data-col-num');
							$('a[data-link-num='+current_link_num+']').removeClass('active');
							current_section_top_value = $(this).find( '.mCSB_container').css('top').replace("px", "");
							if(current_section_top_value<0) {
								final_value = current_section_top_value-scroll_delta;
								$(this).find( '.mCSB_container').css("top",final_value);
							}
							if(current_section_top_value-$(window).height()<-$(this).find( '.mCSB_container').height()) {
								var max_scroll_value = -($(this).find( '.mCSB_container').height()-$(window).height());
								$(this).find( '.mCSB_container').css("top",max_scroll_value);
							}
							if(current_section_top_value>0) {
								$(this).find( '.mCSB_container').css("top",0);
							}
						}
					});	
					// set active link
					
					if (-current_scroll_top+$(this).find( '.content').outerHeight()>= $(this).find( '.mCSB_container').height()) {
						$('a[data-link-num='+link_num+']').addClass('active');
					} else {
						$('a[data-link-num='+link_num+']').removeClass('active');
					}
					old_scroll_top[link_num] = current_scroll_top;
				},
			}
		});
		
		// Link
		$('header a').click(function(event) {
			event.preventDefault();
			if (!$(this).hasClass('not_active') && !$(this).hasClass('active')) {
				$('a').removeClass('active');
				var link_value = $(this).attr('href').replace("#", "");
				
				var link_num = $(this).attr('data-link-num');
				$.each($('section'), function( index, value ) {
					var current_link_num = $(this).attr('data-col-num');
					if (current_link_num!=link_num) {
						$(this).find( '.mCSB_container, .mCSB_dragger').animate({
							top: 0
						  }, scroll_time);
					}
				});
				
				$('header a').addClass('not_active');
				$('.yesyesyes').addClass('not_active');
				activateLink(scroll_time, link_num);
				$('.'+link_value).mCustomScrollbar("scrollTo","."+link_value+" .content",{
					scrollInertia:scroll_time
				});
			}
		});	
		
		$('.yesyesyes').click(function(event) {
			event.preventDefault();
			if (!$(this).hasClass('not_active') && !$(this).hasClass('active')) {
				$('a').removeClass('active');
				activateLink(scroll_time, 0);
				$('section').mCustomScrollbar("scrollTo",0,{
					scrollInertia:scroll_time
				});
			}
		});	
		
		$('.yesyesyes_mobile').click(function(event) {
			event.preventDefault();
			$(body).scrollTo(0, scroll_time);
		});
	});
})(jQuery);