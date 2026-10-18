"""
mcp_server/web_search_node.py

LangGraph-compatible node that calls the local MCP server's ``web_search``
tool and appends the results to the CRAG pipeline's ``context`` list.
"""

from __future__ import annotations

import asyncio
import concurrent.futures
import json
import logging

from langchain_core.documents import Document


logger = logging.getLogger("mcp_server.web_search_node")


# ---------------------------------------------------------------------------
# MCP server configuration
# ---------------------------------------------------------------------------

MCP_SERVER_URL = "http://127.0.0.1:8001/mcp"

DEFAULT_MAX_RESULTS = 3


# ---------------------------------------------------------------------------
# MCP web search call
# ---------------------------------------------------------------------------

async def _call_mcp_web_search(
    query: str,
    max_results: int = DEFAULT_MAX_RESULTS,
    server_url: str = MCP_SERVER_URL,
) -> list[dict]:
    """Connect to the local MCP server and invoke the web_search tool."""

    try:
        from fastmcp import Client
        from fastmcp.client.transports import StreamableHttpTransport

    except ImportError:
        logger.error(
            "fastmcp is not installed. "
            "Install it with: pip install fastmcp==3.4.6"
        )
        return []

    transport = StreamableHttpTransport(
        url=server_url
    )

    client = Client(transport)

    try:
        async with client:

            result = await client.call_tool(
                "web_search",
                {
                    "query": query,
                    "max_results": max_results,
                },
            )

            raw = None

            if hasattr(result, "data") and result.data:
                raw = result.data

            elif hasattr(result, "content"):

                for block in (result.content or []):

                    text = getattr(
                        block,
                        "text",
                        None,
                    )

                    if text:
                        raw = text
                        break

            if raw is None:
                logger.warning(
                    "Empty MCP result for query=%r",
                    query,
                )
                return []

            if isinstance(raw, str):
                return json.loads(raw)

            if isinstance(raw, list):
                return raw

            logger.warning(
                "Unexpected MCP data type: %s",
                type(raw),
            )

            return []

    except ConnectionError:

        logger.warning(
            "Could not connect to MCP server at %s. "
            "Is it running? Start it with: "
            "python -m mcp_server.server",
            server_url,
        )

        return []

    except Exception:

        logger.exception(
            "MCP web_search call failed"
        )

        return []


# ---------------------------------------------------------------------------
# Async LangGraph node
# ---------------------------------------------------------------------------

async def _async_web_search_node(
    state: dict,
) -> dict:
    """Async LangGraph node that performs a web search via MCP."""

    print("\n--- WEB SEARCH (MCP) ---")

    question = state.get(
        "student_question",
        "",
    )

    existing_context = state.get(
        "context",
        [],
    )

    logger.info(
        "MCP web_search_node invoked for question=%r",
        question,
    )

    search_results = await _call_mcp_web_search(
        question
    )

    if not search_results:

        logger.info(
            "No web results returned; keeping existing context"
        )

        return {
            "context": existing_context,
        }

    web_documents: list[Document] = []

    for item in search_results:

        snippet = item.get(
            "snippet",
            "",
        )

        if snippet:

            web_documents.append(
                Document(
                    page_content=f"Web result: {snippet}",
                    metadata={
                        "source": item.get(
                            "url",
                            "web",
                        ),
                        "title": item.get(
                            "title",
                            "",
                        ),
                    },
                )
            )

    logger.info(
        "MCP web_search_node appending %d web documents",
        len(web_documents),
    )

    return {
        "context": existing_context + web_documents,
    }


# ---------------------------------------------------------------------------
# Synchronous LangGraph wrapper
# ---------------------------------------------------------------------------

def web_search_node(
    state: dict,
) -> dict:
    """Synchronous LangGraph node.

    Runs the async MCP client using asyncio.run().
    If an event loop is already running, the coroutine
    is executed in a separate thread.
    """

    try:

        return asyncio.run(
            _async_web_search_node(state)
        )

    except RuntimeError:

        with concurrent.futures.ThreadPoolExecutor(
            max_workers=1
        ) as pool:

            future = pool.submit(
                asyncio.run,
                _async_web_search_node(state),
            )

            return future.result(
                timeout=30
            )