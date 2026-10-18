MEMORY_PROMPT = """
You create memory-match pairs from a study document.

Document name: {name}
Create exactly {count} pairs.

Each pair must contain:
- "term": a short key term or concept taken from the document (at most 8 words)
- "definition": one sentence explaining that term from the document (at most 30 words)

Rules:
- Use only the document context below.
- Every term must be unique.
- A term and its definition must not be the same text.

Return ONLY a valid JSON array.

Example:
[
  {{
    "term": "Process",
    "definition": "A process is a program in execution."
  }}
]

Context:
{context}
"""
