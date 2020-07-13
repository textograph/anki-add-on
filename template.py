import os
import re

TG_FIELDS = {
    'cloze': 'AnswerGraph',
    'grph': 'TestGraph',
    'grph_notes': 'Notes',
    'txt': 'Text',
    'stngs': 'Settings',
}

txt_load_fields_ = """
{{{{{stngs}}}}}
{{{{cloze::{cloze}}}}}
{{{{{grph}}}}}
{{{{{grph_notes}}}}}
"""
txt_load_fields ="""
<script>
    exeption_nodes = [] 
    {{{{{stngs}}}}}
    sub_answer = []
</script>
{{{{cloze::{cloze}}}}}
<script>
sub_answer.forEach(function(element, index) {{
    exeption_nodes.push(...element)
	pycmd("save_cloze_id_"+index)
}});

json_data = {{{{{grph}}}}};
graph_data.setData(json_data);
graph_data.setNotes({{{{{grph_notes}}}}});
drawer = chart_tree;
json = graph_data.stratify();
show_quiz_leaves.checked={isAnswer};
refresh_view(exeption_nodes);
</script>
"""

def get_css() -> str:
    css_files = [
        'd3-tip.css',
        'slider.css',
        'style.css',
    ]
    return concat_files(css_files, 'css')


def create_frontside(fields: dict = TG_FIELDS) -> str:
    html = common_template()
    return  html + txt_load_fields.format(isAnswer=True, **fields)


def create_backside(fields: dict = TG_FIELDS) -> str:
    html = common_template()
    return  html + txt_load_fields.format(isAnswer=False, **fields)


def common_template():
    js_files = [
        'jquery-3.5.1.min.js',
        'd3.v5.min.js',
        'd3-tip.min.js',
        'graphdata.js',
        'slider.js',
        'chart.js',
        'collapsible_tree.js',
        'toolbar.js',
    ]
    js = "<script>%s</script>" % concat_files(js_files, 'js')
    html = concat_files(['anki_AIO.html'])
    regex = r"<body>(.*</div>)"
    match = re.search(regex, html, re.MULTILINE | re.DOTALL)
    html = match.group(1) + js
    return html


def concat_files(files: list, subfolder: str = "") -> str:
    base_dir = os.path.join(os.path.dirname(__file__), 'html', subfolder)
    css = ""
    for file_name in files:
        with open(os.path.join(base_dir, file_name), 'r') as file:
            css += file.read()
    return css
#
# a = create_backside()
# pass
