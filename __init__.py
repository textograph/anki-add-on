'''
COPYRIGTH Abdolmahdi Saravi 2020(amsaravi at yahoo.com)
APACHE 2 Licence
'''

import aqt
from anki.consts import MODEL_CLOZE
from aqt import gui_hooks
from aqt.utils import showInfo

from .template import TG_FIELDS
from . import template

'''
IMPORTANT:  I wish anki does not change its aqt.mw.reviewer.card object, otherwise every thing will broke
            and i should define my own global variable
'''
def correct_sub_answer(handled, msg, context):

    if not isinstance(context, aqt.reviewer.Reviewer):
        # not reviewer, pass on message
        return handled
    the_card = aqt.mw.reviewer.card
    if msg.startswith('sub_answer_'):
        leaf_id = msg.replace('sub_answer_', '')
        the_card.sub_answers.append(leaf_id)
        try:
            the_card.sub_questions.remove(leaf_id)
        except (ValueError, AttributeError):
            pass

        # showInfo("a" + ",".join(the_card.sub_answers))
        return True, None
    elif msg.startswith('sub_question_'):
        leaf_id = msg.replace('sub_question_', '')
        the_card.sub_questions.append(leaf_id)
        # showInfo("q" + ",".join(the_card.sub_questions))
        return True, None
    elif msg.startswith('save_cloze_id_'):
        cloze_id = msg.replace('save_cloze_id_', '')
        the_card.cloze_id = cloze_id
        # showInfo(cloze_id)
    return handled


def create_new_cloze(reviewer, the_card, ease):
    if ease != 1 and \
            len(the_card.sub_questions) != 0 and \
            len(the_card.sub_answers) != 0:
        cloze_filed = the_card.note()['AnswerGraph']
        import re
        match_str = r"(sub_answer\[" + the_card.cloze_id + r"\]\s=\s\[(.*?))\];"
        match = re.search(match_str, cloze_filed, re.MULTILINE | re.DOTALL)
        if match:
            cur_shown_leafs = match.group(2)
            # remove difficult leafs from current card
            repl_str = match.group(1) + ", ".join(the_card.sub_questions) + ","
            cloze_filed = cloze_filed.replace(match.group(1), repl_str)
            # cloze_filed = re.sub(str(match.group(1)), repl_str, cloze_filed, count=0, flags=re.MULTILINE | re.DOTALL)

            # add a new card for difficult leafs by adding new cloze to the note
            array_indexes = [int(i) for i in re.findall(r"sub_answer\[(\d+)\]\s+=", cloze_filed, re.MULTILINE | re.DOTALL)]
            cloze_indexes = [int(i) for i in re.findall(r"{{c(\d+)::.*?}}", cloze_filed, re.MULTILINE | re.DOTALL)]
            # first find last cloze and card number
            new_array_index = max(array_indexes) + 1
            new_cloze_indexes = max(cloze_indexes) + 1

            match_str = r"<script id=\"main\">(.*?)<\/script>"
            repl_str = r'<script id="main">\1sub_answer[{id}] = [{values},];\n</script>'
            repl_str = repl_str.format(id=new_array_index, values=cur_shown_leafs + ", ".join(the_card.sub_answers))
            new_cloze = "\n{{{{c{id}::<script>delete sub_answer[{id}]</script>}}}}"

            cloze_filed = re.sub(match_str, repl_str, cloze_filed, count=0, flags=re.MULTILINE | re.DOTALL) + \
                            new_cloze.format(id=new_cloze_indexes)
            the_card.note()['AnswerGraph'] = cloze_filed
            the_card.note().flush()
            # sys.stderr.write(cloze_filed)
        else:
            raise Exception("somethong goes wrong")


def my_q_show(the_card):
    if the_card is not None:
        the_card.sub_answers = []
        the_card.sub_questions = []


def create_model(mm):
    m = mm.new(Textograph_MODEL_NAME)
    m["type"] = MODEL_CLOZE
    m['ver'] = MODEL_VERSION

    if m:
        for i in TG_FIELDS:
            new_fld = mm.newField(TG_FIELDS[i])
            mm.addField(m, new_fld)
        t = mm.newTemplate(Textograph_CARD_NAME)

        m["css"] += template.get_css()
        t["qfmt"] = template.create_frontside()
        t["afmt"] = template.create_backside()

        mm.addTemplate(m, t)
        mm.add(m)


def check_note_type():
    mm = aqt.mw.col.models
    m = mm.byName(Textograph_MODEL_NAME)
    if not m:
        create_model(mm)
    else:
        try:
            if m['ver'] != MODEL_VERSION:
                showInfo("Textograph Note Type changed to version: " + MODEL_VERSION + ", Previous version was" + m['ver'])
                t = m['tmpls'][0]
                m["css"] += template.get_css()
                t["qfmt"] = template.create_frontside()
                t["afmt"] = template.create_backside()
                m['ver'] = MODEL_VERSION
                mm.save()
        except (ValueError, NameError):
            pass



Textograph_MODEL_NAME = "Textograph 1"
Textograph_CARD_NAME = 'Textograph Card'
MODEL_VERSION = "1"

gui_hooks.webview_did_receive_js_message.append(correct_sub_answer)
gui_hooks.reviewer_did_show_question.append(my_q_show)
gui_hooks.reviewer_did_answer_card.append(create_new_cloze)
gui_hooks.profile_did_open.append(check_note_type)
