class GraphNode {
    constructor(id, name, parent = null) {
        this.id = id;
        this.name = name;
        this.parent = parent;
    }

    addChild(id, name, ) {

    }
}


var graph_data = {
    nodes: new Map(),
    notes: {},
    current_node: {},
    current_note: {},
    current_depth: 0,
    auto_inc_id: 0,
    createNodeFromCache() {
        node = "";
        return node;
    },
    addChildTo(node, parent, data = {}) {
        if (typeof node === "string") {
            if (this.nodes.has(parent_id) | //parent node exists
                this.nodes.size === 0) { // or this is the first node                    
                new_node = new GraphNode(
                    this.auto_inc_id,
                    node,
                    parent_id
                )
                new_node = Object.assign(new_node, data)
                this.nodes.set(this.auto_inc_id++, new_node)
                return new_node;
            } else {
                throw "parent id not found";
            }
            throw "add child fron object Not implemented yet";
        }

    },
    addChild(node) {
        if (typeof this.current_node !== undefined) {
            this.addChildTo(this.current_node,
                this.current_node.parent)
        }
        data = {
            note_id: "",
            note_node_link: ""
        }
        parent_id = (this.nodes.size === 0) ? null : current_note.id;

        this.current_node = this.addChildTo(node, parent_id, data)
    },
    addSibling(node) {
        if (this.current_depth > 0) {
            parent_id = current_note.parent_id;
        }
    },
    addUncle(node) {

    },
    getNodes() {

    },
    getParentN() {

    }
}