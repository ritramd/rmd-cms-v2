<script setup lang="ts">
// Figma: 11.1-D-Billing (1097:27746) & 11.2-D-Konfirmasi Pembayaran (1097:27910)
// Legacy parity: subscription-end.vue (Self Billing + Redeem Voucher tabs), composables/useSelfBilling.ts
// & billingPaymentController.ts. The Self Billing tab has no Figma frame; it follows the v2 cards.
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import BillingTabs from '@/components/billing/BillingTabs.vue'
import PaymentSuccessModal from '@/components/billing/PaymentSuccessModal.vue'
import PromotionPaymentModal from '@/components/billing/PromotionPaymentModal.vue'
import RedeemVoucherCard from '@/components/billing/RedeemVoucherCard.vue'
import SelfBillingPanel from '@/components/billing/SelfBillingPanel.vue'
import PageHeader from '@/components/layout/PageHeader.vue'
import AppToast from '@/components/ui/AppToast.vue'
import { useSelfBillingPayment } from '@/composables/useSelfBillingPayment'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { getSession } from '@/services/auth'
import {
  confirmPayment,
  fetchBillingMachines,
  fetchOutstandingBilling,
  getPaymentToken,
  validateVoucher,
} from '@/services/billing'
import type {
  BillingMachine,
  BillingTab,
  MidtransSnapResult,
  OutstandingBilling,
  SelfBillingOutcome,
  SelfBillingSessionRequest,
  VoucherData,
} from '@/types/billing'
import { loadMidtransSnap } from '@/utils/midtrans'

const router = useRouter()
const user = getSession()

const tab = ref<BillingTab>('self')

// ─── Self billing ────────────────────────────────────────────────────────────
/** The account that pays: the parent for a sub account (same rule as the backend's getPayerUserId). */
const payerId = user?.parentId && user.parentId !== 1 ? user.parentId : (user?.id ?? 0)
const canUsePph = user?.category === 'perusahaan'

const billingMachines = shallowRef<BillingMachine[]>([])
const outstanding = shallowRef<OutstandingBilling | null>(null)
const billingLoading = ref(true)
const billingError = ref<string | null>(null)
const successActiveUntil = ref<string | null>(null)

const { isStarting, isPolling, pay, resumePending } = useSelfBillingPayment()

const payButtonLabel = computed(() =>
  isStarting.value ? 'Menyiapkan pembayaran…' : isPolling.value ? 'Memproses pembayaran…' : null,
)

async function loadSelfBilling() {
  billingLoading.value = true
  billingError.value = null
  try {
    const [machines, outstandingResult] = await Promise.all([fetchBillingMachines(payerId), fetchOutstandingBilling()])
    billingMachines.value = machines
    outstanding.value = outstandingResult
  } catch (err) {
    billingError.value = err instanceof ApiError ? err.message : 'Gagal memuat data tagihan.'
  } finally {
    billingLoading.value = false
  }
}

const FAILED_LABELS: Record<string, string> = {
  expire: 'kedaluwarsa',
  deny: 'ditolak',
  cancel: 'dibatalkan',
  failure: 'gagal',
}

/** Shows how a self billing payment ended (v1 showed these as SweetAlert dialogs). */
function presentOutcome(outcome: SelfBillingOutcome) {
  switch (outcome.kind) {
    case 'settlement':
      paidAmount.value = outcome.amount
      successActiveUntil.value = outcome.subscriptionEndDate
      showSuccessModal.value = true
      break
    case 'failed':
      showToast(`Pembayaran ${FAILED_LABELS[outcome.status] ?? outcome.status}. Silakan coba lagi.`, 'error')
      break
    case 'pending':
      showToast('Pembayaran masih diproses. Silakan cek kembali beberapa saat lagi.', 'success')
      break
    case 'error':
      showToast(outcome.message, 'error')
      break
    case 'closed':
      break // closed without paying: nothing to report (v1)
  }
}

async function handleSelfBillingPay(request: SelfBillingSessionRequest) {
  // Resolves after the popup closes and the result is checked with the server.
  presentOutcome(await pay(request))
}

onMounted(async () => {
  void loadSelfBilling()
  // A payment left unfinished on an earlier visit (v1 checkAndResumePendingSession).
  const resumed = await resumePending()
  if (resumed) presentOutcome(resumed)
})

// Search filters

// State
const loadingVoucher = ref(false)
const voucherError = ref<string | null>(null)
const validatedVoucher = ref<VoucherData | null>(null)
const showConfirmModal = ref(false)
const isPaying = ref(false)
const showSuccessModal = ref(false)
const paidAmount = ref(0)

// Toast notification
const toastMessage = ref<string | null>(null)
const toastVariant = ref<'error' | 'success'>('error')

function showToast(message: string, variant: 'error' | 'success' = 'error') {
  toastVariant.value = variant
  toastMessage.value = message
}

