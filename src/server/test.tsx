import { Approvals } from "@/ui/approval";
import * as ovr from "ovr";

export const page = new ovr.Page("/test", () => {
	return (
		<div>
			<h1>Test</h1>

			<a href="/">Home</a>

			<div class="mt-8">
				<Approvals
					interruptions={
						[
							{
								agent: { name: "Agent Name" },
								rawItem: { name: "function_name" },
							},
							{
								agent: { name: "Agent Name" },
								rawItem: { name: "function_name", arguments: { x: "hello" } },
							},
						] as any
					}
				></Approvals>
			</div>
		</div>
	);
});
