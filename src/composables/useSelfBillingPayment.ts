// Self billing payment flow, ported from v1 composables/useSelfBilling.ts: create a session, get a
// Snap token, pay in the Midtrans popup, then poll the session until it settles or fails. v1 showed
// SweetAlert dialogs along the way; here the outcome is returned for the page to present.
import { onBeforeUnmount, ref } from 'vue'
import { ApiError } from '@/services/api'
import { refreshSessionAfterPayment } from '@/services/auth'
import {
  createSelfBillingSession,
  fetchPendingSelfBillingSession,
  fetchSelfBillingStatus,
  getSelfBillingToken,
} from '@/services/billing'
import type { SelfBillingOutcome, SelfBillingSessionRequest, SelfBillingTransactionStatus } from '@/types/billing'
import { loadMidtransSnap } from '@/utils/midtrans'

const POLL_INTERVAL_MS = 3000
const FAILED_STATUSES: SelfBillingTransactionStatus[] = ['deny', 'cancel', 'expire', 'failure']

/** Readable reason for a refused create-session call (the API answers { error, details }). */
function sessionErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 400) return 'Total tagihan tidak sesuai perhitungan server. Muat ulang halaman, lalu coba lagi.'
    if (err.status === 403) return 'Ada mesin yang bukan milik akun ini. Muat ulang halaman, lalu coba lagi.'
    if (err.status === 404) return 'Tidak ada mesin yang bisa ditagihkan untuk akun ini.'
    return err.message
  }
  return 'Gagal membuat sesi pembayaran.'
}

export function useSelfBillingPayment() {
  /** Session and token are being created, until the Midtrans popup opens. */
  const isStarting = ref(false)
  /** A popup result is being confirmed with the server (v1: "processing" badge). */
  const isPolling = ref(false)
  let cancelled = false

  /** Waits `ms`, ending early once polling is cancelled (e.g. leaving the page). */
  const sleep = (ms: number) =>
    new Promise<void>((resolve) => {
      const started = Date.now()
      const tick = () => (cancelled || Date.now() - started >= ms ? resolve() : setTimeout(tick, 200))
      tick()
    })

  async function poll(orderId: string, attempts: number): Promise<SelfBillingOutcome> {
    for (let i = 0; i < attempts; i++) {
      await sleep(POLL_INTERVAL_MS)
      if (cancelled) return { kind: 'pending' }

      let status
      try {
        status = await fetchSelfBillingStatus(orderId)
      } catch {
        continue // try again on the next tick, as v1
      }
      const state = status?.transaction_status
      if (state === 'settlement') {
        const subscriptionEndDate = status?.subscription_end_date ?? null
        await refreshSessionAfterPayment(subscriptionEndDate)
        return { kind: 'settlement', subscriptionEndDate, amount: Number(status?.gross_amount) || 0 }
      }
      if (state && FAILED_STATUSES.includes(state)) return { kind: 'failed', status: state }
    }
    return { kind: 'pending' }
  }

  async function track(orderId: string, attempts: number): Promise<SelfBillingOutcome> {
    isPolling.value = true
    try {
      return await poll(orderId, attempts)
    } finally {
      isPolling.value = false
    }
  }

  /** Runs one payment from session to outcome. Resolves after the popup and the follow-up checks. */
  async function pay(request: SelfBillingSessionRequest): Promise<SelfBillingOutcome> {
    if (isPolling.value || isStarting.value) {
      return { kind: 'error', message: 'Mohon tunggu hingga proses pembayaran sebelumnya selesai.' }
    }
    cancelled = false
    isStarting.value = true
    let orderId: string
    let token: string | null
    try {
      try {
        const session = await createSelfBillingSession(request)
        if (!session?.orderId) return { kind: 'error', message: 'Gagal membuat sesi pembayaran.' }
        orderId = session.orderId
      } catch (err) {
        return { kind: 'error', message: sessionErrorMessage(err) }
      }
      try {
        token = await getSelfBillingToken(orderId)
      } catch (err) {
        return { kind: 'error', message: err instanceof ApiError ? err.message : 'Gagal membuat token transaksi.' }
      }
      if (!token) return { kind: 'error', message: 'Gagal membuat token transaksi.' }

      const ready = await loadMidtransSnap()
      if (!ready || !window.snap) {
        return { kind: 'error', message: 'Midtrans belum siap. Muat ulang halaman, lalu coba lagi.' }
      }
    } finally {
      isStarting.value = false
    }

    return new Promise<SelfBillingOutcome>((resolve) => {
      window.snap!.pay(token!, {
        onSuccess: () => void track(orderId, 10).then(resolve),
        onPending: () => void track(orderId, 10).then(resolve),
        onError: () => resolve({ kind: 'error', message: 'Pembayaran gagal, silakan coba lagi.' }),
        // Closed without finishing: check briefly in case it was paid just before closing (v1).
        onClose: () =>
          void track(orderId, 3).then((outcome) => resolve(outcome.kind === 'pending' ? { kind: 'closed' } : outcome)),
      })
    })
  }

  /**
   * On page load: picks up a session left pending by an earlier visit and follows it to the end
   * (v1 checkAndResumePendingSession). Null when there is none.
   */
  async function resumePending(): Promise<SelfBillingOutcome | null> {
    try {
      const session = await fetchPendingSelfBillingSession()
      if (!session?.orderId || session.transaction_status !== 'pending') return null
      cancelled = false
      return await track(session.orderId, 10)
    } catch {
      return null
    }
  }

  function cancel() {
    cancelled = true
    isPolling.value = false
  }

  onBeforeUnmount(cancel)

  return { isStarting, isPolling, pay, resumePending, cancel }
}
