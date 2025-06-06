import type * as z from "@/lib/schema";

export type Dataset = z.infer<ReturnType<typeof z.data>> | null;
