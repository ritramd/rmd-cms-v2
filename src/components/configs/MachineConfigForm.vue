<script setup lang="ts">
// "Machine Configuration (ALO)" card of v1's pages/vm-config: hardware type and drop sensor.
import ConfigField from '@/components/configs/ConfigField.vue'
import ConfigToggleRow from '@/components/configs/ConfigToggleRow.vue'
import { MACHINE_CATEGORY_OPTIONS } from '@/components/configs/options'
import { fieldClass, fieldStateClass } from '@/components/products/formStyles'
import type { ConfigErrors, MachineConfigForm } from '@/types/vmConfig'

defineProps<{
  code: string
  errors: ConfigErrors<MachineConfigForm>
  /** Both fields are editable by the dev sub role only (v1 rule). */
  isDev: boolean
}>()

const form = defineModel<MachineConfigForm>({ required: true })
</script>

<template>
  <section class="flex flex-col gap-6 rounded-2xl bg-surface p-6 shadow-card">
    <header class="flex flex-col gap-1">
      <h2 class="text-lg font-bold text-ink-strong">Konfigurasi Perangkat</h2>
      <p class="text-sm text-ink-muted">
        Jenis mesin dan sensor pada mesin <span class="font-bold text-ink-strong">{{ code }}</span>.
      </p>
    </header>

    <ConfigField label="Kategori Mesin" :error="errors.categories" :locked="!isDev">
      <select
        v-model="form.categories"
        :disabled="!isDev"
        :class="[fieldClass, fieldStateClass(!!errors.categories), 'disabled:cursor-not-allowed disabled:opacity-60']"
      >
        <option value="" disabled>Pilih kategori mesin</option>
        <option v-for="o in MACHINE_CATEGORY_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
    </ConfigField>

    <div class="divide-y divide-line-soft">
      <ConfigToggleRow
        v-model="form.isDropSensor"
        label="Sensor Jatuh (Drop Sensor)"
        hint="Pastikan produk benar-benar jatuh setelah dispense."
        :locked="!isDev"
      />
    </div>
  </section>
</template>
