

/* -------------------------------------------------------------------------------------- VARIABLES --- */
var page_path;
var request_url;

var page = [];
var page_default;

var block_space = 0;
var block = [];
var block_total = 0;
var block_first = [];
var block_first_total = 0;
var block_last = [];
var block_last_total = 0;


var month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];



var recall_state = false;

var media_video = false;




var view_data;

var view_ready = true;
var data_ready = false;



/* --------------------------------------------------------------------------------- INITIALISATION --- */


// INIT
function init() {
	"use strict";

	search_init();

	// capabilities
	Modernizr.on('videoautoplay', function(result) {
		if (result) {
			media_video = true;
		} else {
			media_video = false;
		}
	});

	// system
	var this_path = page_path + "/api/system";
	var this_request = $.ajax(this_path, {dataType: "json"});
	this_request.done(function(data) {

		// var
		var this_page;
		var this_container;
		var this_link;
		var this_index;

		// page
		page_default = data.default;
		$("meta[name=description]").attr("content", page_default.description);
		$("meta[property='og:description']").attr("content", page_default.description);
		$("meta[name='twitter:description']").attr("content", page_default.description);
		$("meta[name=keywords]").attr("content", page_default.keywords);
		$("meta[property='og:title']").attr("content", page_default.share_title);
		$("meta[name='twitter:title']").attr("content", page_default.share_title);
		$("meta[property='og:image']").attr("content", page_default.share_image);
		$("meta[name='twitter:image']").attr("content", page_default.share_image);
		if (page_default.title !== null) {
			$("title").text("APA - " + page_default.title);
		} else {
			$("title").text("APA");
		}

		// add social icons
		if (data.default.social_facebook !== null) {
			$('<a></a>')
				.addClass('facebook')
				.attr('href', data.default.social_facebook)
				.attr('target', '_blank')
				.appendTo($('footer'));
		}
		if (data.default.social_twitter !== null) {
			$('<a></a>')
				.addClass('twitter')
				.attr('href', data.default.social_twitter)
				.attr('target', '_blank')
				.appendTo($('footer'));
		}
		if (data.default.social_instagram !== null) {
			$('<a></a>')
				.addClass('instagram')
				.attr('href', data.default.social_instagram)
				.attr('target', '_blank')
				.appendTo($('footer'));
		}

		// system
		$.each( data.system, function() {
			this_page = {};
			this_page.type = "list";
			this_page.url = this.url;
			if (this.id === 1) {
				this_page.view = "index";
			} else {
				switch(this.id) {
					case 2:
						this_page.view = "work";
						break;
					case 3:
						this_page.view = "journal";
						break;
					case 4:
						this_page.view = "search";
						break;
					case 5:
						this_page.view = "contact";
						this_page.type = "page";
						break;
				}
				if (this.display === 1) {
					this_link =  $("<a>" + this.name + "</a>")
						.attr("href", page_path + '/' + this_page.url)
						.attr("id", "nav_" + this.id)
						.appendTo("nav");
				}
			}
			page.push(this_page);
		});

		// category
		$.each(data.category, function() {
			this_page = {};
			this_page.type = "list";
			this_page.category = this.id;
			this_page.url = this.url;
			this_page.view = "work";
			page.push(this_page);
			if (this.display === 1) {
				if (this_container === undefined) {
					this_container =  $("<div></div>")
						.addClass("option")
						.attr("id", "nav_work")
						.insertAfter("nav a:first-child");
				}
				this_link =  $("<a>" + this.title + "</a>")
					.attr("href", page_path + '/' + this_page.url)
					.attr("id", "category_" + this_page.category)
					.appendTo(this_container);
			}
		});

		// practice
		if ((data.practice.default !== null) || (data.practice.page.length > 0)) {
			this_link =  $("<a>Practice</a>");
			if (data.practice.default !== null) {
				this_link.attr("href", page_path + '/' + data.practice.default.url);
			} else {
				this_link.attr("href", page_path + '/' + data.practice.page[0].url);
			}
			this_link.insertBefore("nav > a:nth-of-type(2)");
		}
		if (data.practice.page.length > 0) {
			this_container =  $("<div></div>")
				.addClass("option")
				.attr("id", "nav_practice")
				.insertAfter(this_link);

			$.each(data.practice.page, function() {
				var this_page = {};
				this_page.type = "page";
				this_page.url = this.url;
				this_page.view = "practice";
				page.push(this_page);
				this_link =  $("<a>" + this.name + "</a>")
					.attr("href", page_path + '/' + this_page.url)
					.appendTo(this_container);
			});
		}

		// block
		block_space = data.block_space;
		block = data.block_all;
		for (this_index = 0; this_index < block.length; this_index++) {
			block_total = block_total + block[this_index].weighting;
			if (block[this_index].initial === 1) {
				block_first.push(block[this_index]);
				block_first_total = block_first_total + block[this_index].weighting;
			}
			if (block[this_index].space === 3) {
				block_last.push(block[this_index]);
				block_last_total = block_last_total + block[this_index].weighting;
			}
		}

		// open
		request(request_url);
		view_ready = true;

	});
	this_request.fail(/* ERROR */);

	// nav
	$('header .nav').on('click', function() {
		$('body').removeClass('search').toggleClass('nav');
	});
	$('header .search').on('click', function() {
		$('body').removeClass('nav').toggleClass('search');
		if($('body').hasClass('search')) {
			//$("body").scrollTop(0);
			$('form input').focus();
		}
	});
	$(document).on("click", "a", function(event) {
		event.preventDefault();
		$(this).addClass("select");
		if (typeof $(this).attr("href") === 'undefined') {
			return;
		} else if ($(this).attr("href") === '.') {
			window.location.href = page_path;
			return;
		} else if ($(this).attr("target") === '_blank') {
			window.open($(this).attr("href"), '_blank');
			return;
		} else if ($(this).attr("href").indexOf('mailto') == 0) {
			window.location.href = $(this).attr("href");
			return;
		} else if ($(this).attr("href").indexOf('tel') == 0) {
			window.open($(this).attr("href"), '_top');
			return;
		}
		$('body').removeClass('nav');
		request($(this).attr("href").replace(page_path, ''));
	});



	$(window).on('popstate',function(event) {
		if (event.state !== null) {
			recall_state = true;
		}

		if (window.history.state !== null) {
			if (recall_state === true) {
				request(window.history.state.url.replace(page_path, ''));
			}
		} else {
			window.history.back(-1);
		}
	});

}
$(document).ready(init);




