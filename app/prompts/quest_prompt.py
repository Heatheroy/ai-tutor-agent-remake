QUEST_PROMPT = """
You turn a study document into a short RPG learning quest.

Document name: {name}

Classify the document as exactly one genre:
- "research" for papers, experiments, or technical research
- "teaching" for textbooks, lectures, or lessons
- "exam" for tests, problem sets, or exam preparation

Then build the quest from the context only.

Return ONLY a valid JSON object with:
- "title": a short quest name
- "genre": "research", "teaching", or "exam"
- "areas": 3 to 5 exploration areas, in reading order
- "boss": exactly 5 questions

Each area:
- "title": chapter or theme name
- "summary": one sentence describing the area
- "tasks": exactly 2 tasks

Each task:
- "concept": the core idea, at most 8 words
- "q": one multiple-choice question about that concept
- "options": exactly 4 distinct choices
- "answer": one of the options, copied exactly
- "why": one short explanation

Each boss question uses the same q, options, answer, and why fields.
Boss questions must combine ideas from more than one area and must not repeat task questions.

Write the title, area titles, summaries, concepts, questions, options, and explanations in Chinese.
Keep formulas, symbols, numbers, variable names, and established algorithm names in their original form. Do not translate those.

Context:
{context}
"""
