
$(document).ready(function () {
/*
    // Open in new window
    $(".First").click(function () {
        window.open($(this).find("a:first").attr("href"));
        return false;
    });
        
    // Or use this to Open link in same window (similar to target=_blank)
    $(".First").click(function(){
        window.location = $(this).find("a:first").attr("href");
        return false;
    });
	*/

    // Show URL on Mouse Hover
    $(".First").hover(function () {
        window.status = $(this).find("a:first").attr("href");
    }, function () {
        window.status = "";
    });



});