function request(url){
	"use strict";
	//console.log("REQUEST " + url);

	// THIS FIXES IT
	if (url.indexOf('/') === 0) {
		url = url.replace('/', '');
	}


	var this_path;
	var this_request;
	var this_data = {};

	// view
	view_ready = false;
	data_ready = false;
	$("main").on("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", function(){
		$("main").off();
		view_ready = true;
		view();
	});
	$("body").addClass('load');

	// index
	if (url === "") {
		this_data.type = "list";
		this_data.view = "index";
		this_path = page_path + "/api/page/1";
		this_request = $.ajax(this_path, {dataType: "json"});
		this_request.done(function(data) {
			this_data.page = data.page;
			this_path = page_path + "/api/search/feature";
			this_request = $.ajax(this_path, {dataType: "json"});
			this_request.done(function(data) {
				this_data.content = data.result;
				build(this_data);
			});
			this_request.fail(error);
		});
		this_request.fail(error);

	// search
	} else if (url.split("/")[0] === page[3].url) {
		var this_argument = url.split("/")[1];
		this_data.type = "list";
		this_data.view = "search";
		this_path = page_path + "/api/page/4";
		this_request = $.ajax(this_path, {dataType: "json"});
		this_request.done(function(data) {
			this_data.page = data.page;
			this_data.page.url = url;
			this_path = page_path + "/api/search/query/" + this_argument;
			this_request = $.ajax(this_path, {dataType: "json"});
			this_request.done(function(data) {
				if (data.result.length > 0) {
					this_data.content = data.result;
				} else {
					this_data.content = null;
				}
				build(this_data);
			});
			this_request.fail(error);
		});
		this_request.fail(error);

	// other
	} else {
		var this_page = $.grep(page, function(item){ return item.url === url; })[0];
		if (typeof(this_page) !== 'undefined') {
			this_data.type = this_page.type;
			this_data.view = this_page.view;

			// list
			if (this_data.type === "list") {
				if (this_data.view === "work") {
					this_path = page_path + "/api/page/" + page[1].url;
				} else {
					this_path = page_path + "/api/page/" + page[2].url;
				}
				this_request = $.ajax(this_path, {dataType: "json"});
				this_request.done(function(data) {
					this_data.page = data.page;
					if (this_data.view === "work") {
						if (typeof(this_page.category) !== "undefined") {
							this_path = page_path + "/api/search/category/" + this_page.category;
							this_data.page.url = url;
						} else {
							this_path = page_path + "/api/search/work";
						}
					} else if (this_data.view === "journal") {
						this_path = page_path + "/api/search/journal";
					}
					this_request = $.ajax(this_path, {dataType: "json"});
					this_request.done(function(data) {
						this_data.content = data.result;
						build(this_data);
					});
					this_request.fail(error);
				});
				this_request.fail(error);

			// page
			} else {
				this_path = page_path + "/api/page/" + url;
				this_request = $.ajax(this_path, {dataType: "json"});
				this_request.done(function(data) {
					this_data.page = data.page;
					if ((typeof(data.item) !== "undefined") && (data.item.length > 0)) {
						this_data.item = data.item;
					}
					if (typeof(data.static) !== "undefined") {
						this_data.static = data.static;
					}
					build(this_data);
				});
				this_request.fail(error);
			}

		} else {
			this_path = page_path + "/api/page/" + url;
			this_request = $.ajax(this_path, {dataType: "json"});
			this_request.done(function(data) {

				// page
				if (data !== null) {
					this_data.page = data.page;
					if (typeof(data.work) !== "undefined") {
						this_data.type = "page";
						this_data.view = "work";
						this_data.work = data.work;
					} else if (typeof(data.journal) !== "undefined") {
						this_data.type = "page";
						this_data.view = "journal";
						this_data.journal = data.journal;
					}
					if ((typeof(data.related) !== "undefined") && (data.related.length > 0)) {
						this_data.related = data.related;
					}
					if ((typeof(data.item) !== "undefined") && (data.item.length > 0)) {
						this_data.item = data.item;
					}
					build(this_data);

				// 404
				} else {

					console.log('404 NEW');
					error(404);

				}

			});
		}
	}

}


