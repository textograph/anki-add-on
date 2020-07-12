{{Settings}}
json_data = {{TestGraph}};
graph_data.setData(json_data);
graph_data.setNotes({{Notes}});
drawer = chart_tree;
json = graph_data.stratify();
refresh_view();
