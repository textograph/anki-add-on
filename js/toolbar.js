// call on text selected

var t = '';
var selected_text = '';

function gText(e) {
    var selection = document.getSelection ?
        document.getSelection().toString() :
        document.selection.createRange().toString();
    t = selection
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

document.onmouseup = gText;
if (!document.all) document.captureEvents(Event.MOUSEUP);


// call if textarea has been change

$('#text_area').bind('change', function() {
    $("#text-view").text(this.value)
});

// if toolbar buttons clicked
$("#mini-toolbar").on('click', 'div', function() {
    if (selected_text) {
        console.log(selected_text);


        the_id = $(this).attr("id")
        switch (the_id) {
            case "child":
                graph_data.addChild(selected_text)
                break;
            case "before":
                graph_data.addUncle(selected_text)
                break;
            case "below":
                graph_data.addSibling(selected_text)
                break;

            default:
                break;
        }



        const json = graph_data.stratify();
        var data = d3.hierarchy(json);
        drawer.draw(data);
        wrap_svg_texts();
        //save current json into the document
        json_str = JSON.stringify(json)
        $("#save_area").text(`json_data=${json_str}; graph_data.setData(json_data);`)
            // alert("You clicked on li " + $(this).text());
    }

});

$("#mini-toolbar").on('mousedown', 'div', function() {
    if (t) {
        selected_text = t;
    }

});


$("#toolbar").on('click', 'div', function() {

    // console.log($("#save_area").text())
    the_id = $(this).attr("id")
    switch (the_id) {
        case "web":
            drawer = radial_tree;
            json = graph_data.stratify();
            var data = d3.hierarchy(json);
            drawer.draw(data);
            break;
        case "tree":
            drawer = chart_tree;
            json = graph_data.stratify();
            var data = d3.hierarchy(json);
            drawer.draw(data);
            break;
        default:
            break;
    }
    // alert("You clicked on li " + $("#save_area").val());
    // var json = JSON.stringify([...graph_data.nodes.values()]);
    // $("#save_area").text("data = " + json + ";graph_data.setData(data)")

});

var viewBoxSlider = document.getElementById("sliderViewBox");
var radiusSlider = document.getElementById("sliderRadius");

//var output = document.getElementById("demo");
//output.innerHTML = slider.value;

radiusSlider.oninput = function() {
    drawer.radius = this.value;
    drawer.refresh();

}

viewBoxSlider.oninput = function() {
    drawer.changeZoom(this.value);
    console.log(this.value);
}