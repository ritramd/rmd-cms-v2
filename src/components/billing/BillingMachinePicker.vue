<script setup lang="ts">
// "Pilih Mesin" list of v1 pages/subscription-end.vue. Machines with outstanding months are always
// part of the payment (the server adds them anyway), so they show checked and locked.
import { computed } from 'vue'
import { fieldLabelClass } from '@/components/products/formStyles'
import AppCheckbox from '@/components/ui/AppCheckbox.vue'
import type { BillingMachine, OutstandingMachine } from '@/types/billing'

const props = defineProps<{
  machines: BillingMachine[]
  /** Outstanding info by machine id. */
  outstanding: Map<number, OutstandingMachine>
  /** Ids of machines that must be paid for. */
  requiredIds: Set<number>
  selectedCount: number
}>()

/** Optionally selected machines (the required ones are added by the parent). */
const selected = defineModel<number[]>({ required: true })

const selectedSet = computed(() => new Set(selected.value))

function toggle(id: number, on: boolean) {
  selected.value = on ? [...selected.value, id] : selected.value.filter((v) => v !== id)
}

const optionalIds = computed(() => props.machines.map((m) => m.id).filter((id) => !props.requiredIds.has(id)))
const allOptionalSelected = computed(
  () => optionalIds.value.length > 0 && optionalIds.value.every((id) => selectedSet.value.has(id)),
)
function toggleAll(on: boolean) {
  selected.value = on ? optionalIds.value : []
}
</script>

<template>
  <section class="flex flex-col gap-2">
    <div class="flex items-center justify-between gap-3">
      <span :class="fieldLabelClass">Pilih Mesin</span>
      <label v-if="optionalIds.length > 1" class="flex items-center gap-2 text-xs text-ink-muted">
        <AppCheckbox
          :model-value="allOptionalSelected"
          :indeterminate="selected.length > 0 && !allOptionalSelected"
          label="Pilih semua mesin"
          @update:model-value="toggleAll"
        />
        Pilih semua
      </label>
    </div>

    <ul class="max-h-72 divide-y divide-line-soft overflow-y-auto rounded-xl border border-line">
      <li v-for="vm in machines" :key="vm.id">
        <label class="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 hover:bg-surface-muted">
          <span class="flex min-w-0 items-center gap-3">
            <AppCheckbox
              v-if="requiredIds.has(vm.id)"
              :model-value="true"
              disabled
              :label="`${vm.code} wajib ikut dibayar`"
            />
            <AppCheckbox
              v-else
              :model-value="selectedSet.has(vm.id)"
              :label="`Pilih ${vm.code}`"
              @update:model-value="toggle(vm.id, $event)"
            />
            <span class="flex min-w-0 flex-col">
              <span class="text-sm font-semibold text-ink-strong">{{ vm.code }}</span>
              <span v-if="vm.name" class="truncate text-xs text-ink-muted">{{ vm.name }}</span>
            </span>
          </span>
          <span
            v-if="(outstanding.get(vm.id)?.outstanding_months ?? 0) > 0"
            class="shrink-0 rounded-lg bg-danger-soft px-2 py-0.5 text-xs font-bold text-danger-strong"
          >
            {{ outstanding.get(vm.id)?.outstanding_months }} bln tertunggak
          </span>
          <span v-else class="shrink-0 rounded-lg bg-success-soft px-2 py-0.5 text-xs font-bold text-success-strong">Aktif</span>
        </label>
      </li>
    </ul>

    <p class="text-xs text-ink-muted">
      {{ selectedCount }} dari {{ machines.length }} mesin dipilih.
      <template v-if="requiredIds.size">Mesin dengan tagihan tertunggak wajib ikut dibayar.</template>
    </p>
  </section>
</template>
