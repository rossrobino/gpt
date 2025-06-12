import * as echarts from "echarts";
import * as ovr from "ovr";
import * as z from "zod/v4";

export * from "zod/v4";

export const files = () =>
	z.array(fileOrNull()).transform((files) => files.filter(Boolean) as File[]);

export const fileOrNull = () =>
	z
		.file()
		.nullable()
		.transform((file) => {
			if (!file?.size) return null;
			return file;
		});

export const dataValue = () => z.union([z.string(), z.number(), z.null()]);

export const dataRecord = () => z.record(z.string(), dataValue());

export const data = () => z.array(dataRecord());

export const httpUrl = () =>
	z.union([
		z.url({ protocol: /^https?$/, hostname: z.regexes.domain }),
		z.literal("").transform(() => null),
		z.null(),
	]);

export const checkbox = () =>
	z.union([
		z.literal("on").transform(() => true),
		z.any().transform(() => false),
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

export const functionOutput = () =>
	z
		.object({
			result: z.unknown().optional(),
			summary: z.string().optional(),
			error: z.object({ message: z.string(), error: z.unknown() }).optional(),
			chartOptions: z.record(z.string(), z.any()).optional(),
		})
		.loose()
		.transform(
			(output) =>
				output as {
					[key: string]: unknown;
					result?: unknown;
					error?: { message: string; error: unknown };
					summary?: string;
					chartOptions?: echarts.EChartsOption;
				},
		);

export const interruption = () => {
	return z.object({ rawItem: z.any(), agent: z.any() }).loose();
};

// this is required due to interruptions and state already having
// escaped strings within their properties
const removeDoubleEscaped = (s: string) => s.replaceAll("\\\\", "\\");

export const interruptions = () =>
	z.array(
		z.string().transform((str) => {
			const json = JSON.parse(removeDoubleEscaped(str));
			return interruption().parse(json);
		}),
	);

export const state = () =>
	z
		.string()
		.nullable()
		.transform((str) => {
			if (!str) return null;
			return removeDoubleEscaped(str);
		});

export const escape = () => z.string().transform((text) => ovr.escape(text));
