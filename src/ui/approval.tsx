import type { RunToolApprovalItem } from "@openai/agents";
import * as ovr from "ovr";

export const Approvals = ({
	interruptions,
}: {
	interruptions: RunToolApprovalItem[];
}) => {
	return (
		<>
			<p>The following actions require approval:</p>

			<div class="mb-4 grid gap-2">
				{interruptions.map((interruption) => (
					<Approval interruption={interruption} />
				))}
			</div>

			<button>Send</button>
		</>
	);
};

const Approval = ({ interruption }: { interruption: RunToolApprovalItem }) => {
	const value = ovr.escape(JSON.stringify(interruption), true);

	return (
		<div class="flex items-center gap-3" aria-label="approval">
			<label class="flex items-center gap-2">
				<input type="checkbox" name="approval" value={value} />
				<div class="badge secondary font-mono font-light">
					{interruption.rawItem.name}
				</div>
			</label>

			<input type="hidden" name="interruption" value={value} />
		</div>
	);
};