function error(code){
	"use strict";

	$("body").attr("class", "")
		.addClass("type_error")
		.addClass("view_error")
		.scrollTop(0);

	var this_html = $("<div/>")
		.addClass("error ");

	if (code === 404) {
		console.log("ERROR 404");
		this_html.text("Page not found");
	} else {
		console.log("ERROR 500");
		this_html.text("Unexpected error");
	}
	this_html.appendTo("main");

	return false;
}





function build(data){
	"use strict";
	var this_main = $("<div />");
	var this_index;
	var this_item;
	var this_date;

	// list
	if (data.type === "list") {
		if ((typeof(data.content) !== "undefined") && (data.content !== null)) {
			if (data.content.length > 0) {
				data.item = [];
				var this_array = [];
				if ((data.view === "index") || (data.view === "search")) {
					this_array = build_split(data.content);
				} else {
					this_array.push(data.content);
				}
				for (this_index = 0; this_index < this_array.length; this_index++) {
					if (this_array[this_index][0].type === "work") {
						this_item = build_item(this_array[this_index]);
						for (var this_work = 0; this_work < this_item.length; this_work++) {
							if (this_item[this_work].content.length > 0) {
								data.item.push(this_item[this_work]);
							}
						}
					} else {
						this_item = this_array[this_index];
						for (var this_journal = 0; this_journal < this_item.length; this_journal++) {
							data.item.push(this_item[this_journal]);
						}
					}
				}
			}
		} else {
			if (data.view === "search") {

				$('<div />')
					.addClass('error')
					.text('No search results found')
					.appendTo(this_main);
			}
		}
	}

	// item
	if (typeof(data.item) !== "undefined") {
		for (this_index = 0; this_index < data.item.length; this_index++) {
			this_item = data.item[this_index];
			if (typeof(this_item.block) !== "undefined") {
				build_content(this_item).appendTo(this_main);
			} else if (typeof(this_item.type) !== "undefined") {
				build_journal(this_item).appendTo(this_main);
			} else if (typeof(this_item["text"]) !== "undefined") {
				var this_html = this_item["text"].replace(/(?:\r\n|\r|\n)/g, '<br />');
				$("<div></div>")
					.addClass("text")
					.html(this_html)
					.appendTo(this_main);
			}
		}
	}

	// work
	if (typeof(data.work) !== "undefined") {

		// aside
		if ((typeof(data.work.client) !== "undefined") || (typeof(data.work.location) !== "undefined") || (typeof(data.work.size) !== "undefined")) {
			var this_aside = $("<aside />");
			if ((typeof(data.work.client) !== "undefined") && (data.work.client !== null)) {
				$("<div></div>")
					.addClass("property")
					.attr("data-property", "client")
					.text(data.work.client)
					.appendTo(this_aside);
			}
			if ((typeof(data.work.location) !== "undefined") && (data.work.location !== null)) {
				$("<div></div>")
					.addClass("property")
					.attr("data-property", "location")
					.text(data.work.location)
					.appendTo(this_aside);
			}
			if ((typeof(data.work.size) !== "undefined") && (data.work.size !== null)) {
				$("<div></div>")
					.addClass("property")
					.attr("data-property", "size")
					.text(data.work.size)
					.appendTo(this_aside);
			}
			data.html_aside = this_aside.html();
		}

		// credit
		if (typeof(data.work.credit) !== "undefined") {
			for (this_index = 0; this_index < data.work.credit.length; this_index++) {
				$("<div />")
					.addClass("property")
					.attr("data-property", data.work.credit[this_index].role)
					.text(data.work.credit[this_index].name)
					.appendTo(this_main);
			}
		}

	}

	// journal
	if (typeof(data.journal) !== "undefined") {
		if (typeof(data.journal.heading) !== "undefined") {
			$("<div />")
				.addClass("heading")
				.text(data.journal.heading)
				.prependTo(this_main);
		}
		if (typeof(data.journal.time) !== "undefined") {
			this_date = new Date(data.journal.time.split(" ")[0]);
			$("<div />")
				.addClass("property")
				.attr("data-property", "date")
				.text( month[this_date.getMonth()] + " " + this_date.getFullYear() )
				.appendTo(this_main);
		}
		if (typeof(data.journal.user) !== "undefined") {
			$("<div />")
				.addClass("property")
				.attr("data-property", "author")
				.text(data.journal.user)
				.appendTo(this_main);
		}
	}

	// static
	if (typeof(data.static) !== "undefined") {
		build_static(data.static).appendTo(this_main);
	}

	// related
	if (typeof(data.related) !== "undefined") {
		var this_related = $("<section />");
		for (this_index = 0; this_index < data.related.length; this_index++) {
			var this_data = data.related[this_index];
			var this_content = $("<a></a>")
				.addClass("content")
				.addClass(this_data.type)
				.attr("href", page_path + "/" + this_data.url);

			// media
			var this_media = $("<div></div>")
				.addClass("media")
				.attr("data-image", this_data.media.src.image_1);
			if (this_data.media.size === "contain") {
				this_media.addClass("contain");
			} else {
				this_media.addClass("cover");
			}
			this_media.appendTo(this_content);
			var this_image = $("<div></div>")
				.addClass("image")
				.css("background-image", "url(" + this_data.media.src.image_1_blur + ")");
			if ((media_video === true) && (this_data.media.type === "video")) {
				this_media.attr("data-video", this_data.media.src.video);
			}
			this_image.appendTo(this_media);

			// title
			$("<div></div>")
				.addClass("title")
				.text(this_data.name)
				.appendTo(this_content);

			// info
			var this_info = $("<div></div>")
				.addClass("info");
			if (typeof(this_data.category) !== "undefined") {
				$("<div />")
					.addClass("property")
					.attr("data-property", "type")
					.text(this_data.category)
					.appendTo(this_info);
			}
			if ((typeof(this_data.time) !== "undefined") && (this_data.time !== null)) {
				this_date = new Date(this_data.time.split(" ")[0]);
				var this_text;
				if (this_data.type === "work") {
					this_text = this_date.getFullYear();
				} else {
					this_text = month[this_date.getMonth()] + " " + this_date.getFullYear();
				}
				$("<div />")
					.addClass("property")
					.attr("data-property", "date")
					.text(this_text)
					.appendTo(this_info);
			}
			if (typeof(this_data.user) !== "undefined") {
				$("<div />")
					.addClass("property")
					.attr("data-property", "author")
					.text(this_data.user)
					.appendTo(this_info);
			}
			this_info.appendTo(this_content);

			this_content.appendTo(this_related);
		}

		data.html_related = this_related.html();
	}

	data.html_main = this_main.html();
	view_data = data;
	data_ready = true;
	view();
}

