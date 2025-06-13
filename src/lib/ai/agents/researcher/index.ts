import { toMdCodeBlock } from "@/lib/format";
import { Agent, webSearchTool } from "@openai/agents";
import { geolocation, type Geo } from "@vercel/functions";
import { Context } from "ovr";

export const create = () => {
	const c = Context.get();
	let geo: Geo | null = geolocation(c.req);
	if (!geo.country) geo = null;

	return new Agent({
		name: "Researcher",
		model: "gpt-4.1-mini",
		handoffDescription:
			"The Researcher has access to the internet and the user's approximate geolocation.",
		instructions: geo
			? `User geo information:${toMdCodeBlock("json", geo)}`
			: undefined,
		tools: [
			webSearchTool({
				searchContextSize: "low",
				userLocation: geo
					? {
							type: "approximate",
							country: geo.country,
							region: geo.countryRegion,
							city: geo.city,
						}
					: undefined,
			}),
		],
	});
};
