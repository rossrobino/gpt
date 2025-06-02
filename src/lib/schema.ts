import * as z from "zod/v4";

export const StringSchema = z.string();

export const NullableStringSchema = z.string().nullable();

export const FileSchema = z.file();

export const FilesSchema = z.array(FileSchema.nullable()).transform((files) => {
	return files.filter((file) => file?.size) as File[];
});

export const URLSchema = z.url();

export const DataSchema = z.array(
	z.record(z.string(), z.union([z.string(), z.number()])),
);
