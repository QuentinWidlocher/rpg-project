export function gc(gp: number) {
	return sc(gp * 10);
}

export function sc(sp: number) {
	return cc(sp * 10);
}

export function cc(cp: number) {
	return cp;
}

export function toGc(cp: number) {
	return Math.round(cp / 10 / 10);
}

export function toSc(cp: number) {
	return Math.round(cp / 10);
}

export function toCc(cp: number) {
	return Math.round(cp);
}

export function formatCc(
	cc: number,
	{ style = "long", exhaustive = false }: { style?: "short" | "long"; exhaustive?: boolean } = {
		style: "long",
		exhaustive: false,
	},
) {
	function formatNonExhaustive(value: number) {
		if (value >= 10 * 10) {
			const result = toGc(value);
			return `${result} ${style == "long" ? `gold coin${result > 1 ? "s" : ""}` : "gc"}`;
		} else if (value >= 10) {
			const result = toSc(value);
			return `${result} ${style == "long" ? `silver coin${result > 1 ? "s" : ""}` : "sc"}`;
		} else {
			const result = toCc(value);
			return `${result} ${style == "long" ? `copper coin${result > 1 ? "s" : ""}` : "cc"}`;
		}
	}

	if (exhaustive) {
		let currentCc = cc;
		let parts: string[] = [];

		while (currentCc > 0) {
			parts.push(formatNonExhaustive(currentCc));
			if (currentCc >= 100) {
				currentCc = currentCc % 100;
			} else if (currentCc >= 10) {
				currentCc = currentCc % 10;
			} else {
				currentCc = 0;
			}
		}

		return new Intl.ListFormat("en", { style, type: style == "short" ? "unit" : "conjunction" }).format(parts);
	} else {
		return formatNonExhaustive(cc);
	}
}
