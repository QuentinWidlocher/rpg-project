import { JsonObject } from "type-fest";

export function getLocalStorageObject<Result extends JsonObject>(key: string): Result | undefined {
	const stringValue = localStorage.getItem(key);
	try {
		if (stringValue) {
			return JSON.parse(stringValue) as Result;
		} else {
			return undefined;
		}
	} catch {
		return undefined;
	}
}
