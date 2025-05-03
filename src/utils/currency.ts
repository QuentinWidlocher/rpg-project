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

export function formatCp(cp: number, { style = 'long' }: { style: 'short' | 'long' } = { style: 'long' }) {
  if (cp >= 10 * 10) {
    return `${toGp(cp)} ${style == 'long' ? 'gold coins' : 'gp'}`
  } else if (cp >= 10) {
    return `${toSp(cp)} ${style == 'long' ? 'silver coins' : 'sp'}`
  } else {
    return `${toCp(cp)} ${style == 'long' ? 'copper coins' : 'cp'}`
  }
}
