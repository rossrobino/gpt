import { toCodeBlock } from "@/lib/md/util";
import type { Dataset } from "@/lib/types";

export const dataSample = (dataset: Dataset) => {
	if (!dataset) return "";

	return "\n\n# Data Sample" + toCodeBlock("json", dataset.slice(0, 10));
};
