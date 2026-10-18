from app.ui import backend


def question(text, answer="Alpha"):
    return {
        "q": text,
        "options": ["Alpha", "Beta", "Gamma", "Delta"],
        "answer": answer,
        "why": "Because the document says so.",
    }


def test_normalize_quest_keeps_valid_line():
    raw = {
        "title": "Paper Trail",
        "genre": "科研",
        "areas": [
            {
                "title": f"Area {index}",
                "summary": "A theme.",
                "tasks": [
                    {"concept": f"Concept {index}-1", **question(f"Q {index}-1")},
                    {"concept": f"Concept {index}-2", **question(f"Q {index}-2", "Beta")},
                ],
            }
            for index in range(1, 4)
        ],
        "boss": [question(f"Boss {index}") for index in range(1, 6)],
    }

    quest = backend._normalize_quest(raw)

    assert quest["genre"] == "research"
    assert len(quest["areas"]) == 3
    assert quest["areas"][0]["tasks"][1]["id"] == "area-1-task-2"
    assert len(quest["boss"]) == 5


def test_normalize_quest_rejects_short_boss():
    raw = {
        "genre": "teaching",
        "areas": [
            {
                "title": f"Area {index}",
                "summary": "A lesson.",
                "tasks": [
                    {"concept": "One", **question("Q1")},
                    {"concept": "Two", **question("Q2")},
                ],
            }
            for index in range(3)
        ],
        "boss": [question("Only one")],
    }

    assert backend._normalize_quest(raw) is None
