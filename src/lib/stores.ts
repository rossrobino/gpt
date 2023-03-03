import type { ChatCompletionRequestMessage } from "openai";
import { persisted } from "svelte-local-storage-store";

export const dialog = persisted("dialog", [] as ChatCompletionRequestMessage[]);
