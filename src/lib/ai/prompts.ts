import { toMdCodeBlock } from "@/lib/format";
import type { Dataset } from "@/lib/types";

export const dataSample = (dataset: Dataset) => {
	if (!dataset) return "";

	return "\n\n# Data Sample" + toMdCodeBlock("json", dataset.slice(0, 10));
};
