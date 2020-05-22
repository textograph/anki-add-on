(function() {
    var $doc, dragging, ghost;

    dragging = false;

    ghost = null;

    $doc = $(document);

    $(".slider").on("mousedown", function(e) {
        var offsetX, width;
        e.preventDefault();
        dragging = true;
        width = $(".content").width();
        offsetX = $(".content").offset().left;
        ghost = $("<div/>", {
            class: "ghostSlider",
            css: {
                left: $(".properties").offset().left - offsetX
            }
        }).

        appendTo($(".content"));
        $(".size").text(parseInt($(".properties").width()) + "px").fadeIn("fast");
        $doc.on("mousemove", function(ev) {
            dragging = true;
            ghost.css({
                left: ev.pageX - offsetX
            });

            return $(".size").text(parseInt(width - ev.pageX + offsetX) + "px");
        });
        return $doc.on("mouseup", function(ev) {
            e.preventDefault();
            if (dragging) {
                $doc.off("mousemove mouseup");
                $(".properties").css({
                    "flex": "0 0 " + (width - ghost.offset().left + offsetX) + "px"
                });

                ghost.remove();
                dragging = false;
                return $(".size").fadeOut("slow");
            }
        });
    });

}).call(this);


//# sourceURL=coffeescript