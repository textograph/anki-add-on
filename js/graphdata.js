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
    getNodes() {},
    getParentN() {},
    stratify() {
        nodes = [...this.nodes.values()]
            // parent = this.nodes.get(0)
        return get_childrenof(null, nodes)[0] //parent is null so it returns all hierarchy including root
    },
    setData(json) {
        tmp_arr = destratify(json, null)
        delete this.current_node
        this.eraseData()
        tmp_arr.forEach(node => {
            this.nodes.set(node.id, node)
        });
        this.root_node = this.nodes.get(0)
        this.changeCurrentNode(0)
        this.auto_inc_id = Math.max(...this.nodes.keys()) + 1

    },
    getJsonStr() {
        return JSON.stringify(this.stratify);
    },
    eraseData() {
        this.nodes.clear()
    },
    changeCurrentNode(id) {
        this.current_node = this.nodes.get(id)
    }

}

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

function destratify(node, parent = null) {
    let child_arr = []
    let cur_obj = {
        id: node.id,
        name: node.name,
        parent: parent
    }
    node.children.forEach(child => {
        child_arr = child_arr.concat(destratify(child, cur_obj))
    });
    child_arr.push(cur_obj)
    return child_arr;
}