// ─── 1. Voucher Validation Flow ─────────────────────────────────────────────
async function handleRedeemVoucher(code: string) {
  voucherError.value = null
  loadingVoucher.value = true

  const clientId = user?.id ?? 0

  try {
    const data = await validateVoucher({ clientId, voucher: code })
    validatedVoucher.value = data
    showConfirmModal.value = true
  } catch (err) {
    const message = err instanceof ApiError || err instanceof Error ? err.message : 'Voucher Tidak Valid!'
    voucherError.value = message
    showToast(message, 'error')
  } finally {
    loadingVoucher.value = false
  }
}

// ─── 2. Payment Initiation & Snap Flow ──────────────────────────────────────
async function handleConfirmPayment() {
  if (!validatedVoucher.value) return
  isPaying.value = true

  const voucher = validatedVoucher.value
  const amountNumeric = typeof voucher.billingAmount === 'number'
    ? voucher.billingAmount
    : parseFloat(String(voucher.billingAmount || '0'))

  try {
    const tokenResp = await getPaymentToken({
      duration: voucher.duration,
      candidateUserId: voucher.clientId,
      billingAmount: amountNumeric,
      vmId: String(voucher.vmId),
      voucherCode: voucher.voucher,
    })

    if (!tokenResp?.transaction_token) {
      throw new Error('Gagal mendapatkan token transaksi pembayaran dari server.')
    }

    // Ensure Midtrans Snap script is loaded
    await loadMidtransSnap()

    if (typeof window !== 'undefined' && window.snap?.pay) {
      window.snap.pay(tokenResp.transaction_token, {
        onSuccess: async (result: MidtransSnapResult) => {
          try {
            await confirmPayment({ order_id: result.order_id })
          } catch {
            // Webhook may handle confirmation automatically
          }
          showConfirmModal.value = false
          paidAmount.value = parseInt(result.gross_amount, 10) || amountNumeric
          showSuccessModal.value = true
        },
        onPending: () => {
          showConfirmModal.value = false
          showToast('Pembayaran sedang diproses, silakan selesaikan pembayaran Anda.', 'success')
        },
        onError: () => {
          showToast('Pembayaran gagal, silakan hubungi tim CS kami untuk bantuan.', 'error')
        },
        onClose: () => {
          showToast('Popup ditutup tanpa melakukan pembayaran.', 'error')
        },
      })
    } else {
      // In local testing/mock environments where window.snap is absent,
      // simulate settlement confirmation gracefully.
      const simulatedOrderId = `sub_${Date.now()}`
      await confirmPayment({ order_id: simulatedOrderId })
      showConfirmModal.value = false
      paidAmount.value = amountNumeric
      showSuccessModal.value = true
    }
  } catch (err) {
    const message = err instanceof ApiError || err instanceof Error ? err.message : 'Gagal memproses pembayaran.'
    showToast(message, 'error')
  } finally {
    isPaying.value = false
  }
}

// ─── 3. Success Redirect ───────────────────────────────────────────────────
function handleSuccessConfirmed() {
  showSuccessModal.value = false
  successActiveUntil.value = null
  void router.push('/')
}
</script>

<template>
  <DashboardLayout title="Billing">
    <!-- No search here: nothing on the billing tabs is searchable. -->
    <template #header>
      <PageHeader title="Billing" />
    </template>

    <div class="flex flex-col items-center gap-6">
      <BillingTabs v-model="tab" />
      <p
        v-if="isPolling"
        role="status"
        class="rounded-full bg-warning-soft px-4 py-2 text-sm font-semibold text-warning-strong"
      >
        Memproses pembayaran, mohon tunggu…
      </p>

      <SelfBillingPanel
        v-if="tab === 'self'"
        :machines="billingMachines"
        :outstanding="outstanding"
        :loading="billingLoading"
        :error="billingError"
        :can-use-pph="canUsePph"
        :busy-label="payButtonLabel"
        @retry="loadSelfBilling"
        @pay="handleSelfBillingPay"
      />
      <RedeemVoucherCard
        v-else
        :loading="loadingVoucher"
        :error="voucherError"
        @submit="handleRedeemVoucher"
      />
    </div>

    <!-- Confirmation Modal matching Figma 11.2-D-Konfirmasi Pembayaran -->
    <PromotionPaymentModal
      :open="showConfirmModal"
      :voucher="validatedVoucher"
      :busy="isPaying"
      @close="showConfirmModal = false"
      @confirm="handleConfirmPayment"
    />

    <!-- Success Modal -->
    <PaymentSuccessModal
      :open="showSuccessModal"
      :amount="paidAmount"
      :active-until="successActiveUntil"
      @confirm="handleSuccessConfirmed"
    />

    <!-- Toast Notifications -->
    <AppToast v-model="toastMessage" :variant="toastVariant" />
  </DashboardLayout>
</template>
