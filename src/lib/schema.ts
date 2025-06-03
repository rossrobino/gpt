import * as schema from "zod/v4";

export * from "zod/v4";

export const FilesSchema = schema
	.array(schema.file().nullable())
	.transform((files) => {
		return files.filter((file) => file?.size) as File[];
	});

export const DataSchema = schema.array(
	schema.record(
		schema.string(),
		schema.union([schema.string(), schema.number()]),
	),
);
