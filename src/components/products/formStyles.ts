// Field styling from the product form design (1097:23091), shared by the product and category forms.

export const fieldLabelClass = 'font-inter text-xs font-bold tracking-[1.2px] text-ink-subtle uppercase'

export const fieldClass =
  'h-8 w-full rounded-lg border bg-surface-muted px-[13px] font-inter text-xs font-medium text-ink-heading outline-none placeholder:text-ink-heading focus:ring-2'

export function fieldStateClass(invalid: boolean): string {
  return invalid
    ? 'border-input-error focus:ring-input-error/20'
    : 'border-line focus:border-primary focus:ring-primary/20'
}
