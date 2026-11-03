import { computed, type MaybeRefOrGetter, toValue } from 'vue'

/** Page numbers to show around the current page, e.g. [3, 4, 5, 6, 7] for page 5 of 12. */
export function usePageWindow(
  page: MaybeRefOrGetter<number>,
  totalPages: MaybeRefOrGetter<number>,
  size: MaybeRefOrGetter<number> = 5,
) {
  return computed(() => {
    const total = toValue(totalPages)
    const count = Math.min(toValue(size), total)
    const start = Math.min(Math.max(toValue(page) - Math.floor(count / 2), 1), total - count + 1)
    return Array.from({ length: count }, (_, i) => start + i)
  })
}
