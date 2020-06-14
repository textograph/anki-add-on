// call on text selected

var t = '';
var selected_text = '';

function gText(e) {
    var selection = document.getSelection ?
        document.getSelection().toString() :
        document.selection.createRange().toString();
    t = selection
    if (selection && !show_quiz_leaves.checked) {
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
    getQuiz();
    // alert("You clicked on li " + $("#save_area").val());
    // var json = JSON.stringify([...graph_data.nodes.values()]);
    // $("#save_area").text("data = " + json + ";graph_data.setData(data)")

});

function redraw_graph(draw = true) {
    // puts new data into chart and draws the chart from scratch
    viewBoxSlider.value = drawer.zoom
    radiusSlider.value = drawer.radius
    json = graph_data.stratify();
    let data = d3.hierarchy(json);
    if (draw) drawer.draw(data);
    return data;
}

var viewBoxSlider = document.getElementById("sliderViewBox");
var radiusSlider = document.getElementById("sliderRadius");
var show_quiz_leaves_label = document.getElementById("quiz-leaves-label");
var show_quiz_leaves = document.getElementById("quiz-leaves");
var save_name = document.getElementById("save-name");
var server_address = document.getElementById("server-address");
//var output = document.getElementById("demo");
//output.innerHTML = slider.value;
show_quiz_leaves_label.onchange = getQuiz

function getQuiz() {
    let active_node = graph_data.getActiveNode()
    if (show_quiz_leaves.checked) {
        if (active_node == null) {
            alert("please select a node first")
            show_quiz_leaves.checked = false
            return
        }

        new_data = graph_data.stratify(active_node); // make new hierarchy from active node
        // copy current graph_data to save its data from being changed
        graph_data = Object.assign({}, graph_data, { nodes: new Map() })
        graph_data.setData(new_data) // and make it default data for layout


        var question_hierarchy = redraw_graph(false) // just get hierarchy does not display anything
        var answers = question_hierarchy.leaves();
        // make html divs from leaves

        //          when div clicked: if div data parent id matches with hierarchy id remove div and add it to hierarchy
        // delete leaves from hierarchy
        remove_leaves(question_hierarchy);
        drawer.draw(question_hierarchy);

        // create a pan and insert answers into it
        d3.select("#quiz_choices").remove()
        const quiz = d3.select("#text-column")
            .append("div")
            .attr("id", "quiz_choices")
            .selectAll("div")
            .data(answers)
            .join("div")
            .attr("id", d => `answer_${d.data.id}`)
            .attr("class", "answer")
            .text(d => d.data.name)
            .on("click", function(d, i) {
                if (d.parent.data.id == graph_data.getActiveNode().id) {

                    if (d.parent.children == null) {
                        d.parent.children = new Array
                    }
                    d.parent.children.push(d)
                    d.parent._children = d.parent.children
                    d3.select(this).node().remove()
                    drawer.refresh();
                } else {

                }

            });
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

function remove_leaves(hierarchy) {
    hierarchy.descendants().forEach((d, i) => {
        d.id = i;
        if (d.height == 1) {
            // this node only have leaves so we can remove all children at once
            delete d.children;
            // d.children = null;
        } else if (d.height != 0) {
            // just remove children that are leaves
            let new_children = new Array;
            d.children.forEach(node => {
                if (node.height != 0)
                    new_children.push(node);
            });
            d.children = new_children;
        }
    });
}