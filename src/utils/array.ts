export type Entries<T> = {
	[K in keyof T]: [K, T[K]];
}[keyof T][];

export function entries<T extends Record<string, unknown>>(obj: T): Entries<T> {
	return Object.entries(obj) as any;
}

export function keys<T extends Record<string, unknown>>(obj: T): Array<keyof T> {
	return Object.keys(obj) as any;
}
