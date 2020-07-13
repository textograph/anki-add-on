
// this file is no longer used and implemented within python app
exeption_nodes = [] 
{{Settings}}
sub_answer = []
</script>
{{cloze::AnswerGraph}}
<script>

sub_answer.forEach(function(element, index) {
    exeption_nodes.push(...element)
	pycmd("save_cloze_id_"+index)
});

json_data = {{TestGraph}};
graph_data.setData(json_data);
graph_data.setNotes({{Notes}});
drawer = chart_tree;
json = graph_data.stratify();
refresh_view(exeption_nodes);


