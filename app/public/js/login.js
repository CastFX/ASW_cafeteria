// jQuery & Velocity.js
$(function(){
	$(document).ready(function() {
	  $("#login").velocity("transition.slideUpIn", 1000)
	});

	$(document).ready(function() {
	  $(".row").delay(500).velocity("transition.slideLeftIn", {stagger: 500})    
	});
	
	function shake() {
	  $(".password-row").velocity("callout.shake");
	}

	$("button").on("click", function () {
	  shake();
	});

	$(".tab-2").on("click", function () {
	  $(".sign-in-htm").hide();
	  $(".sign-up-htm").show();
	  $(".tab-2").css('border-color', '#1161ee');
	  $(".tab-1").css('border-color', 'transparent');
	});

	$(".tab-1").on("click", function () {
	  $(".sign-in-htm").show();
	  $(".sign-up-htm").hide();
	  $(".tab-1").css('border-color', '#1161ee');
	  $(".tab-2").css('border-color', 'transparent');
	});

});