function build_split(data) {
	"use strict";
	var this_type;
	var this_array = [];
	var this_group;
	for (var this_index = 0; this_index < data.length; this_index++) {
		if (data[this_index].type !== this_type) {
			this_group = [];
			this_array.push(this_group);
			this_type =	data[this_index].type;
		}
		this_group.push(data[this_index]);
	}
	return(this_array);
}

// BUILD item
function build_item(data) {
	"use strict";
	var this_input = data;
	var this_length = this_input.length;
	var this_space = Math.round(this_length * block_space);
	var this_index;
	for (this_index = 0; this_index < this_space; this_index++) {
		var this_target = Math.ceil(this_length * Math.random());
		this_input.splice(this_target, 0, null);
		this_length++;
	}
	var this_item = [];
	var this_count = 0;
	var this_block;
	var previous_block;
	do {
		if (this_count === 0) {
			this_block = build_block("first");
		} else if (this_count >= (this_length - 3)) {
			this_block = build_block("last");
		} else {
			this_block = build_block();
		}
		var this_object = {
			block: this_block.id,
			content: []
		};
		if ((this_object.block === 1) && (this_object.block === previous_block))  { this_object.block = 2; }
		if ((this_object.block === 2) && (this_object.block === previous_block))  { this_object.block = 1; }
		if ((this_object.block === 4) && (this_object.block === previous_block))  {
			this_block = build_block("first");
			this_object.block = this_block.id;
		}
		previous_block = this_object.block;
		for (var this_position = 0; this_position < this_block.space; this_position++) {
			var this_content = this_input[this_count];
			if ((this_content !== null) && (typeof(this_content) !== "undefined")) {
				this_content.position = this_position;
				if (((this_object.block === 1) && (this_position === 0)) || ((this_object.block === 2) && (this_position === 2))) {
					this_content.large = true;
				}
				this_object.content.push(this_content);
			}
			this_count++;
		}
		if (this_object.content.length > 0) {
			if ((this_object.block === 1) || (this_object.block === 2)) {
				var key_position;
				if (this_object.block === 1)  { key_position = 0; }
				if (this_object.block === 2)  { key_position = 2; }
				var this_key = $.grep(this_object.content, function(content){ return content.position === key_position; });
				if (this_key.length === 0) {
					this_index = 0;
					if (this_object.content.length === 2) {
						this_index = Math.round(Math.random());
					}
					this_object.content[this_index].position = key_position;
					this_object.content[this_index].large = true;
				}
			}
			this_item.push(this_object);
		}
	}
	while (this_count < this_length);
	return this_item;
}
function build_block(type) {
	"use strict";
	var this_array;
	var this_total;
	switch(type) {
		case "first":
			this_array = block_first;
			this_total = block_first_total;
			break;
		case "last":
			this_array = block_last;
			this_total = block_last_total;
			break;
		default:
			this_array = block;
			this_total = block_total;
			break;
	}
	var this_target = this_total * Math.random();
	var this_count = 0;
	var this_block = 0;
	do {
		this_count = this_count + this_array[this_block].weighting;
		if (this_count < this_target) {
			this_block++;
		}
	}
	while (this_count < this_target);
	return this_array[this_block];
}

