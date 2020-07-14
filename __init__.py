'''
COPYRIGTH Abdolmahdi Saravi 2020(amsaravi at yahoo.com)
APACHE 2 Licence
'''

import aqt
from anki.consts import MODEL_CLOZE
from aqt import gui_hooks
from aqt.utils import showInfo, showCritical

from .template import TG_FIELDS
from . import template
import re

Textograph_MODEL_NAME = "Textograph"
Textograph_CARD_NAME = 'Textograph Card'
TG_MODEL_VERSION = {'major': 1, 'minor': 1}
TG_STR_VERSION = f"{TG_MODEL_VERSION['major']}.{TG_MODEL_VERSION['minor']}"

'''
IMPORTANT:  I wish anki does not change its aqt.mw.reviewer.card object, otherwise every thing will broke
            and i should define my own global variable
            I used model[ver] to save model version. it may break if anki changes its model saving behaviour
            saving version in model js and interacting with addon by pycmd is another way of note type version saving
'''


def js_msg(handled, msg, context):

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

        m = the_card.model()
        try:
            v_major, v_minor = m['ver'].split(".")
            ver_dif = int(TG_MODEL_VERSION['major']) - int(v_major)
            if ver_dif < 0:
                showCritical("""this note works with newer Textograph Version.
                so we can not create new Card.update Textograph Add-on first then try again
                """)
                return
        except (ValueError, NameError, KeyError):
            showCritical("there was an error with this note type. if it happens with newly created notes "
                         "please contact add-on author")

        cur_shown_leafs = ""
        cloz_fld_name = TG_FIELDS['cloze']
        txt_cloze_field = the_card.note()[cloz_fld_name]
        match_str = r"(sub_answer\[" + the_card.cloze_id + r"\]\s=\s\[(.*?))\];"
        match = re.search(match_str, txt_cloze_field, re.MULTILINE | re.DOTALL)

        if match:
            cur_shown_leafs = match.group(2)
            sub_cloze = match.group(1)
        else:
            sub_cloze = "sub_answer[1] = ["
            txt_cloze_field = f"""<script id="main">
            {sub_cloze}];
            </script>
            {{{{c1::<script>delete sub_answer[1]</script>}}}}"""

        # remove difficult leafs from current card
        # sub_question is a temp card_obj property that introduced by me for saving interactions

        arr_index, clz_index = get_indices(txt_cloze_field)

        # change this card
        repl_str = sub_cloze + ", ".join(the_card.sub_questions) + ","
        txt_cloze_field = txt_cloze_field.replace(sub_cloze, repl_str)

        # add new card
        match_str = r"<script id=\"main\">(.*?)<\/script>"
        repl_str = r'<script id="main">\1sub_answer[{id}] = [{values},];\n</script>'
        repl_str = repl_str.format(id=arr_index, values=cur_shown_leafs + ", ".join(the_card.sub_answers))
        new_cloze = "\n{{{{c{id}::<script>delete sub_answer[{id}]</script>}}}}"
        txt_cloze_field = "{0}{1}".format(re.sub(match_str, repl_str, txt_cloze_field,
                                                 count=0, flags=re.MULTILINE | re.DOTALL),
                                          new_cloze.format(id=clz_index))

        the_card.note()[cloz_fld_name] = txt_cloze_field
        the_card.note().flush()
        # sys.stderr.write(txt_cloze_field)


def get_indices(txt_cloze_field):
    # add a new card for difficult leafs by adding new cloze to the note
    array_indexes = [int(i) for i in re.findall(r"sub_answer\[(\d+)\]\s+=",
                                                txt_cloze_field, re.MULTILINE | re.DOTALL)]
    cloze_indexes = [int(i) for i in re.findall(r"{{c(\d+)::.*?}}",
                                                txt_cloze_field, re.MULTILINE | re.DOTALL)]
    # first find last cloze and card number
    new_array_index = max(array_indexes) + 1
    new_cloze_indexes = max(cloze_indexes) + 1
    return new_array_index, new_cloze_indexes


def my_q_show(the_card):
    if the_card is not None:
        the_card.cloze_id = '1'
        the_card.sub_answers = []
        the_card.sub_questions = []


def create_model(mm):
    m = mm.new(Textograph_MODEL_NAME)
    m["type"] = MODEL_CLOZE
    m['ver'] = TG_STR_VERSION

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
    model_versioned_name = f"{Textograph_MODEL_NAME} v{TG_MODEL_VERSION['major']}"
    if not m:
        model_CreateOrRename(mm, model_versioned_name)
        check_note_type()
    else:
        try:
            v_major, v_minor = m['ver'].split(".")
            ver_dif = int(TG_MODEL_VERSION['major']) - int(v_major)
            if ver_dif == 0:
                if int(v_minor) < int(TG_MODEL_VERSION['minor']):
                    # update current model
                    t = m['tmpls'][0]
                    m["css"] += template.get_css()
                    t["qfmt"] = template.create_frontside()
                    t["afmt"] = template.create_backside()
                    m['ver'] = TG_STR_VERSION
                    mm.save()
            else:
                # if there is another model with same version?
                # swap model names in this way:
                # Textograph --> Textograph v1, Textograph v2 ---> Textograph
                m['name'] = f"{Textograph_MODEL_NAME} v{v_major}"
                mm.save(m, updateReqs=False)
                model_CreateOrRename(mm, model_versioned_name)
                check_note_type()   # call again to check for minor version compatibility or other problems
                if ver_dif > 0:
                    showInfo(f"Textograph Note Type changed to version: {TG_STR_VERSION}"
                             f", Previous version was {m['ver']}")
                else:
                    showCritical("Current Textograph model works with new Textograph Add-on version. "
                                 "So Please! update your addon, You can continue to review them but creating new cards "
                                 "from them is not possible. Although you can create new notes ant it works "
                                 "fine with them.")

        except (ValueError, NameError, KeyError):
            showCritical("there was an error when updating note type. renaming these note types may solve the problem:"
                         f"{Textograph_MODEL_NAME} or {model_versioned_name} ")


def model_CreateOrRename(mm, model_name):
    m = mm.byName(model_name)
    if m:
        # just change model names
        m['name'] = Textograph_MODEL_NAME
        mm.save(m, updateReqs=False)
    else:
        # update model
        create_model(mm)


gui_hooks.webview_did_receive_js_message.append(js_msg)
gui_hooks.reviewer_did_show_question.append(my_q_show)
gui_hooks.reviewer_did_answer_card.append(create_new_cloze)
gui_hooks.profile_did_open.append(check_note_type)
