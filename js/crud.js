var save_name = document.getElementById("save-name");
var server_address = document.getElementById("frm-save-server-address");
var div_graph_list = document.getElementById("graph-list");

server = {
    address: "http://testtextograph.digitaltoxicity.ir",
    setAdress(address) {
        // we can validate entered address here, may be in future
        if (address.trim() == "")
            this.address = "http://testtextograph.digitaltoxicity.ir";
        else
            this.address = address
    },
    save(e) {
        version = "0.0.1"
        json = {}
        json.graph = graph_data.stratify()
            // json.text = graph_data.get_text()
        json.version = version
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
    make_url_from_scratch(servAddr, page_no, per_page) {
        path_addr = this.create_path(servAddr)
        return path_addr + `?per_page=${per_page}&page=${page_no}`
    },
    make_url_from_path(path_addr, page_no, per_page) {
        return path_addr + `?per_page=${per_page}&page=${page_no}`
    },
    get_firstpage() {
        const url = this.make_url_from_scratch(this.address, 1, 3)
        this.fetch_page_by_url(url)
    },
    fetch_page_by_url(url) {
        server_obj = this
        $.ajax({
            url: url,
            type: 'get',
            dataType: 'json',
            contentType: 'application/json',
            error: function(xhr, status, error) {
                var err = xhr.responseText;
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
                    .attr("class", "column.is-xs-12.is-lg-4")
                    .html(d => `<span class="number">${d.id}</span>` + d.name)

                // add pagination
                // calculate upper and lower range
                half_range = 3
                pg_low = (data.current_page <= half_range) ? 1 : data.current_page - half_range;
                pg_top = pg_low + half_range * 2;
                pg_top = (pg_top > data.last_page) ? data.last_page : pg_top;
                rem_pages = data.last_page - data.current_page
                if (rem_pages < half_range) pg_low -= (half_range - rem_pages);
                if (pg_low <= 0) pg_low = 1

                // these lines of codes makes array of {url,label} object for each page
                pages_range = [
                    { url: data.first_page_url, label: "<<" },
                    { url: data.prev_page_url, label: "<" },
                    ...range(pg_low, pg_top,
                        page_no => server_obj.make_url_from_path(
                            data.path, page_no, data.per_page
                        )),
                    { url: data.next_page_url, label: ">" },
                    { url: data.last_page_url, label: ">>" }
                ]

                // add pagination to DOM
                div_pages = d3.select("#pages_links")
                div_pages.selectAll("a")
                    .data(pages_range)
                    .join("a")
                    .attr("class", d => (d.label == data.current_page) ? "active_page" : "")
                    .text(d => d.label)
                    .on("click", function(d, i) {
                        server_obj.fetch_page_by_url(d.url)
                    });
            }
        });

    },
    open() {

    }
}

function* range(a, b, url_generator) {
    for (i = a; i <= b; i++) {
        yield {
            url: url_generator(i),
            label: i
        };
    }
}

half_range = 5
pg_low = (data.current_page < 5) ? 1 : data.current_page - half_range;
pg_top = pg_low + half_range * 2;
pg_top = (pg_top > data.total) ? data.total : pg_top;
[...range(pg_low, pg_top)]


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