// BUILD journal
// Builds a journal list item from the data passed to it.
function build_journal(data) {
	"use strict";
	var this_journal = $("<a></a>")
		.addClass("journal")
		.attr("href", page_path + "/" + data.url);
	if (data.media !== null) {
		var this_media = $('<div/>', {
			class : 'media cover',
		});
		this_media.appendTo(this_journal);
		var this_image = $("<div></div>")
			.addClass("image");
		this_media.attr("data-image", data.media.src.image_2);
		this_image.css("background-image", "url(" + data.media.src.image_2_blur + ")");
		if ((media_video === true) && (data.media.type === "video")) {
			this_media.attr("data-video", data.media.src.video);
		}
		this_image.appendTo(this_media);
	}
	var this_info = $("<div></div>")
		.addClass("info")
		.appendTo(this_journal);
	$("<div></div>")
		.addClass("title")
		.text(data.name)
		.appendTo(this_info);
	var this_date = new Date(data.time.split(" ")[0]);
	$("<div></div>")
		.addClass("date")
		.text( month[this_date.getMonth()] + " " + this_date.getFullYear() )
		.appendTo(this_info);
	if (typeof(data.description) === "string") {
		$("<div></div>")
			.addClass("text")
			.html(data.description)
			.appendTo(this_info);
	}
	return this_journal;
}

