class GraphNode {
    constructor(id, name, parent = null) {
        this.id = id;
        this.name = name;
        this.parent = parent;
    }
}

var graph_data = {
        nodes: new Map(),
        notes: {},
        current_node: null,
        root_node: null,
        current_note: null,
        current_depth: 0,
        auto_inc_id: 0,
        createNodeFromCache() {
            node = "";
            return node;
        },

        addChildTo(node, parent = null, data = null) {
            // adds new node to nodes repo, increases autonumber, 
            //  and makes currnt_node pointer to point to the newly created node
            if (data == null) {
                data = {}
            }
            if (typeof node === "string") {

                if (this.nodes.size == 0 || // there is no other node (creating root node)
                    this.nodes.has(parent.id) // or check if parent is present
                ) {
                    new_node = new GraphNode(this.auto_inc_id, node, parent)
                    new_node = Object.assign(new_node, data) // add additional data to new node
                    this.nodes.set(this.auto_inc_id++, new_node) // add new node to our node repo
                    this.current_node = new_node;
                    return new_node;
                } else {
                    throw "Error: parent id not found";
                }

            } else {
                throw "Error: add child from object Not implemented yet node must be a string";

            }

        },

        addChild(node) { // adds a child to the current node

            if (this.current_node !== null) {
                this.addChildTo(node, this.current_node);
                this.current_depth++;
            } else if (this.nodes.size == 0) {
                this.root_node = this.addChildTo(node, null)
                this.current_depth = 0;
            } else {
                // there is no node in our repo so create first one
                throw "Error: there is no active node, however nodes' repo is not empty"
            }

        },

        addSibling(node) { // adds a child to the parent of current node
            if (this.current_node !== null) {
                if (this.current_node.parent !== null) {
                    this.addChildTo(node, this.current_node.parent);
                }
            } else {
                this.addChild(node);
            }

        },
        addUncle(node) { // adds a child to the grandparent of current node
            if (this.current_node !== null) {
                if (this.current_node.parent !== null) {
                    if (this.current_node.parent.parent !== null) {
                        this.addChildTo(node, this.current_node.parent.parent);
                    }
                }
            } else {
                this.addChild(node);
            }

        },
        getNodes() {

        },
        getParentN() {

        },
        stratify() {
            heirarchy_func = d3.stratify()
                .id(function(d) { return d.id; })
                .parentId(function(d) { return (d.parent == null) ? null : d.parent.id; });
            my_arr = [...this.nodes.values()]
            res = heirarchy_func(my_arr);
            return res;
        },
        addGraph() {
            var data = d3.hierarchy(this.stratify())
            var radius = 150
            var width = (data.height * radius)
            chart(data, width)
        },

        getJson() {
            nodes = [...this.nodes.values()]
            parent = this.nodes.get(0)
            json = get_childrenof(null, nodes) //parent is null so it returns all hierarchy including root
            return JSON.stringify(json);
        }

    }
    // test_graph();

// function test_graph() {
//     // create root
//     graph_data.addChild("root")

//     // create 5 child for root
//     graph_data.addChild("row1_0")
//     for (let i = 1; i < 5; i++) graph_data.addSibling(`row1_${i}`);

//     // create 3rd row
//     graph_data.addChild("row2_0")
//     for (let i = 1; i < 5; i++) graph_data.addSibling(`row2_${i}`);

//     graph_data.addUncle("row1_6")
//     graph_data.addChild("nrow2_0")
//     for (let i = 1; i < 5; i++) graph_data.addSibling(`nrow2_${i}`);

//     // print data in console
//     console.log([...graph_data.nodes.values()])
//     console.log(graph_data.stratify())
//     graph_data.addGraph()
// }

function get_childrenof(parent, nodes) {
    let tmp_arr = []
    nodes.forEach((node, index, nodes) => {
        if (node.parent == parent) {
            delete nodes[index]
            new_node = {
                id: node.id,
                name: node.name,
                children: get_childrenof(node, nodes)
            };
            tmp_arr.push(new_node);
        };
    });
    return tmp_arr;
}