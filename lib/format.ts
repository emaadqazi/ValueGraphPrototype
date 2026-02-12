const currencyFormatter = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const currencyFormatterDecimal = new Intl.NumberFormat("en-CA", {
  style: "currency",
  currency: "CAD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return "-"
  return currencyFormatter.format(value)
}

export function formatCurrencyDecimal(value: number | undefined | null): string {
  if (value == null || isNaN(value)) return "-"
  return currencyFormatterDecimal.format(value)
}

export function formatDate(dateString: string): string {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