// BUILD content
function build_content(data) {
	"use strict";
	var this_block = $("<div></div>")
		.addClass("block block_" + data.block);
	for (var this_index = 0; this_index < data.content.length; this_index++) {
		var this_data = data.content[this_index];
		var this_content;
		if (typeof(this_data.type) !== "undefined") {
			this_content = $("<a></a>")
				.addClass("work")
				.attr("href", page_path + "/" + this_data.url);
			$("<div></div>")
				.addClass('title')
				.text(this_data.name)
				.appendTo(this_content);
			if (this_data.location !== null) {
				$("<div></div>")
					.addClass('location')
					.text(this_data.location)
					.appendTo(this_content);
			}
			if  ((typeof(this_data.category) !== "undefined") || (this_data.time !== null)) {
				var this_info = $("<div></div>")
					.addClass("info")
					.appendTo(this_content);
				if  (typeof(this_data.category) !== "undefined") {
					$("<div></div>")
						.addClass("property")
						.attr("data-property", "type")
						.text(this_data.category)
						.appendTo(this_info);
				}
				if (this_data.time !== null) {
					var this_date = new Date(this_data.time.split(" ")[0]);
					$("<div />")
						.addClass("property")
						.attr("data-property", "date")
						.text(this_date.getFullYear())
						.appendTo(this_info);
				}
			}
		} else {
			this_content = $("<div></div>");
		}
		this_content.addClass("content position_" + this_data.position);


		// item text
		if ((typeof(this_data["text"]) !== "undefined") && (this_data["text"] !== null)) {
			var this_html = this_data["text"].replace(/(?:\r\n|\r|\n)/g, '<br />');
			$("<div></div>")
				.addClass("text")
				.html(this_html)
				.appendTo(this_content);
		} else if (this_data.media !== null) {
			var this_media = $("<div></div>")
				.addClass("media");
			if (this_data.media.size === "contain") {
				this_media.addClass("contain");
			} else {
				this_media.addClass("cover");
			}
			this_media.appendTo(this_content);
			var this_image = $("<div></div>")
				.addClass("image");
			if (((data.block) === 1 && (this_data.position === 0)) || ((data.block) === 2 && (this_data.position === 2))) {
				this_media.attr("data-image", this_data.media.src.image_2);
				this_image.css("background-image", "url(" + this_data.media.src.image_2_blur + ")");
			} else {
				this_media.attr("data-image", this_data.media.src.image_1);
				this_image.css("background-image", "url(" + this_data.media.src.image_1_blur + ")");
			}
			if ((media_video === true) && (this_data.media.type === "video")) {
				this_media.attr("data-video", this_data.media.src.video);
			}
			this_image.appendTo(this_media);
		}
		this_content.appendTo(this_block);
	}
	return this_block;
}

// BUILD static
function build_static(data) {
	"use strict";
	var this_static = $("<div />");

	// phone
	if (data.phone !== "") {
		$("<a></a>")
			.addClass("phone")
			.attr("href", "tel:" + data.phone.replace(/\s/g, ''))
			.text(data.phone)
			.appendTo(this_static);
	}

	// email
	if (data.email !== "") {
		$("<a></a>")
			.addClass("email")
			.attr("href", "mailto:" + data.email)
			.text(data.email)
			.appendTo(this_static);
	}

	// address
	var this_address = "";
	if (typeof(data.address_1) !== "undefined" && data.address_1 !== "") {
		this_address += data.address_1;
	}
	if (typeof(data.address_2) !== "undefined" && data.address_2 !== "") {
		if (this_address.length !== 0) { this_address += "<br>"; }
		this_address += data.address_2;
	}
	if (typeof(data.address_3) !== "undefined" && data.address_3 !== "") {
		if (this_address.length !== 0) { this_address += "<br>"; }
		this_address += data.address_3;
	}
	if (typeof(data.address_city) !== "undefined" && data.address_city !== "") {
		if (this_address.length !== 0) { this_address += "<br>"; }
		this_address += data.address_city;
	}
	if (typeof(data.address_postcode) !== "undefined" && data.address_postcode !== "") {
		if (this_address.length !== 0) { this_address += "<br>"; }
		this_address += data.address_postcode;
	}
	if (this_address.length > 0) {
		$("<div />")
			.addClass("address")
			.html(this_address)
			.appendTo(this_static);
	}

	var this_map = $('<div></div>').addClass('map');
	// map
	$('<a></a>')
		.addClass('map_file')
		.attr('href', data.map_file)
		.attr('target', '_blank')
		.text('Download as PDF')
		.appendTo(this_map);

	$('<a></a>')
		.addClass('map_url')
		.attr('href', data.map_url)
		.attr('target', '_blank')
		.text('Find us on Google Maps')
		.appendTo(this_map);

	this_map.appendTo(this_static);

	// message
	if (data.message !== "") {
		var this_message = data.message.replace(/(?:\r\n|\r|\n)/g, '<br />');
		$("<div />")
			.addClass("message text")
			.text(data.message)
			.appendTo(this_static);
	}

    // credit
    var this_credit = $('<div></div>').addClass('credit');

    $('<a></a>')
        .addClass('credit_build')
        .attr('href', 'http://thisismyengine.com')
        .attr('target', '_blank')
        .text('Engine')
        .appendTo(this_credit);

    $('<a></a>')
        .addClass('credit_design')
        .attr('href', 'http://dtpractice.co.uk')
        .attr('target', '_blank')
        .text('DT')
        .appendTo(this_credit);

    this_credit.appendTo(this_static);

	return $(this_static.html());
}




