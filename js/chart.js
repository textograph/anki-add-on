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
    refresh() {
        this.draw(this.data)
    },
    changeZoom(zoom) {
        this.zoom = zoom
        svg = d3.select('#svg_canvas');
        svg.attr("viewBox", autoBox(this.zoom / 10))
    },
    draw(hierarchy_data) {
        this.data = hierarchy_data; //save data for later use and for refresh
        tree = d3.tree()
            .size([2 * Math.PI, this.radius * 10])
            .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)
        const root = tree(hierarchy_data);
        d3.select('#chart').select("svg").remove();
        var svg = d3.select('#chart')
            .append("svg")
            .attr("id", "svg_canvas")
            .call(d3.zoom().on("zoom", function() {
                svg.attr("transform", d3.event.transform)
            }));
        svg.append("g")
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

        svg.append("g")
            .selectAll("circle")
            .data(root.descendants())
            .join("circle")
            .attr("transform", d => `
            rotate(${d.x * 180 / Math.PI - 90})
            translate(${d.y},0)
        `)
            .attr("fill", d => d.children ? "#555" : "#999")
            .attr("r", 3.5);

        svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("stroke-linejoin", "round")
            .attr("stroke-width", 3)
            .selectAll("text")
            .data(root.descendants())
            .join("text")
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
            .clone(true).lower()
            .attr("stroke", "white");

        svg.selectAll("text").on("click", function(d) {
                if (window.curr_selection != undefined) {
                    window.curr_selection.attr('class', 'black_text')
                }
                txt = d3.select(this)
                txt.attr('class', "red_text")
                the_id = d.data.id
                graph_data.changeCurrentNode(the_id)
                test = `#${the_id}`
                window.curr_selection = txt
                console.log("hello " + d.data.name);
            })
            // .onclick("click();");
            // d3.select("body").style("background-color", "black");


        // _width2 = width * 2 + 90
        // _width1 = (width + 40)
        // const viewbox = `-${_width1} -${_width1} ${_width2} ${_width2}`
        // svg.attr("viewBox", viewbox)
        svg.attr("viewBox", autoBox(this.zoom / 10))
    }
}
curr_selection = $('#id_1')

function wrap_svg_texts() {
    a = $("text")
    for (i of a) {
        wrap_svg_text(i)
    }
}


function wrap_svg_text(element) {

    let x = 0;
    let y = 12;
    let width = 15;
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
        } else {
            line = testLine;
        }
    }

    element.innerHTML += '<tspan x="0" dy="' + y + '">' + line + '</tspan>';
    document.getElementById("PROCESSING").remove();

}
drawer = radial_tree