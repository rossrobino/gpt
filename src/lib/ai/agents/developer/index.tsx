import instructions from "@/lib/ai/agents/developer/instructions.md?raw";
import * as z from "@/lib/schema";
import type { FunctionOutput } from "@/lib/types";
import { GrepResults } from "@/ui/grep-result";
import { Agent, tool } from "@openai/agents-core";
import * as ovr from "ovr";
import * as z3 from "zod";

const GrepSchema = z
	.object({
		facets: z.object({
			repo: z.object({ buckets: z.array(z.object({ val: z.string() })) }),
		}),
		hits: z.object({
			hits: z.array(
				z.object({
					id: z.object({ raw: z.string() }),
					content: z.object({ snippet: z.string() }),
				}),
			),
		}),
	})
	.loose();

export const create = () =>
	new Agent({
		name: "Software Developer",
		model: "gpt-4.1-mini",
		instructions,
		handoffDescription:
			"Excellent at programming and coding, aware of language best practices and modern features. Able to search GitHub using grep.",
		tools: [
			tool({
				name: "grep",
				description:
					"Quickly search public GitHub repositories with a regular expression.",
				parameters: z3.object({ regexPattern: z3.string() }),
				execute: async ({ regexPattern }): Promise<FunctionOutput> => {
					const grepUrl = new URL("https://grep.app/api/search");
					grepUrl.searchParams.set("regexp", "true");
					grepUrl.searchParams.set("q", regexPattern);

					const res = await fetch(grepUrl);
					const { data, error } = GrepSchema.safeParse(await res.json());

					if (!res.ok || !data) {
						return {
							error: { message: "Unable to fetch/parse from Grep.", error },
						};
					}

					const repos = data.facets.repo.buckets
						.map((item) => item.val)
						.slice(0, 5);

					const allPromises = repos.map(async (repo) => {
						grepUrl.searchParams.set("f.repo", repo);

						const res = await fetch(grepUrl);
						const { data } = GrepSchema.safeParse(await res.json());

						if (!res.ok || !data) return null;

						const promises = data.hits.hits.slice(0, 2).map(async (hit) => {
							const { id, content } = hit;
							const [, user, repo, ...rest] = id.raw.split("/");
							const githubUrl = new URL("https://raw.githubusercontent.com");
							githubUrl.pathname = `${user}/${repo}/refs/heads/${rest.join("/")}`;

							const res = await fetch(githubUrl);
							if (!res.ok) return null;
							const code = await res.text();

							const lineNumberMatch =
								content.snippet.match(/data-line="(\d+)"/);
							return {
								repo: `${user}/${repo}`,
								url: `https://github.com${githubUrl.pathname.replace("refs/heads", "blob")}#L${lineNumberMatch?.at(1)}`,
								code,
							};
						});

						const settled = await Promise.allSettled(promises);
						return settled
							.map((v) => {
								if (v.status === "fulfilled") {
									if (v.value?.code) {
										v.value.code = ovr.escape(v.value.code);
										return v.value;
									}
								}

								return null;
							})
							.filter(Boolean);
					});

					const allSettled = await Promise.allSettled(allPromises);

					const grouped = Object.groupBy(
						allSettled
							.map((result) => {
								if (result.status === "fulfilled") {
									return result.value;
								}

								return null;
							})
							.flat()
							.filter(Boolean),
						(item) => {
							if (item?.repo) {
								return item.repo;
							} else return "nope";
						},
					) as { [key: string]: { code: string; url: string; repo: string }[] };

					const result = Object.entries(grouped).map(([repo, items]) => {
						return {
							repo,
							code: items.map((item) => item.code),
							urls: items.map((item) => item.url),
						};
					});

					const summary = await ovr.toString(
						<GrepResults results={result} pattern={regexPattern} />,
					);

					return { result, summary };
				},
			}),
		],
	});