// VIEW
function view(){
	"use strict";
	if ((data_ready === true) && (view_ready === true)) {
		var data = view_data;
		var this_type = data.type;
		var this_view = data.view;
		$("nav a").removeClass("select");
		$("nav a[href='" + page_path + "/" + data.page.url + "']").addClass("select");
		$("nav .option").removeClass("select");
		$("nav > a.select").next(".option").addClass("select");
		$("nav a.select").parent(".option").addClass("select").prev().addClass("select");
		if ((this_type === "page") && (this_view === "work")) {
			$("nav #nav_2").addClass("select");
			if ((typeof(data.work.category) !== 'undefined') && (data.work.category !== null)) {
				if (data.work.category.length > 0) {
					$("nav #nav_work #category_" + data.work.category[0].id).addClass("select");
				}
			}
		}
		if ((this_type === "page") && (this_view === "journal")) {
			$("nav #nav_3").addClass("select");
		}
		$("main").html(data.html_main);
		if (typeof(data.html_aside) !== "undefined") {
			$("aside").html(data.html_aside).addClass('display');
		} else {
			$("aside").removeClass("display");
		}
		if (typeof(data.html_related) !== "undefined") {
			$("section").html(data.html_related).addClass('display');
		} else {
			$("section").removeClass("display");
		}
		data_ready = false;
		view_ready = false;
		$("body").attr("class", "")
			.addClass("type_" + this_type)
			.addClass("view_" + this_view)
			.scrollTop(0);




		var this_page = page_default;
		if (data.page.description !== null) {
			this_page.description = data.page.description;
		}
		if (data.page.keywords !== null) {
			this_page.keywords = data.page.keywords;
		}
		if (data.page.share_image !== null) {
			this_page.share_image = data.page.share_image;
		}
		if (data.page.share_title !== null) {
			this_page.share_title = data.page.share_title;
		}
		if (data.page.title !== null) {
			this_page.title = data.page.title;
		}


		$("meta[name=description]").attr("content", this_page.description);
		$("meta[property='og:description']").attr("content", this_page.description);
		$("meta[name='twitter:description']").attr("content", this_page.description);
		$("meta[name=keywords]").attr("content", this_page.keywords);
		$("meta[property='og:title']").attr("content", this_page.share_title);
		$("meta[name='twitter:title']").attr("content", this_page.share_title);
		$("meta[property='og:image']").attr("content", this_page.share_image);
		$("meta[name='twitter:image']").attr("content", this_page.share_image);
		if (this_page.title !== null) {
			$("title").text("APA - " + this_page.title);
		} else {
			$("title").text("APA");
		}









		if (recall_state === false) {
			history_push(data.page.url);
		} else {
			recall_state = false;
		}




		// TRIGGER GOOGLE ANALYTICS VIEW

		view_media();
	}
}






/* ----------------------------------------------------------------------- PUSH --- */
function history_push(url) {
	if (window.history.state !== null) {
		if (window.history.state.url == page_path + '/' + url) {
			return false;
		}
	}

	history.pushState({
		url : page_path + '/' + url
	}, {}, page_path + '/' + url);
}


function view_media() {
	media_scroll();
	media_resize();
}

/* --------------------------------------------------------------------- SCROLL --- */
function media_scroll() {
	$(document).on('scroll', media_check).trigger('scroll');
}

/* --------------------------------------------------------------------- RESIZE --- */
function media_resize() {
	$(window).on('resize', function() {
		media_check();
	});
}

/* ---------------------------------------------------------------------- CHECK --- */

// view media

function media_check() {
	$('.media').each(function() {
		var $media;

		$media = $(this);

		if (in_viewport($media) && $media.find('div').length <= 1) {
			media_load($media);
		}

	});
}

/* ----------------------------------------------------------------------- LOAD --- */

// request media
function media_load(media) {
	"use strict";

	var this_media = $(media);
	var this_src;
	var this_load;

	if (typeof this_media.attr("data-image") !== "undefined") {
		this_src = this_media.attr("data-image");
		var this_image = $('<div/>', {
			class : 'image load',
			style : 'background-image: url(' + this_src + ');'
		});
		this_image.appendTo(this_media);
		this_load = new Image();
		this_load.onload = function() {
			this_image.removeClass('load');
			if (typeof this_media.attr("data-video") !== "undefined") {
				this_src = this_media.attr("data-video");
				var this_video = $('<div/>', {
					class : 'video load'
				});
				$('<video/>', {
					src : this_src,
					loop : true,
					autoplay : true,
					muted : true
				}).appendTo(this_video);
				this_video.appendTo(this_media);
				this_load = this_video.find("video").get(0);
				this_load.addEventListener('loadeddata', function(event) {
				 	$(event.target).parent('.video').removeClass('load');
				}, false);
				this_load.load();
			}
		};
		this_load.src = this_src;
	}
}


