export const types = {
	image: ["image/png", "image/jpeg", "image/webp", "image/gif"],
	docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" as const,
	csv: "text/csv" as const,
	json: "application/json" as const,
};

export const sets = { dataset: [types.csv] };
