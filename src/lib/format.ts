export const jsFormat = (obj: unknown): string => {
	if (obj instanceof Array || typeof obj === "string") {
		return JSON.stringify(obj);
	} else if (typeof obj === "object" && obj != null) {
		return `{ ${Object.entries(obj)
			.map(([k, v]) => `${k}: ${jsFormat(v)}`)
			.join(", ")} }`;
	}

	return String(obj);
};
