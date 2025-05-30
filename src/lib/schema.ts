import * as z from "zod/v4";

export const StringSchema = z.string();

export const NullableStringSchema = z.string().nullable();

export const FilesSchema = z.array(z.file());

export const URLSchema = z.url();

export const NumberMatrixSchema = z.array(z.array(z.number()));

export const UnknownRecordSchema = z.record(z.string(), z.unknown());

export const UnknownRecordArraySchema = z.array(UnknownRecordSchema);

export const CreateAnalyzeFeaturesSchema = (features: string[]) =>
	z.array(z.enum(features)).min(2);

export const AnalyzeMethodSchema = z.enum(["linear_regression"]);

export const CreateAnalyzeSchema = (features: string[]) =>
	z.object({
		method: AnalyzeMethodSchema,
		records: z.array(UnknownRecordSchema),
		features: CreateAnalyzeFeaturesSchema(features),
	});

export const CreateAnalyzeJsonSchema = (features: string[]) =>
	z.toJSONSchema(CreateAnalyzeSchema(features).omit({ records: true }));
