var save_name = document.getElementById("save-name");
var server_address = document.getElementById("frm-save-server-address");
var div_graph_list = document.getElementById("graph-list");

server = {
    address: "http://testtextograph.digitaltoxicity.ir",
    graph_name: "",
    search_term: "",
    setAdress(address) {
        // we can validate entered address here, may be in future
        if (address.trim() == "")
            this.address = "http://testtextograph.digitaltoxicity.ir";
        else
            this.address = address
    },
    setGraphName(name) {
        this.graph_name = name;
    },
    setSearchTerm(search_term) {
        this.search_term = search_term;
    },
    save() {
        this.saveAs(graph_data.id, graph_data.name, graph_data.url)
    },
    saveAs(id = null, name = null, url = null) {
        json = {}
        property = {}
        property.text = $("#text_area").htmlarea('html')
        property.version = graph_data.version
        property.radial_tree_zoom = radial_tree.zoom
        property.radial_tree_radius = radial_tree.radius
        property.collapsibleTree_zoom = chart_tree.zoom
        property.collapsibleTree_radius = chart_tree.radius
        property.notes = graph_data.getNotes()
        json.json = graph_data.stratify()
        json.property = property
        json.name = (name) ? name : document.getElementById("save-name").value;
        // *************  check for duplicate name
        if (id !== null) json.id = id
        $.ajax({
            url: (url) ? url : this.create_path(this.address),
            type: (id) ? 'put' : 'post',
            dataType: 'json',
            contentType: 'application/json',
            success: function(data) {
                alert("data saved")
            },
            data: JSON.stringify(json)
        });
        var event = new Event('click');
        document.getElementById("close-save-dlg").dispatchEvent(event);

    },
    create_path(servAddr) {
        return servAddr + "/api/graphs"
    },
    make_url_from_scratch(servAddr, url_vars) {
        path_addr = this.create_path(servAddr)
        return this.make_url(path_addr, url_vars)
    },
    make_url(path_addr, url_vars) {
        params = []
        for (param in url_vars)
            if (url_vars[param] != "")
                params.push(`${param}=${url_vars[param]}`)
        return path_addr + "?" + params.join("&")

    },
    get_firstpage() {
        const url = this.make_url_from_scratch(this.address, {
            per_page: 3,
            name: this.graph_name,
            search: this.search_term
        })
        this.saved_url = null
        this.fetch_page_by_url(url)
    },
    fetch_page_by_url(url) {
        if (this.busy) {
            this.saved_url = url
            if (this.timer == null) {
                console.log("timout started")
                this.timer = setTimeout(() => {
                    console.log("timout ended")
                    this.timer = null
                    this.get_url(this.saved_url)
                    this.saved_url = null
                }, 500);
            } else
                console.log("timeout has been set")
        } else {
            if (this.timer) {
                clearTimeout(this.timer)
                console.log("timout removed")
            }
            this.timer = null
            this.get_url(url);
        }
    },
    get_url(url) {
        if (!url) return
        server_obj = this
        this.busy = true
        $.ajax({
            url: url,
            type: 'get',
            dataType: 'json',
            contentType: 'application/json',
            error: function(xhr, status, error) {
                var err = xhr.responseText;
                server_obj.busy = false
                alert(err.Message);
            },
            success: function(data) {
                // add contents list                
                lst_div = d3.select("#graph-list")
                    .attr("class", "is-xs-d-block is-md-d-flex is-xl-d-flex")
                lst_div.selectAll("graph").remove()
                lst_div.selectAll("graph")
                    .data(data.data)
                    .join("graph")
                    .attr("id", d => "graph" + d.id)
                    .append("span").attr("class", "number").text(d => d.id)
                    .on("click", d => server_obj.open_graph(data.path + "/" + d.id))
                    .clone().attr("class", "graph_name").text(d => d.name)
                    .on("click", d => server_obj.open_graph(data.path + "/" + d.id))
                    .clone().attr("class", "edit-name").html('<i class="fas fa-edit"></i>')
                    .on("click", d => server_obj.edit_graph_name(data.path + "/" + d.id, `#graph${d.id}`))
                    .clone().attr("class", "delete").html('<i class="fas fa-trash-alt"></i>')
                    .on("click", d => server_obj.delete_graph(data.path + "/" + d.id, `#graph${d.id}`))


                // add pagination                
                add_pagination(
                    data,
                    (d, page_no) => server_obj.make_url(
                        d.path, {
                            per_page: d.per_page,
                            page: page_no,
                            name: server_obj.graph_name,
                            search: server_obj.search_term
                        }),
                    d => server_obj.fetch_page_by_url(d),
                    _fix = function(url) {
                        if (url)
                            return url + `&per_page=${data.per_page}&name=${server_obj.graph_name}&search=${ server_obj.search_term}`;
                    }
                );
                server_obj.busy = false;
            }
        });

    },
    edit_graph_name(address_path, grahp_id) {

    },
    delete_graph(url, dom_id) {
        if (confirm("are you want to delete this graph?"))
            $.ajax({
                url: url,
                type: 'delete',
                dataType: 'json',
                contentType: 'application/json',
                error: function(xhr, status, error) {
                    var err = xhr.responseText;
                    alert(err.Message);
                },
                success: function(data) {
                    d3.select(dom_id).node().remove()
                }
            })
    },
    open_graph(url) {
        if (!url) return
        server_obj = this
        $.ajax({
            url: url,
            type: 'get',
            dataType: 'json',
            contentType: 'application/json',
            error: function(xhr, status, error) {
                var err = xhr.responseText;
                server_obj.busy = false
                alert(err.Message);
            },
            success: function(data) {
                // ********* better to write with try catch  ****
                const _err = server_obj.load_graph(data)
                graph_data.name = data.name
                graph_data.url = url
                graph_data.id = data.id
                    // console.log(data.graph.json)
                if (_err) alert(_err)
            }
        })
    },
    load_graph(data) {
        // graph_data is a global object
        // graph is store in data.json other things in data.property
        if (!graph_data.isCompatible(data.property.version)) return "version incompatible"
        if (!graph_data.setData(data.json)) return "there is a problem with your graph"
            // if (!graph_data.setNotes(data.Notes)) return "there is a problem with your graph"
            // adjust zooming         
        radial_tree.zoom = data.property.radial_tree_zoom
        radial_tree.radius = data.property.radial_tree_radius
        chart_tree.zoom = data.property.collapsibleTree_zoom
        chart_tree.radius = data.property.collapsibleTree_radius
        document.getElementById("text_area").value = data.property.text
        $("#text_area").htmlarea("updateHtmlArea")
        $("#text-view").html(data.property.text)
        graph_data.version = data.property.version
        graph_data.setNotes(data.property.notes)
        refresh_view();
        return null
    }

}

