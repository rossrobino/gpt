export const linspace = (start: number, end: number, n: number) => {
	if (n <= 0) return [];
	if (n === 1) return [start];

	const step = (end - start) / (n - 1);
	return Array.from({ length: n }, (_, i) => start + i * step);
};

export const difference = (numbers: number[]) =>
	numbers.length === 0
		? 0
		: numbers.slice(1).reduce((acc, curr) => acc - curr, numbers[0]!);

export const quotient = (numbers: number[]) =>
	numbers.length === 0
		? 0
		: numbers.slice(1).reduce((acc, curr) => acc / curr, numbers[0]!);
