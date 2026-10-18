"""Execution metrics for the AI Tutor Agent."""

from __future__ import annotations

import time
from typing import Dict


def start_timer() -> float:
    """Start a high-resolution timer."""
    return time.perf_counter()


def elapsed_ms(start_time: float) -> float:
    """Return elapsed time in milliseconds."""
    return round((time.perf_counter() - start_time) * 1000, 2)


def create_metrics() -> Dict[str, float]:
    """Create an empty execution metrics dictionary."""
    return {
        "total_ms": 0.0,
        "retrieve_ms": 0.0,
        "grade_ms": 0.0,
        "web_search_ms": 0.0,
        "generate_ms": 0.0,
        "prompt_tokens": 0,
        "completion_tokens": 0,
        "total_tokens": 0,
    }


def add_token_usage(metrics: Dict[str, float], response) -> Dict[str, float]:
    """Add one LLM response's token counts onto the running totals."""
    usage = getattr(response, "usage_metadata", None) or {}
    if not usage:
        meta = getattr(response, "response_metadata", None) or {}
        usage = meta.get("usage_metadata") or meta.get("token_usage") or {}

    prompt = int(usage.get("input_tokens") or usage.get("prompt_tokens") or 0)
    completion = int(
        usage.get("output_tokens") or usage.get("completion_tokens") or 0
    )
    total = int(usage.get("total_tokens") or (prompt + completion))

    updated = dict(metrics)
    updated["prompt_tokens"] = int(updated.get("prompt_tokens", 0)) + prompt
    updated["completion_tokens"] = int(updated.get("completion_tokens", 0)) + completion
    updated["total_tokens"] = int(updated.get("total_tokens", 0)) + total
    return updated