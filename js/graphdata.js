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
    note_auto_id: 0,
    version: 0.1,

    addChildTo(node, parent = null, data = null) {
        // adds new node to nodes repo, increases autonumber, 
        //  and makes currnt_node pointer to point to the newly created node
        if (this.current_note == null) {
            window.alert("no note is specified, please select some text and specify it as your current note")
            return;
        }

        if (data == null) {
            data = { note_id: this.current_note }
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
    addNote(txt_note) {
        this.notes[this.note_auto_id] = txt_note
        return this.note_auto_id++
    },
    changeCurrentNote(note_id) {
        this.current_note = note_id
    },
    getNote(id) {
        return this.notes[id]
    },
    getNotes() {
        return this.notes
    },
    setNotes(notes) {
        this.notes = notes
    },
    getParentN() {},
    stratify(parent = null) {
        nodes = [...this.nodes.values()]
        if (parent == null) {
            root_id = Math.min(...this.nodes.keys())
            parent = this.nodes.get(root_id)
        }
        return stratify(parent, nodes) //parent is null so it returns all hierarchy including root
    },
    setData(json_graph) {
        _nodes = new Map()
        try {
            // makes hierarchial jason graph to tabular form
            tmp_arr = destratify(json_graph, null)

            // saves tabular data in a temporary Map object (Dictionary)
            tmp_arr.forEach(node => {
                _nodes.set(node.id, node)
            });
        } catch (error) {
            return false;
        }

        this.eraseData();
        delete this.current_node
            // Store temporary generated Map        
        this.nodes = _nodes;
        // set root node
        root_id = Math.min(...this.nodes.keys())
        this.root_node = this.nodes.get(root_id)
        this.changeCurrentNode(root_id)
        this.auto_inc_id = Math.max(...this.nodes.keys()) + 1
        return true;
    },
    getJsonStr() {
        return JSON.stringify(this.stratify());
    },
    eraseData() {
        this.nodes.clear();
    },
    changeCurrentNode(id) {
        this.current_node = this.nodes.get(id);
    },
    getActiveNode() {
        return this.current_node;
    },
    isCompatible(version) {
        return (version == this.version) ? true : false;
    }

}


function stratify(parent, nodes) {
    const new_node = {
        id: parent.id,
        name: parent.name,
        note_id: parent.note_id,
        children: new Array()
    }
    nodes.forEach((node, index) => {
        if (node.parent == parent) {
            delete nodes[index]
            new_node.children.push(stratify(node, nodes))
        }
    });
    return new_node
}

function destratify(node, parent = null) {
    let child_arr = []
    let cur_obj = {
        id: node.id,
        name: node.name,
        parent: parent,
        note_id: node.note_id
    }
    node.children.forEach(child => {
        child_arr = child_arr.concat(destratify(child, cur_obj))
    });
    child_arr.push(cur_obj)
    return child_arr;
}
var graph_data_copy = graph_data