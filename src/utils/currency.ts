export function gp(gp: number) {
  return sp(gp * 10);
}

export function sp(sp: number) {
  return cp(sp * 10);
}

export function cp(cp: number) {
  return cp;
}

export function toGp(cp: number) {
  return Math.round(cp / 10 / 10)
}

export function toSp(cp: number) {
  return Math.round(cp / 10)
}

export function toCp(cp: number) {
  return Math.round(cp)
}

export function formatCp(cp: number, { style = 'long', exhaustive = false }: { style?: 'short' | 'long', exhaustive?: boolean } = { style: 'long', exhaustive: false }) {
  function formatNonExhaustive(value: number) {
    if (value >= 10 * 10) {
      const result = toGp(value)
      return `${result} ${style == 'long' ? `gold coin${result > 1 ? 's' : ''}` : 'gc'}`
    } else if (value >= 10) {
      const result = toSp(value)
      return `${result} ${style == 'long' ? `silver coin${result > 1 ? 's' : ''}` : 'sc'}`
    } else {
      const result = toCp(value)
      return `${result} ${style == 'long' ? `copper coin${result > 1 ? 's' : ''}` : 'cc'}`
    }
  }

  if (exhaustive) {
    let currentCp = cp
    let parts: string[] = []

    while (currentCp > 0) {
      parts.push(formatNonExhaustive(currentCp))
      if (currentCp >= 100) {
        currentCp = currentCp % 100
      } else if (currentCp >= 10) {
        currentCp = currentCp % 10
      } else {
        currentCp = 0
      }
    }

    return new Intl.ListFormat('en', { style, type: style == 'short' ? 'unit' : 'conjunction' }).format(parts)
  } else {
    return formatNonExhaustive(cp)
  }
}
