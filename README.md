# gpt.robino.dev

A progressively enhanced openai [ChatGPT](https://ai.com) wrapper.

Requests time out at 10 seconds due to vercel hobby plan limits.

[gpt.robino.dev](https://gpt.robino.dev)

## Features

- Free - no API key required
- Works without JavaScript
- When dialog approaches the [max token size](https://platform.openai.com/docs/models), older messages are summarized by GPT to shorter lengths
- Returns readable answers in markdown
- Use the "system" role to set context
- Use the "system" role scrape a website's text content - scripts, images, and line breaks are removed
- Stores history in session storage using a SvelteKit snapshot

## Keyboard Shortcuts

- Space: focuses message input
- ArrowRight / ArrowLeft: changes role
- Escape: clears conversation

## Run locally

- Clone repo to local machine
- Create a `.env` file and add your `OPENAI_API_KEY`
- `npm install`
- `npm run dev -- --open`

## LICENSE

MIT
