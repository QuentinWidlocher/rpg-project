export function gp(amount: number) {
  return sp(amount) * 100
}

export function sp(amount: number) {
  return cp(amount) * 100
}

export function cp(amount: number) {
  return amount
}
