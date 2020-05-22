function autoBox() {

    $("#chart").appendChild(this);
    const {
        x,
        y,
        width,
        height
    } = this.getBBox();
    //document.body.removeChild(this);
    return [x, y, width, height];
}
mydata = ({
    id: 'id_1',
    name: 'ali',
    children: [{
        id: 'id_2',
        name: 'ahmad',
        children: [{
            id: 'id_3',
            name: 'salam',
            children: {}
        }, {
            id: 'id_4',
            name: 'salam',
            children: {}
        }, ]
    }, {
        id: 'id_5',
        name: 'mahmood',
        children: [{
            id: 'id_6',
            name: 'salam',
            children: {}
        }, {
            id: 'id_7',
            name: 'salam',
            children: {}
        }, ]
    }, {
        id: 'id_8',
        name: 'hoda',
        children: [{
            id: 'id_9',
            name: 'salam',
            children: {}
        }, {
            id: 'id_10',
            name: 'goodbye',
            children: {}
        }, ]
    }, ]
})

var data = d3.hierarchy(mydata)
var radius = 150
var width = (data.height * radius)
window.curr_selection

var tree = d3.tree()
    .size([2 * Math.PI, radius])
    .separation((a, b) => (a.parent == b.parent ? 1 : 2) / a.depth)

function chart() {
    const root = tree(data);
    var svg = d3.select('#chart').append("svg");

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
        .attr("id", d => d.data.id)
        .text(d => d.data.name)
        .clone(true).lower()
        .attr("stroke", "white");

    svg.selectAll("text").on("click", function(d) {
            if (window.curr_selection != undefined) {
                window.curr_selection.attr('class', 'black_text')
            }
            txt = d3.select(this)
            txt.attr('class', "red_text")
            the_id = d.data.id
            test = `#${the_id}`
            window.curr_selection = txt
            console.log("hello" + d.data.name);

        })
        // .onclick("click();");
        // d3.select("body").style("background-color", "black");
    const viewbox = `-${width} -${width} ${width*2} ${width*2}`
    svg.attr("viewBox", viewbox)
}
chart();
curr_selection = $('#id_1')