import { groupBy } from "lodash-es";

export function camelCaseToWords(s: string) {
	const result = s.replace(/([A-Z])/g, " $1");
	return result.charAt(0).toUpperCase() + result.slice(1);
}

export function formatList<T extends { name: string }[] | { name: string; quantity: number }[]>(list: T) {
	if (list.length <= 0) {
		return "";
	}

	if (list.every(i => "quantity" in i)) {
		return new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(
			(list as { name: string; quantity: number }[]).map(({ name, quantity }) => `${quantity} ${name}`),
		);
	} else {
		return new Intl.ListFormat("en", { style: "long", type: "conjunction" }).format(
			Object.entries(groupBy(list, item => item.name)).map(([name, items]) => `${items.length} ${name}`),
		);
	}
}
