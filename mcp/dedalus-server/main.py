"""Run a Dedalus Labs workflow that composes MCP servers."""

from __future__ import annotations

import argparse
import asyncio
from typing import List

from dedalus_labs import AsyncDedalus, DedalusRunner
from dotenv import load_dotenv

DEFAULT_PROMPT = (
    "I need to research the latest developments in AI agents for 2024.\n"
    "Please help me:\n"
    "1. Find recent news articles about AI agent breakthroughs\n"
    "2. Search for academic papers on multi-agent systems\n"
    "3. Look up startup companies working on AI agents\n"
    "4. Find GitHub repositories with popular agent frameworks\n"
    "5. Summarize the key trends and provide relevant links\n\n"
    "Focus on developments from the past 6 months."
)

DEFAULT_MODEL = "openai/gpt-4.1"
DEFAULT_SERVERS = [
    "joerup/exa-mcp",  # Semantic search engine
    "windsor/brave-search-mcp",  # Privacy-focused web search
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Execute the Dedalus automation recipe that composes multiple MCP "
            "servers to research recent AI agent developments."
        )
    )
    parser.add_argument(
        "--prompt",
        default=DEFAULT_PROMPT,
        help="Override the default research prompt.",
    )
    parser.add_argument(
        "--model",
        default=DEFAULT_MODEL,
        help="Select the model identifier used by Dedalus.",
    )
    parser.add_argument(
        "--server",
        action="append",
        dest="servers",
        help="Repeat to specify the MCP servers to include in the run.",
    )
    return parser.parse_args()


async def run(prompt: str, model: str, servers: List[str]) -> None:
    """Execute the Dedalus workflow and print the final output."""
    load_dotenv()

    client = AsyncDedalus()
    runner = DedalusRunner(client)

    result = await runner.run(
        input=prompt,
        model=model,
        mcp_servers=servers,
    )

    print(f"Web Search Results:\n{result.final_output}")


async def main() -> None:
    args = parse_args()
    servers = args.servers or DEFAULT_SERVERS
    await run(args.prompt, args.model, servers)


if __name__ == "__main__":
    asyncio.run(main())
