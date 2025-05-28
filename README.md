# gpt

[gpt.robino.dev](https://gpt.robino.dev)

In contrast to most GPT wrappers, this project does not require any client-side JavaScript. I think it's an interesting example of how far you can get using modern browser HTML and CSS features.

- Form submissions to submit messages
- Streams HTML in order with the chat response
- CSS cross document view transitions for animations
- Server-side markdown rendering with syntax highlighting

## Run locally

- Clone repo to local machine
- Create a `.env` file and add your `OPENAI_API_KEY`, for browser rendering add both `CF_API_KEY` and `CF_ACCOUNT_ID`
- `npm i`
- `npm run dev`
