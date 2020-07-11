from pprint import pp

import aqt
from aqt import gui_hooks
from aqt.utils import showInfo


def correct_sub_answer(handled, msg, context):

    if not isinstance(context, aqt.reviewer.Reviewer):
        # not reviewer, pass on message
        return handled
    the_card = aqt.mw.reviewer.card
    if msg.startswith('sub_answer_'):
        leaf_id = msg.replace('sub_answer_', '')
        if not hasattr(the_card, 'sub_answers'):
            the_card.sub_answers = []
        the_card.sub_answers.append(leaf_id)
        try:
            the_card.sub_questions.remove(leaf_id)
        except (ValueError, AttributeError):
            pass

        # showInfo("a" + ",".join(the_card.sub_answers))
        return True, None
    elif msg.startswith('sub_question_'):
        leaf_id = msg.replace('sub_question_', '')
        if not hasattr(the_card, 'sub_questions'):
            the_card.sub_questions = []
        the_card.sub_questions.append(leaf_id)
        # showInfo("q" + ",".join(the_card.sub_questions))
        return True, None
    elif msg.startswith('save_cloze_id_'):
        cloze_id = msg.replace('save_cloze_id_', '')
        the_card.cloze_id = cloze_id
        # showInfo(cloze_id)
    return handled


def clean_selected(*arg):
    the_card = aqt.mw.reviewer.card
    if the_card is not None:
        the_card.sub_answers = []
        the_card.sub_questions = []


def create_new_cloze(reviewer, card, ease):
    if ease>1 and len(aqt.mw.reviewer.card.sub_questions)>1:
        showInfo("we must do something")
#
# def my_q_show(the_card):
#     the_card = aqt.mw.reviewer.card
#     if not hasattr(the_card, 'sub_answers'):
#         the_card.sub_answers = []


gui_hooks.webview_did_receive_js_message.append(correct_sub_answer)
gui_hooks.reviewer_will_end.append(clean_selected)
# gui_hooks.reviewer_did_show_question.append(my_q_show)
gui_hooks.editor_did_load_note.append(clean_selected)
gui_hooks.reviewer_did_answer_card.append(create_new_cloze)