function in_viewport($element) {
	var $win;

	var viewport,
		bounds;

	$win = $(window);

	viewport = {
		top : $win.scrollTop(),
		left : $win.scrollLeft()
	};
	viewport.bottom = (viewport.top + $win.height()) * 2; // double height

	bounds = $element.offset();
	bounds.bottom = bounds.top + $element.outerHeight();

	return (!(viewport.bottom < bounds.top || viewport.top > bounds.bottom));
}




function search_init() {
	search_tag();
	search_submit();
}

/* ------------------------------------------------------------------------ TAG --- */
function search_tag() {
	var tag_count,
		tag_index;

	tag_index = -1;

	$('header form [name="search"]').on('keyup', function(event) {
		var $input,
			$suggestion;

		var this_query,
			key_code;

		// assign variables
		$input = $(this);
		$form = $input.closest('form');
		$suggestion = $form.find('.suggestion');

		key_code = event.keyCode || event.which;

		// reset suggestion
		$suggestion.html('');

		if (key_code === 38 || key_code === 40) {
			var this_tag;

			this_query = $input.attr('data-query');

			// don't do anything if tags is empty
			if (tag_count == 0) return false;

			if (key_code == 38) { // up
				tag_index--;
			} else if (key_code == 40) { // down
				tag_index++;
			}

			if (tag_index == tag_count) tag_index = -1;
			if (tag_index < -1) tag_index = tag_count - 1;

			// clear text selection
			$form.find('.tag a').removeClass('select');

			if (tag_index === -1) {
				this_tag = $input.attr('data-tag');

				this_tag = this_tag.slice(this_query.length, this_tag.length);

				$suggestion.html(this_query);
				$suggestion.append('<span class="completion">' + this_tag + '</span>');

				$input.val(this_query);
			} else {
				var $tag;

				$tag = $form.find('.tag').find('a').eq(tag_index);
				$tag.addClass('select');

				this_tag = $tag.html();

				$input.val(this_tag);
			}
		} else if (key_code !== 13) {
			var $tag;

			$tag = $form.find('.tag');

			// clear tags
			$tag.find('a').remove();

			this_query = $input.val();

			// if query empty go away
			if (this_query == '') return false;

			// save query for later
			$input.attr('data-query', this_query);

			this_path = page_path + '/api/tag/' + this_query;

			// get tag data
			this_request = $.ajax(this_path, {dataType: "json"});
			this_request.done(function(data) {
				$suggestion.html(this_query);

				// prevent tag_index from being outside of range
				tag_index = -1;
				tag_count = 0;
				if (data.tag !== null) {
					tag_count = data.tag.length;
				}

				$.each(data.tag, function(key, this_tag) {
					if (key === 0) {
						var this_autocomplete;

						$input.attr('data-tag', this_tag);

						this_autocomplete = this_tag.slice(this_query.length, this_tag.length);
						$suggestion.append('<span class="completion">' + this_autocomplete + '</span>');
					}
					$tag.append('<a>' + this_tag + '</a>');
				});
			});
		}
	});

	$('.tag').on('click', 'a', function(event) {
		event.preventDefault();

		var $tag,
			$form,
			$input,
			$suggestion;
		var this_query;

		// assign variables
		$tag = $(this);
		$form = $('header form');
		$input = $form.find('[name="search"]');
		$suggestion = $form.find('.suggestion');

		// store tag text
		this_query = $tag.html();

		// reset suggestion box
		$suggestion.html('');

		// set search input value
		$input.val(this_query);
		// force a tag lookup
		$input.trigger('keyup');
		// search
		$form.trigger('submit');
	});
}

/* --------------------------------------------------------------------- SUBMIT --- */
function search_submit() {
	$('header form').on('submit', function(event) {
		event.preventDefault();

		var $form,
			$input;
		var this_query;

		// assign variables
		$form = $(this);
		$input = $form.find('[name="search"]');

		// store search query
		this_query = $input.val();

		// remove helper data-*
		$input.removeAttr('data-query');
		$input.removeAttr('data-tag');

		// perform search
		request('/search/' + this_query);
	});
}
