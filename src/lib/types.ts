import type * as z from "@/lib/schema";

export type Dataset = z.infer<ReturnType<typeof z.data>> | null;

export type FunctionOutput = z.infer<ReturnType<typeof z.functionOutput>>;
