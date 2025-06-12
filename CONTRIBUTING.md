# Contributing

Contributions are welcome. You can contribute code, or prompts/instructions to make the agents perform better.

If you have an idea please create an issue to discuss.

## Setup

You'll need Node and git installed on your computer to develop locally.

```bash
git clone https://github.com/rossrobino/ai6.git
cd ai6
touch .env # add your OPENAI_API_KEY="..."
npm i
npm run dev
```

For [Browser Rendering](https://developers.cloudflare.com/browser-rendering/) add both `CF_API_KEY` and `CF_ACCOUNT_ID` to `.env` as well.

## Agents

To create a new agent, copy the `src/lib/ai/assistant/` directory and modify it. Then, you'll need to add it to the `triage` agent's `handoffs` array.
