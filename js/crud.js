var save_name = document.getElementById("save-name");
var server_address = document.getElementById("frm-save-server-address");
var div_graph_list = document.getElementById("graph-list");

server = {
    address: "http://testtextograph.digitaltoxicity.ir",
    graph_name: "",
    setAdress(address) {
        // we can validate entered address here, may be in future
        if (address.trim() == "")
            this.address = "http://testtextograph.digitaltoxicity.ir";
        else
            this.address = address
    },
    setSearchTerm(name) {
        this.graph_name = name;
    },
    save(e) {
        version = graph_data.version
        json = {}
        json.graph = graph_data.stratify()
            // json.text = graph_data.get_text()
        json.version = version
        json.zoom = drawer.zoom
        json.radius = drawer.radius
            // json.notes = graph_data.getNotes()
        data = {}
        data.json = json
        data.name = save_name.value
            // check for duplicate name
            // console.log(confirm("Press a button!"))
        $.ajax({
            url: this.create_path(this.address),
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            success: function(data) {
                alert("data saved")
            },
            data: JSON.stringify(data)
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
        const url = this.make_url_from_scratch(this.address, { per_page: 3, name: this.graph_name })
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
                    // .attr("class", "column.is-xs-12.is-lg-4")
                    .on("click",
                        d => server_obj.open_graph(data.path + "/" + d.id))
                    .html(d => `<span class="number">${d.id}</span>` + d.name)

                // add pagination                
                add_pagination(
                    data,
                    (d, page_no) => server_obj.make_url(
                        d.path, {
                            per_page: d.per_page,
                            page: page_no,
                            name: server_obj.graph_name
                        }),
                    d => server_obj.fetch_page_by_url(d),
                    _fix = function(url) {
                        if (url)
                            return url + `&per_page=${data.per_page}&name=${server_obj.graph_name}`;
                    }
                );
                server_obj.busy = false;
            }
        });

    },
    search(graph_name) {

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
                const _err = server_obj.load_graph(data.json)
                    // console.log(data.graph.json)
                if (_err) alert(_err)
            }
        })
    },
    load_graph(data) {
        // graph_data is a global object
        if (!graph_data.isCompatible(data.version)) return "version incompatible"
        if (!graph_data.setData(data.graph)) return "there is a problem with your graph"
            // if (!graph_data.setNotes(data.Notes)) return "there is a problem with your graph"
            // 
        drawer.zoom = data.zoom;
        drawer.radius = data.radius
        graph_data.version = data.version
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