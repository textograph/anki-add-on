// call on text selected
var text_area = document.getElementById("text_area");
var text_view = document.getElementById("text-view");
var viewBoxSlider = document.getElementById("sliderViewBox");
var radiusSlider = document.getElementById("sliderRadius");
var show_quiz_leaves_label = document.getElementById("quiz-leaves-label");
var show_quiz_leaves = {
    checked: true
}
var t = '';
var curr_selected_text = '';
var auto_repeat = false
var repeat_action = null
arr_cummulated_text = []

function refresh_view(exceptions) {
    redraw_graph();
    getQuiz(exceptions);
}

function redraw_graph(draw = true) {
    // puts new data into chart and draws the chart from scratch

    if (graph_data.nodes.size) {
        // viewBoxSlider.value = drawer.zoom
        // radiusSlider.value = drawer.radius
        json = graph_data.stratify();
        let data = d3.hierarchy(json);
        drawer.selected_node_id = graph_data.current_node.id
        if (draw) drawer.draw(data);
        return data;
    }
}


//var output = document.getElementById("demo");
//output.innerHTML = slider.value;

function getQuiz(exceptions = null) {
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
        remove_leaves(question_hierarchy, exceptions);
        drawer.draw(question_hierarchy);

        // create a pan and insert answers into it
        d3.select("#quiz_choices").remove()
        const quiz = d3.select("#text-column")
            .append("div")
            .attr("id", "quiz_choices")
            .selectAll("div")
            .data(answers)
            .join("div")
            .filter(d => !exceptions.includes(d.data.id))
            .attr("id", d => `answer_${d.data.id}`)
            .attr("class", "answer")
            .text(d => d.data.name)
            .on("click", function(d, i) {
                if (d.parent.data.id == graph_data.getActiveNode().id) {
                    parent_childs = d.parent.children
                    if (parent_childs == null) {
                        if (d.parent._children == null) {
                            d.parent.children = new Array
                            parent_childs = d.parent.children
                        } else {
                            parent_childs = d.parent._children
                        }
                    }
                    parent_childs.push(d)

                    d.parent._children = parent_childs
                    d3.select(this).node().remove()
                    drawer.refresh();
                    pycmd("sub_answer_" + d.data.id)
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
$("#switch-graph").on("click", function() {
    data = drawer.data
    drawer = (drawer == radial_tree) ? chart_tree : radial_tree;
    drawer.selected_node_id = graph_data.current_node.id
    drawer.draw(data);
    radiusSlider.value = drawer.radius
    viewBoxSlider.value = drawer.zoom
})

radiusSlider.oninput = function() {
    drawer.radius = this.value;
    drawer.refresh();
}

viewBoxSlider.oninput = function() {
    drawer.changeZoom(this.value);
    console.log(this.value);
}


function remove_leaves(hierarchy, exceptions = null) {
    hierarchy.descendants().forEach((d, i) => {
        d.id = i;
        console.log(d.data.id)
        if (d.height != 0) {
            // just remove children that are leaves
            let new_children = new Array;
            d.children.forEach(node => {
                if (node.height != 0 ||
                    exceptions.includes(node.data.id)) {
                    new_children.push(node);
                } else
                // this is the leaf that is question and user must solve
                    pycmd("sub_question_" + node.data.id)
            });
            if (new_children.length)
                d.children = new_children;
            else
                delete d.children
        }
    });
}