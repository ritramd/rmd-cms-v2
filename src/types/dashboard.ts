export interface AttentionItem {
  id: string
  kind: 'low-stock' | 'disconnected'
  title: string
  machine: string
  /** Highlighted part, e.g. "Sisa 12%" or "Offline". */
  detail: string
}
