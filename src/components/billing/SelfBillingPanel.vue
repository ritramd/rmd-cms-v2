<script setup lang="ts">
// "Self Billing" tab of v1 pages/subscription-end.vue: outstanding months, machines, package and
// months, invoice, then a confirmation. Emits the session request once the user confirms.
import { computed, ref, watch } from 'vue'
import BillingMachinePicker from '@/components/billing/BillingMachinePicker.vue'
import BillingPackagePicker from '@/components/billing/BillingPackagePicker.vue'
import OutstandingBillingTable from '@/components/billing/OutstandingBillingTable.vue'
import SelfBillingConfirmModal from '@/components/billing/SelfBillingConfirmModal.vue'
import SelfBillingSummary from '@/components/billing/SelfBillingSummary.vue'
import type {
  BillingMachine,
  OutstandingBilling,
  OutstandingMachine,
  SelfBillingSessionRequest,
  SubscriptionPackage,
} from '@/types/billing'
import { computeSelfBillingInvoice } from '@/utils/selfBilling'

const props = defineProps<{
  machines: BillingMachine[]
  outstanding: OutstandingBilling | null
  loading: boolean
  error: string | null
  /** Company accounts may pay with a PPh deduction. */
  canUsePph: boolean
  /** A payment is being set up or confirmed; label for the pay button. */
  busyLabel: string | null
}>()

const emit = defineEmits<{
  retry: []
  pay: [request: SelfBillingSessionRequest]
}>()

const PACKAGE_LABELS: Record<SubscriptionPackage, string> = { starter: 'Starter', pro: 'Pro', priority: 'Priority' }

const pkg = ref<SubscriptionPackage>('starter')
const months = ref(1)
const includePPH = ref(false)
const optionalSelected = ref<number[]>([])
const confirmOpen = ref(false)

const outstandingMachines = computed<OutstandingMachine[]>(() =>
  (props.outstanding?.machines ?? []).filter((m) => m.outstanding_months > 0),
)
const outstandingById = computed(() => new Map((props.outstanding?.machines ?? []).map((m) => [m.machine_id, m])))
const requiredIds = computed(() => new Set(outstandingMachines.value.map((m) => m.machine_id)))

// v1 starts with every machine selected.
watch(
  () => props.machines,
  (list) => (optionalSelected.value = list.map((m) => m.id)),
  { immediate: true },
)

/** Selected machines in list order: the required ones plus the optional picks. */
const selectedIds = computed(() => {
  const optional = new Set(optionalSelected.value)
  return props.machines.map((m) => m.id).filter((id) => requiredIds.value.has(id) || optional.has(id))
})
const optionalModel = computed({
  get: () => optionalSelected.value.filter((id) => !requiredIds.value.has(id)),
  set: (ids: number[]) => (optionalSelected.value = ids),
})

const invoice = computed(() =>
  computeSelfBillingInvoice({
    outstandingBase: outstandingMachines.value.reduce((sum, m) => sum + m.amount, 0),
    months: months.value,
    pkg: pkg.value,
    machineCount: selectedIds.value.length,
    includePPH: props.canUsePph && includePPH.value,
  }),
)

const canPay = computed(() => !props.loading && selectedIds.value.length > 0 && invoice.value.total > 0)

function confirm() {
  confirmOpen.value = false
  emit('pay', {
    billingAmount: invoice.value.total,
    vmId: selectedIds.value.join(','),
    baseAmount: invoice.value.totalBase,
    includePPH: props.canUsePph && includePPH.value,
    subscriptionPackage: pkg.value,
    newSubscriptionMonths: months.value,
    outstandingMonths: props.outstanding?.total_outstanding_months ?? 0,
  })
}
</script>

<template>
  <div v-if="loading" class="rounded-2xl bg-surface p-10 text-center text-sm text-ink-muted shadow-card">Menghitung tagihan…</div>
  <div v-else-if="error" class="flex flex-col items-center gap-2 rounded-2xl bg-surface p-10 text-sm text-ink-muted shadow-card">
    {{ error }}
    <button type="button" class="font-bold text-primary hover:underline" @click="$emit('retry')">Coba lagi</button>
  </div>
  <div v-else-if="!machines.length" class="rounded-2xl bg-surface p-10 text-center text-sm text-ink-muted shadow-card">
    Belum ada mesin yang bisa ditagihkan untuk akun ini.
  </div>

  <div v-else class="grid w-full items-start gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
    <section class="flex flex-col gap-6 rounded-2xl bg-surface p-6 shadow-card">
      <header class="flex flex-col gap-1">
        <h2 class="text-lg font-bold text-ink-strong">Pembayaran Langsung</h2>
        <p class="text-sm text-ink-muted">Perpanjang langganan mesin dan lunasi tagihan tertunggak dalam satu pembayaran.</p>
      </header>
      <OutstandingBillingTable
        v-if="outstandingMachines.length"
        :machines="outstandingMachines"
        :total="invoice.outstandingBase"
      />
      <BillingMachinePicker
        v-model="optionalModel"
        :machines="machines"
        :outstanding="outstandingById"
        :required-ids="requiredIds"
        :selected-count="selectedIds.length"
      />
      <BillingPackagePicker v-model:pkg="pkg" v-model:months="months" />
    </section>

    <SelfBillingSummary
      v-model:include-pph="includePPH"
      class="xl:sticky xl:top-6"
      :invoice="invoice"
      :months="months"
      :machine-count="selectedIds.length"
      :can-use-pph="canUsePph"
      :can-pay="canPay"
      :busy-label="busyLabel"
      @pay="confirmOpen = true"
    />
  </div>

  <SelfBillingConfirmModal
    :open="confirmOpen"
    :invoice="invoice"
    :machine-count="selectedIds.length"
    :package-label="PACKAGE_LABELS[pkg]"
    :months="months"
    :outstanding="outstandingMachines"
    @close="confirmOpen = false"
    @confirm="confirm"
  />
</template>
