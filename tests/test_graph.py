from unittest.mock import MagicMock

import pytest
from langchain_core.documents import Document

import app.graph as graph


# ============================================================
# HELPERS
# ============================================================

def make_document(text="Quantum computing uses qubits and quantum gates."):
    return Document(
        page_content=text,
        metadata={
            "document_id": "research_report.pdf",
            "source": "research_report.pdf",
            "page": 1,
            "relevance_score": 0.75,
        },
    )


def mock_llm_response(content):
    response = MagicMock()
    response.content = content
    return response


# ============================================================
# RETRIEVE NODE
# ============================================================

def test_retrieve_node_with_document(monkeypatch):

    expected_docs = [make_document()]

    monkeypatch.setattr(
        graph,
        "retrieve",
        lambda question, document_id: expected_docs,
    )

    state = {
        "student_question": "What is quantum computing?",
        "document_id": "research_report.pdf",
    }

    result = graph.retrieve_node(state)

    assert "context" in result
    assert len(result["context"]) == 1
    assert result["context"][0].page_content.startswith(
        "Quantum computing"
    )


def test_retrieve_node_without_document():

    state = {
        "student_question": "What is TCP?"
    }

    result = graph.retrieve_node(state)

    assert result["context"] == []


# ============================================================
# GRADE NODE
# ============================================================

def test_grade_node_full_relevance(monkeypatch):

    fake_response = mock_llm_response(
        '{"relevance": "full"}'
    )

    mock_llm = MagicMock()
    mock_llm.invoke.return_value = fake_response

    monkeypatch.setattr(graph, "llm", mock_llm)

    state = {
        "student_question": "What is quantum computing?",
        "context": [make_document()],
    }

    result = graph.grade_node(state)

    assert result["relevance"] == "full"
    mock_llm.invoke.assert_called_once()


def test_grade_node_partial_relevance(monkeypatch):

    fake_response = mock_llm_response(
        '{"relevance": "partial"}'
    )

    mock_llm = MagicMock()
    mock_llm.invoke.return_value = fake_response

    monkeypatch.setattr(graph, "llm", mock_llm)

    state = {
        "student_question": "Explain quantum computing and its cost.",
        "context": [make_document()],
    }

    result = graph.grade_node(state)

    assert result["relevance"] == "partial"


def test_grade_node_accepts_fenced_json(monkeypatch):

    fake_response = mock_llm_response(
        '```json\n{\n  "relevance": "partial"\n}\n```'
    )

    mock_llm = MagicMock()
    mock_llm.invoke.return_value = fake_response

    monkeypatch.setattr(graph, "llm", mock_llm)

    state = {
        "student_question": "What is this report about?",
        "context": [make_document()],
    }

    result = graph.grade_node(state)

    assert result["relevance"] == "partial"


def test_grade_node_none_when_no_context():

    state = {
        "student_question": "What is TCP?",
        "context": [],
    }

    result = graph.grade_node(state)

    assert result["relevance"] == "none"


def test_grade_node_invalid_json_defaults_to_none(monkeypatch):

    fake_response = mock_llm_response(
        "This is not valid JSON"
    )

    mock_llm = MagicMock()
    mock_llm.invoke.return_value = fake_response

    monkeypatch.setattr(graph, "llm", mock_llm)

    state = {
        "student_question": "What is quantum computing?",
        "context": [make_document()],
    }

    result = graph.grade_node(state)

    assert result["relevance"] == "none"


def test_grade_node_invalid_relevance_defaults_to_none(monkeypatch):

    fake_response = mock_llm_response(
        '{"relevance": "invalid"}'
    )

    mock_llm = MagicMock()
    mock_llm.invoke.return_value = fake_response

    monkeypatch.setattr(graph, "llm", mock_llm)

    state = {
        "student_question": "What is quantum computing?",
        "context": [make_document()],
    }

    result = graph.grade_node(state)

    assert result["relevance"] == "none"


# ============================================================
# ROUTING
# ============================================================

@pytest.mark.parametrize(
    "relevance, expected_route",
    [
        ("full", "generate"),
        ("partial", "generate"),
        ("none", "web_search"),
    ],
)
def test_route_after_grading(relevance, expected_route):

    state = {
        "relevance": relevance
    }

    assert graph.route_after_grading(state) == expected_route


# ============================================================
# GENERATE NODE
# ============================================================

def test_generate_node(monkeypatch):

    fake_response = mock_llm_response(
        "Quantum computing uses qubits."
    )

    mock_llm = MagicMock()
    mock_llm.invoke.return_value = fake_response

    monkeypatch.setattr(graph, "llm", mock_llm)

    state = {
        "student_question": "What is quantum computing?",
        "context": [make_document()],
    }

    result = graph.generate_node(state)

    assert result["student_answer"] == (
        "Quantum computing uses qubits."
    )

    mock_llm.invoke.assert_called_once()