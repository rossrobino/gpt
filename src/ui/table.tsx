import type { JSX } from "ovr";

type Row = Record<string, unknown>;

type Column<R extends Row, K extends keyof R | (string & {})> = {
	key: K;
	head?: ((key: K) => JSX.Element) | JSX.Element;
	cell?: (row: R) => JSX.Element;
	foot?: (data: R[]) => JSX.Element;
};

const columnHelper = <R extends Row>() => {
	return {
		create: <K extends keyof R | (string & {})>(
			key: K,
			options?: {
				head?: Column<R, K>["head"];
				cell?: Column<R, K>["cell"];
				foot?: Column<R, K>["foot"];
			},
		) => {
			return { key, ...options };
		},
	};
};

type Create<R extends Row> = ReturnType<typeof columnHelper<R>>["create"];

export const Table = <R extends Row>(props: {
	data?: R[];
	columns?: (
		h: Create<R>,
	) => { [K in keyof R | string]: Column<R, K> }[keyof R][];
}) => {
	if (!props.data?.at(0)) return null;

	const columns = props.columns
		? props.columns(columnHelper<R>().create)
		: Object.keys(props.data.at(0)!).map(
				(key) => ({ key }) as Column<R, keyof R>,
			);

	return (
		<div class="rotate-180 overflow-x-auto">
			{/* rotating both puts the horizontal scrollbar on the top */}
			<table class="rotate-180">
				<thead class="cursor-default">
					<tr>
						{columns.map((column) => (
							<th>
								{column.head
									? typeof column.head === "function"
										? column.head(column.key)
										: column.head
									: column.key}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{function* () {
						for (const row of props.data!) {
							yield (
								<tr>
									{columns.map((column) => (
										<td>{column.cell ? column.cell(row) : row[column.key]!}</td>
									))}
								</tr>
							);
						}
					}}
				</tbody>
				<tfoot>
					<tr>
						{columns.map((column) => (
							<td>{column.foot ? column.foot(props.data!) : null}</td>
						))}
					</tr>
				</tfoot>
			</table>
		</div>
	);
};
