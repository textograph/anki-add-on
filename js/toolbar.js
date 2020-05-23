// call on text selected

var t = '';

function gText(e) {
    let selection = document.getSelection ?
        document.getSelection().toString() :
        document.selection.createRange().toString();
    console.log(selection);
    if (selection) {
        toolbar = $("#mini-toolbar");
        X = e.clientX - (toolbar.width() / 2);
        Y = e.clientY;
        toolbar.css("top", `${Y}px`);
        toolbar.css("left", `${X}px`);
        toolbar.css("display", 'flex');
    } else {
        toolbar = $("#mini-toolbar");
        toolbar.css("display", 'none');
    }
}
// document.onmousedown = function() {
//     toolbar = $("#mini-toolbar");
//     toolbar.css("display", 'none');
// }
document.onmouseup = gText;
if (!document.all) document.captureEvents(Event.MOUSEUP);


// call if textarea has been change

$('#text_area').bind('change', function() {
    $("#text-view").text(this.value)
});

// if toolbar buttons clicked
$("#mini-toolbar").on('click', 'div', function() {
    // alert("You clicked on li " + $(this).text());
});