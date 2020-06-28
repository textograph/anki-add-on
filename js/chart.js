function autoBox(zoom) {
    // document.body.appendChild(this);
    // $("#chart").appendChild(this);
    let groupElement = document.querySelector('#svg_canvas');
    const {
        x,
        y,
        width,
        height
    } = groupElement.getBBox();
    //document.body.removeChild(this);
    return [x - 100, y - 100, width * zoom, height * zoom];
}

// var data = d3.hierarchy(data)
// var radius = 150
// var width = (data.height * radius)
// width = document.body.clientWidth
// var width = (data.height * radius)

var radial_tree = {
    curr_selection: null,
    zoom: 10,
    radius: 100,
    transform_attr: d3.zoomIdentity,
    selected_node_id: null,
    refresh() {
        this.draw(this.data)
    },
    changeZoom(zoom) {
        // changes the zooming seperately from the d3.js zooming behaviour and is specific to this view
        // and not shared between views
        this.zoom = zoom
        svg = d3.select('#svg_canvas');
        svg.attr("viewBox", autoBox(this.zoom / 10))
    },
    selectNode(d, _this = null) {
        // make previously selected node as black (unselected)
        if (_this == null) _this = this
        if (this.curr_selection != null) {
            this.curr_selection.attr('class', 'black_text')
        }
        txt = d3.select(_this)
        txt.attr('class', "red_text")
        the_id = d.data.id
        graph_data.changeCurrentNode(the_id)
        test = `#${the_id}`
        this.curr_selection = txt
        this.selected_node_id = d.data.id
    },

    hilightNode(node_id) {
        node = d3.select(`#node_${node_id}`)
        this.selectNode(node.datum(), node.node())
    },
    draw(hierarchy_data) {
        _this = this
        this.data = hierarchy_data; //save data for later use and for refresh
        tree = d3.tree()
            .size([2 * Math.PI, this.radius * 10])
            .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)
        const root = tree(hierarchy_data);
        var svg = d3.select('#chart').select("svg")
            .attr("id", "svg_canvas")
            .call(d3.zoom().on("zoom", function() {
                radial_tree.transform_attr = d3.zoomTransform(this);
                svg.select("g").attr("transform", radial_tree.transform_attr)
            }));

        var g = svg.select("g");
        g.selectAll("g").remove()
        g.append("g")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", 1.5)
            .selectAll("path")
            .data(root.links())
            .join("path")
            .attr("d", d3.linkRadial()
                .angle(d => d.x)
                .radius(d => d.y));

        g.append("g")
            .selectAll("circle")
            .data(root.descendants())
            .join("circle")
            .attr("transform", d => `
            rotate(${d.x * 180 / Math.PI - 90})
            translate(${d.y},0)
        `)
            .attr("fill", d => d.children ? "#555" : "#999")
            .attr("r", 3.5);

        g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .selectAll("text")
            .data(root.descendants())
            .join("text")
            .attr("id", d => `node_${d.data.id}`)
            .attr("class", d => d.data.id == this.selected_node_id ? "red_text" : "")
            .attr("transform", d => `
            rotate(${d.x * 180 / Math.PI - 90}) 
            translate(${d.y},0) 
            rotate(${d.x >= Math.PI ? 180 : 0})
        `)
            .attr("dy", "0.31em")
            .attr("x", d => d.x < Math.PI === !d.children ? 6 : -6)
            .attr("text-anchor", d => d.x < Math.PI === !d.children ? "start" : "end")
            .text(d =>
                d.data.name)
            .call(wrap_text)
            .on("click", function(d) { _this.selectNode(d, this) })
            .on('contextmenu', function(d) {
                d3.event.preventDefault();
                _this.selectNode(d, this);
                showCanvasToolbar(this)
            })
            .clone(true).lower()
            .attr("stroke", "white")
            .attr("id", d => "")
        this.curr_selection = d3.select(`#node_${this.selected_node_id}`)

        tip = d3.tip().direction('e')
            .attr('class', 'd3-tip')
            .html(function(d) {
                the_note = getNodeNote(d)
                if (the_note) {
                    node_name = d.data.name
                    var res = the_note.replace(new RegExp(`(${node_name})`), '<span id="name_word"><b>$1</b></span>');
                    return res;
                }
            });
        svg.call(tip);
        g.selectAll("text")
            .on("mouseover", function(d) { tip.show(d); })
            .on('mouseout', function(d) { tip.hide(d); })


        // g.selectAll("text")


        svg.attr("viewBox", [-300, -300, 600, 600])
        'body'
        d3.select('body').on("click", () => hideCanvasToolbar(this))
        the_g = g.node()
            // d3.zoomTransform(the_g, this.transform_attr)
        svg.call(d3.zoom().transform, this.transform_attr);
        g.attr("transform", this.transform_attr.toString())
            // d3.zoom().transform(the_g, this.transform_attr.x, this.transform_attr.y)
    }

}
curr_selection = $('#id_1')

function wrap_svg_texts() {
    a = $("text")
    for (i of a) {
        wrap_svg_text(i)
    }
}

function wrap_text(d) {

    d.select(function(d, i) {
        wrap_svg_text(this);
    })
}

function wrap_svg_text(element) {

    let x = 0;
    let y = 0;
    let width = 90;
    let lineHeight = 10;



    /* get the text */
    var text = element.innerHTML;

    /* split the words into array */
    var words = text.split(' ');
    var line = '';

    /* Make a tspan for testing */
    element.innerHTML = '<tspan id="PROCESSING">busy</tspan >';

    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var testElem = document.getElementById('PROCESSING');
        /*  Add line in testElement */
        testElem.innerHTML = testLine;
        /* Messure textElement */
        var metrics = testElem.getBoundingClientRect();
        testWidth = metrics.width;

        if (testWidth > width && n > 0) {
            element.innerHTML += '<tspan x="0" dy="' + y + '">' + line + '</tspan>';
            line = words[n] + ' ';
            y = lineHeight;
        } else {
            line = testLine;
        }
    }

    element.innerHTML += '<tspan x="0" dy="' + y + '">' + line + '</tspan>';
    document.getElementById("PROCESSING").remove();

}
drawer = radial_tree;