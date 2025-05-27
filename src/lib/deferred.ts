export class Deferred<T> {
	promise: Promise<T>;
	#resolve!: (value: T) => void;

	constructor() {
		this.promise = new Promise<T>((resolve) => {
			this.#resolve = resolve;
		});
	}

	resolve(value: T) {
		this.#resolve(value);
	}
}
