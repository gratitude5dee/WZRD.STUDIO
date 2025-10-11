# Dedalus Labs MCP Runner

This example demonstrates how to execute a Dedalus Labs workflow that composes
multiple Model Context Protocol (MCP) servers.  It is a lightweight helper for
running the automation showcased in the prompt shared by the Dedalus team.

## Prerequisites

- Python 3.10+
- A Dedalus Labs account and API key
- (Optional) A `.env` file with the environment variable `DEDALUS_API_KEY`

Install the dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Usage

Run the script with the default research prompt:

```bash
python main.py
```

You can customize the Dedalus prompt, model, or MCP servers:

```bash
python main.py \
  --prompt "Summarize the latest breakthroughs in quantum computing" \
  --model openai/gpt-4.1 \
  --server joerup/exa-mcp \
  --server windsor/brave-search-mcp
```

## Environment configuration

The script loads environment variables via [`python-dotenv`](https://saurabh-kumar.com/python-dotenv/).
Create a `.env` file in this directory that includes your Dedalus credentials:

```env
DEDALUS_API_KEY=sk-...
```

Refer to the [Dedalus Labs documentation](https://docs.dedaluslabs.ai/) for the
full list of supported configuration options and API key scopes.
