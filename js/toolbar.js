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
            case "note":
                note = graph_data.addNote(selected_text)
                graph_data.changeCurrentNote(note.id)
                return;
            default:
                break;
        }



        const json = graph_data.stratify();
        var data = d3.hierarchy(json);
        drawer.draw(data);
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
            break;
        case "tree":
            drawer = chart_tree;
            break;
        default:
            break;
    }
    // there should be some code to set the zoming and radius slider based on level of corresponding drawer value
    redraw_graph();
    // alert("You clicked on li " + $("#save_area").val());
    // var json = JSON.stringify([...graph_data.nodes.values()]);
    // $("#save_area").text("data = " + json + ";graph_data.setData(data)")

});

function redraw_graph() {
    // puts new data into chart and draws the chart from scratch
    viewBoxSlider.value = drawer.zoom
    radiusSlider.value = drawer.radius
    json = graph_data.stratify();
    var data = d3.hierarchy(json);
    drawer.draw(data);
}

var viewBoxSlider = document.getElementById("sliderViewBox");
var radiusSlider = document.getElementById("sliderRadius");
var show_quiz_leaves_label = document.getElementById("quiz-leaves-label");
var show_quiz_leaves = document.getElementById("quiz-leaves");
//var output = document.getElementById("demo");
//output.innerHTML = slider.value;
show_quiz_leaves_label.onchange = function() {
    let active_node = graph_data.getActiveNode()
    if (show_quiz_leaves.checked) {
        if (active_node == null) {
            alert("please select a node first")
            show_quiz_leaves.checked = false
            return
        }
        // copy current graph_data to save its data from being changed
        graph_data = Object.assign({}, graph_data, { nodes: new Map() })
        new_data = graph_data_copy.stratify(active_node)
        graph_data.setData(new_data)
        redraw_graph()
        const quiz = d3.select("#text-column")
            .append("div")
            .attr("id", "quiz_choices")
    } else {
        delete graph_data
        graph_data = graph_data_copy
        redraw_graph()
        d3.select("#quiz_choices").remove()
    }
}
radiusSlider.oninput = function() {
    drawer.radius = this.value;
    drawer.refresh();
}

viewBoxSlider.oninput = function() {
    drawer.changeZoom(this.value);
    console.log(this.value);
}