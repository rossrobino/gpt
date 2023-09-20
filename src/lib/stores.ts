import { persisted } from "svelte-local-storage-store";

export const localInstructions = persisted("localInstructions", "");
