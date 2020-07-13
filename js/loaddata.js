json_data = {
    "id": 0,
    "name": "Reactive arthritis",
    "children": [{
        "id": 1,
        "name": "EPIDEMIOLOGY",
        "children": [{
            "id": 2,
            "name": " rare disease",
            "children": []
        }, {
            "id": 3,
            "name": "young adults",
            "children": []
        }, {
            "id": 4,
            "name": "both men and women",
            "children": []
        }, {
            "id": 5,
            "name": "incidence",
            "children": [{
                "id": 6,
                "name": "highly heterogeneous",
                "children": []
            }]
        }, {
            "id": 7,
            "name": "enteric bacterial infections",
            "children": [{
                "id": 8,
                "name": "Campylobacter",
                "children": [{
                    "id": 9,
                    "name": "Salmonella",
                    "children": []
                }]
            }, {
                "id": 10,
                "name": "Salmonella",
                "children": []
            }, {
                "id": 11,
                "name": "Shigella",
                "children": []
            }]
        }, {
            "id": 12,
            "name": "sporadically",
            "children": []
        }, {
            "id": 13,
            "name": "outbreaks",
            "children": []
        }]
    }, {
        "id": 14,
        "name": "causative pathogens",
        "children": []
    }]
};

pycmd = function(str) {

}
graph_data.setData(json_data);
drawer = chart_tree;
json = graph_data.stratify();
show_quiz_leaves.checked = true;
refresh_view([3, 4]);