function add_pagination(data, make_url_func, call_url_func, _fix) {
    // calculate upper and lower range
    // very long .... could be smaller i think, may be later
    half_range = 3;
    pg_low = (data.current_page <= half_range) ? 1 : data.current_page - half_range;
    pg_top = pg_low + half_range * 2;
    pg_top = (pg_top > data.last_page) ? data.last_page : pg_top;
    rem_pages = data.last_page - data.current_page;
    if (rem_pages < half_range)
        pg_low -= (half_range - rem_pages);
    if (pg_low <= 0)
        pg_low = 1;
    // these lines of codes makes array of {url,label} object for each page

    pages_range = [
        { url: _fix(data.first_page_url), label: "<<" },
        { url: _fix(data.prev_page_url), label: "<" },
        ...range(pg_low, pg_top, page_no => make_url_func(data, page_no)),
        { url: _fix(data.next_page_url), label: ">" },
        { url: _fix(data.last_page_url), label: ">>" }
    ];
    // add pagination to DOM
    div_pages = d3.select("#pages_links");
    div_pages.selectAll("a")
        .data(pages_range)
        .join("a")
        .attr("class", d => (d.label == data.current_page) ? "active_page" : "")
        .text(d => d.label)
        .on("click", d => call_url_func(d.url));
}

function* range(a, b, url_generator) {
    for (i = a; i <= b; i++) {
        yield {
            url: url_generator(i),
            label: i
        };
    }
}

// MyDialogs = {
//     Save: {
//         a = d3.select("body")
//         .append("div")
//         .attr("id", "frm_save")
//         a.append("input")
//         .attr("id", "save_name")
//         a.selectAll("button")
//         .data([
//             ["btn_ok", "OK"],
//             ["btn_cancel", "Cancel"]
//         ])
//         .join("button")
//         .text(d => d[1])
//         .attr("id", d => d[0])
//         .on("click", function(d, e) {
//             if (this.id == "btn_ok") {

//             } else {

//             }

//         })
//     },
//     show() {
//         if (typeof this.onSave === "function") this.onSave()
//     },
// }