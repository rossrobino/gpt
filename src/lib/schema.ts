import * as z from "zod/v4";

export const NullableStringSchema = z.string().nullable();

export const FilesSchema = z.array(z.file());
