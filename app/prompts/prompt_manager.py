from app.prompts.grader_prompt import GRADER_PROMPT
from app.prompts.generator_prompt import GENERATOR_PROMPT
from app.prompts.quiz_prompt import QUIZ_PROMPT
from app.prompts.flashcard_prompt import FLASHCARD_PROMPT
from app.prompts.mindmap_prompt import MINDMAP_PROMPT
from app.prompts.memory_prompt import MEMORY_PROMPT
from app.prompts.quest_prompt import QUEST_PROMPT

class PromptManager:
    """
    Manages all prompt templates used in the AI Tutor Agent.
    """

    @staticmethod
    def get_grader_prompt():
        return GRADER_PROMPT

    @staticmethod
    def get_generator_prompt():
        return GENERATOR_PROMPT

    @staticmethod
    def get_quiz_prompt():
        return QUIZ_PROMPT

    @staticmethod
    def get_flashcard_prompt():
        return FLASHCARD_PROMPT

    @staticmethod
    def get_mindmap_prompt():
        return MINDMAP_PROMPT

    @staticmethod
    def get_memory_prompt():
        return MEMORY_PROMPT

    @staticmethod
    def get_quest_prompt():
        return QUEST_PROMPT
