$(function(){
	
		$('.menu-item').on('click', function(){
		var rel = parseInt($(this).attr('rel'));
		togglePanel(rel);
		
	});

	function togglePanel(eq){
		// find active panel and remove active class
		// find eq panel and add active class 
		$('.page.active').removeClass('active');
		$('.pageContainer .page').eq(eq).addClass('active');
	}

});
