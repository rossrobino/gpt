import * as z from "zod/v4";

export * from "zod/v4";

export const files = () =>
	z.array(fileOrNull()).transform((files) => files.filter(Boolean) as File[]);

export const fileOrNull = () =>
	z.file().transform((file) => {
		if (!file.size) return null;
		return file;
	});

export const data = () =>
	z.array(z.record(z.string(), z.union([z.string(), z.number()])));

export const httpUrl = () =>
	z.union([
		z.url({ protocol: /^https?$/, hostname: z.regexes.domain }),
		z.literal("").transform(() => null),
	]);

export const checkbox = () =>
	z.union([
		z.literal("on").transform(() => true),
		z.null().transform(() => false),
	]);

export const formData = <S extends Record<string, z.ZodType>>(shape: S) =>
	z.instanceof(FormData).transform((formData) => {
		const data: Record<string, unknown> = {};

		for (let [name, schema] of Object.entries(shape)) {
			if (schema instanceof z.ZodPipe && schema.in instanceof z.ZodType) {
				schema = schema.in;
			}

			if (schema.def.type === "array") {
				data[name] = formData.getAll(name);
			} else {
				data[name] = formData.get(name);
			}
		}

		return z.object(shape).parse(data);
	});
