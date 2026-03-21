const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export function money(value?: number): string {
  return usdFormatter.format(value ?? 0)
}

export function pct(value: number): string {
  return `${value.toFixed(1)}%`
}
