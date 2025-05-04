export function milliseconds(ms: number) {
	return new Promise<void>(r => setTimeout(r, ms));
}

export function seconds(s: number) {
	return milliseconds(s * 1000);
}
