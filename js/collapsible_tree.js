var chart_tree = {
    margin: ({ top: 10, right: 120, bottom: 10, left: 40 }),
    dy: document.body.clientWidth / 200,
    height: 10,
    dx: 15,
    top: 0,
    diagonal: d3.linkHorizontal().x(d => d.y).y(d => d.x),
    zoom: 10,
    width: 90,
    radius: 10,
    data: null,
    transform_attr: d3.zoomIdentity,
    curr_selection: null,
    selected_node_id: null,
    refresh() {
        this.tree = d3.tree().nodeSize([this.dx, this.dy * this.radius])
        this.update(this.data, false);
    },
    changeZoom(zoom) {
        this.zoom = zoom
        svg = d3.select('#svg_canvas');
        svg.attr("viewBox", this.autoBox())
    },
    autoBox() {
        return [-this.margin.left, this.top - this.margin.top,
            this.width * this.zoom, this.height * this.zoom
        ]
    },
    draw(root) {
        _this = this
        this.tree = d3.tree().nodeSize([this.dx, this.dy * this.radius])

        root.x0 = this.dy / 2;
        root.y0 = 0;
        root.descendants().forEach((d, i) => {
            if (!d.id) d.id = i;
            d._children = d.children;
            // if (d.depth && d.data.name.length !== 7) d.children = null;
        });
        var svg = d3.select('#chart')
            .select("svg")
            .attr("viewBox", this.autoBox())
            .style("font", "10px sans-serif")
            .style("user-select", "none")
            .attr("id", "svg_canvas")
            .call(d3.zoom().on("zoom", function() {
                chart_tree.transform_attr = d3.zoomTransform(this);
                svg.select("g").attr("transform", chart_tree.transform_attr)
            }));
        var g = svg.select("g")
        g.selectAll("g").remove()
        const gLink = g.append("g")
            .attr("fill", "none")
            .attr("stroke", "#555")
            .attr("stroke-opacity", 0.4)
            .attr("stroke-width", 1.5);

        const gNode = g.append("g")
            .attr("cursor", "pointer")
            .attr("pointer-events", "all");

        this.update = function(source, show_transition = true) {
            const duration = d3.event && d3.event.altKey ? 2500 : 250;
            const nodes = root.descendants().reverse();
            const links = root.links();

            // Compute the new tree layout.
            this.tree(root);

            let left = root;
            let right = root;
            root.eachBefore(node => {
                if (node.x < left.x) left = node;
                if (node.x > right.x) right = node;
            });

            this.height = right.x - left.x + this.margin.top + this.margin.bottom;
            this.top = left.x

            const transition = svg.transition()
                .duration(duration)
                .attr("viewBox", this.autoBox())
                .tween("resize", window.ResizeObserver ? null : () => () => svg.dispatch("toggle"));

            // Update the nodes…
            const node = gNode.selectAll("g")
                .data(nodes, d => d.id);
            tip = d3.tip().direction('e')
                .attr('class', 'd3-tip')
                .html(function(d) {
                    the_note = graph_data.getNote(d.data.note_id)
                    node_name = d.data.name
                    var res = the_note.replace(new RegExp(`(${node_name})`), '<span id="name_word"><b>$1</b></span>');
                    return res;
                });
            svg.call(tip);

            // Enter any new nodes at the parent's previous position.
            const nodeEnter = node.enter().append("g")
                .attr("transform", d => show_transition ? `translate(${source.y0},${source.x0})` : `translate(${d.y},${d.x})`)
                .attr("fill-opacity", show_transition ? 0 : 1)
                .attr("stroke-opacity", show_transition ? 0 : 1)
                .on("mouseover", function(d) { tip.show(d); })
                .on('mouseout', function(d) { tip.hide(d); })
                .on("click", d => {
                    d.children = d.children ? null : d._children;
                    tip.hide(d);
                    this.update(d);
                });

            nodeEnter.append("circle")
                .attr("r", 2.5)
                .attr("fill", d => d._children ? "#555" : "#999")
                .attr("stroke-width", 10);

            nodeEnter.append("text")
                .attr("dy", "0.31em")
                .attr("x", d => d._children ? -6 : 6)
                .attr("text-anchor", d => d._children ? "end" : "start")
                .text(d => d.data.name)
                .attr("id", d => `node_${d.data.id}`)
                .attr("class", d => d.data.id == this.selected_node_id ? "red_text" : "")
                .on("click", function(d) { _this.selectNode(d, this) })
                .on('contextmenu', function(d) {
                    d3.event.preventDefault();
                    _this.selectNode(d, this);
                    showCanvasToolbar(this)
                })
                .clone(true).lower()
                .attr("stroke-linejoin", "round")
                .attr("stroke-width", 3)
                .attr("stroke", "white")
                .attr("stroke", "white")
                .attr("id", d => "")
            this.curr_selection = d3.select(`#node_${this.selected_node_id}`);

            // Transition nodes to their new position.
            node.merge(nodeEnter).transition(transition)
                .attr("transform", d => `translate(${d.y},${d.x})`)
                .attr("fill-opacity", 1)
                .attr("stroke-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            node.exit().transition(transition).remove()
                .attr("transform", d => `translate(${source.y},${source.x})`)
                .attr("fill-opacity", 0)
                .attr("stroke-opacity", 0);


            // Update the links…
            const link = gLink.selectAll("path")
                .data(links, d => d.target.id);

            // Enter any new links at the parent's previous position.
            const linkEnter = link.enter().append("path")
                .attr("d", d => {
                    const o = { x: show_transition ? source.x0 : d.x, y: show_transition ? source.y0 : d.y };
                    return this.diagonal({ source: o, target: o });
                });

            // Transition links to their new position.
            link.merge(linkEnter).transition(transition)
                .attr("d", this.diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition(transition).remove()
                .attr("d", d => {
                    const o = { x: source.x, y: source.y };
                    return this.diagonal({ source: o, target: o });
                });

            // Stash the old positions for transition.
            root.eachBefore(d => {
                d.x0 = d.x;
                d.y0 = d.y;
            });

            // g.selectAll("text")
            d3.select('body').on("click", () => hideCanvasToolbar(this))

            svg.call(d3.zoom().transform, this.transform_attr);
            g.attr("transform", this.transform_attr.toString())
        }
        this.update(root, false);
        this.data = root; //save data for later use and refresh
    },
    selectNode(d, _this = null) {
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
}