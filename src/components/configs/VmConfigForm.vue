<script setup lang="ts">
// "VM Configuration" card of v1's pages/vm-config: kiosk features, journey/look, payment gateway.
// No Figma frame; built from the product form fields (formStyles) and the v2 card style.
import { computed, useId } from 'vue'
import ColorField from '@/components/configs/ColorField.vue'
import ConfigField from '@/components/configs/ConfigField.vue'
import ConfigToggleRow from '@/components/configs/ConfigToggleRow.vue'
import { JOURNEY_OPTIONS, MODULE_OPTIONS, QR_PROVIDER_OPTIONS, TEMPLATE_OPTIONS } from '@/components/configs/options'
import { fieldClass, fieldStateClass } from '@/components/products/formStyles'
import type { ConfigErrors, VmConfigForm } from '@/types/vmConfig'

const props = defineProps<{
  code: string
  /** False when the machine has no config row yet (saving creates it). */
  exists: boolean
  errors: ConfigErrors<VmConfigForm>
  /** dev sub role: may edit e-money, QR provider, MID and TID (v1 rule). */
  isDev: boolean
  /** Pro / Priority package or dev: may pick the Cart Purchase journey (v1 rule). */
  canUseCart: boolean
}>()

const form = defineModel<VmConfigForm>({ required: true })

const templateListId = useId()
const providerListId = useId()

/** Cart Purchase is hidden from plans without it, unless the machine already uses it. */
const journeyOptions = computed(() =>
  JOURNEY_OPTIONS.filter((o) => o.value !== 'CartPurchase' || props.canUseCart || form.value.journey === o.value),
)

const field = (name: keyof VmConfigForm) => [fieldClass, fieldStateClass(!!props.errors[name])]
</script>

<template>
  <section class="flex flex-col gap-6 rounded-2xl bg-surface p-6 shadow-card">
    <header class="flex flex-col gap-1">
      <h2 class="text-lg font-bold text-ink-strong">VM Configuration</h2>
      <p class="text-sm text-ink-muted">
        Pengaturan kiosk mesin <span class="font-bold text-ink-strong">{{ code }}</span>
      </p>
      <p v-if="!exists" class="mt-1 rounded-lg bg-warning-soft px-3 py-2 text-xs font-medium text-warning-strong">
        Mesin ini belum pernah dibuatkan config. Menyimpan akan membuat config baru.
      </p>
    </header>

    <div class="flex flex-col">
      <h3 class="text-xs font-bold tracking-[1.2px] text-ink-subtle uppercase">Fitur</h3>
      <div class="divide-y divide-line-soft">
        <ConfigToggleRow v-model="form.isIdleScreen" label="Idle Screen" hint="Tampilkan layar idle saat mesin tidak dipakai" />
        <ConfigToggleRow v-model="form.isCash" label="Pembayaran Tunai" hint="Terima uang tunai (cash)" />
        <ConfigToggleRow v-model="form.isQris" label="QRIS" hint="Wajib isi MID & TID bila aktif" />
        <ConfigToggleRow v-model="form.isEmoney" label="E-Money" :locked="!isDev" />
        <ConfigToggleRow v-model="form.isVoucher" label="Voucher" />
        <ConfigToggleRow v-model="form.isMaintenance" label="Under Maintenance" hint="Mesin berhenti melayani transaksi" />
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <h3 class="text-xs font-bold tracking-[1.2px] text-ink-subtle uppercase">Alur & Tampilan</h3>
      <div class="grid gap-4 sm:grid-cols-2">
        <ConfigField label="Journey" :error="errors.journey">
          <select v-model="form.journey" :class="field('journey')">
            <option value="" disabled>Pilih Journey</option>
            <option v-for="o in journeyOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </ConfigField>
        <ConfigField label="Module" :error="errors.module">
          <select v-model="form.module" :class="field('module')">
            <option value="" disabled>Pilih Modul</option>
            <option v-for="o in MODULE_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </ConfigField>
        <ConfigField label="Template" :error="errors.prefixUrl" class="sm:col-span-2">
          <input
            v-model.trim="form.prefixUrl"
            type="text"
            :list="templateListId"
            placeholder="Pilih atau ketik template"
            :class="field('prefixUrl')"
          />
          <datalist :id="templateListId">
            <option v-for="o in TEMPLATE_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
          </datalist>
        </ConfigField>
        <ConfigField label="Button Color" :error="errors.buttonColor">
          <ColorField v-model="form.buttonColor" label="Button Color" :invalid="!!errors.buttonColor" />
        </ConfigField>
        <ConfigField label="Font Color" :error="errors.fontColor">
          <ColorField v-model="form.fontColor" label="Font Color" :invalid="!!errors.fontColor" />
        </ConfigField>
      </div>
      <!-- Live sample of the two colors, as the kiosk button will look. -->
      <div class="flex items-center gap-3 rounded-lg bg-surface-muted px-3 py-2">
        <span class="text-xs text-ink-muted">Pratinjau</span>
        <span
          class="rounded-lg px-4 py-1.5 text-sm font-bold"
          :style="{ backgroundColor: form.buttonColor, color: form.fontColor }"
        >
          Beli Sekarang
        </span>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <h3 class="text-xs font-bold tracking-[1.2px] text-ink-subtle uppercase">Payment Gateway</h3>
      <div class="grid gap-4 sm:grid-cols-2">
        <ConfigField label="QR Provider" :error="errors.qrProviders" :locked="!isDev" class="sm:col-span-2">
          <input
            v-model.trim="form.qrProviders"
            type="text"
            :list="providerListId"
            placeholder="Pilih Payment Gateway"
            :disabled="!isDev"
            :class="[field('qrProviders'), 'disabled:cursor-not-allowed disabled:opacity-60']"
          />
          <datalist :id="providerListId">
            <option v-for="o in QR_PROVIDER_OPTIONS" :key="o.value" :value="o.value">{{ o.label }}</option>
          </datalist>
        </ConfigField>
        <ConfigField label="MID" :error="errors.mid" :locked="!isDev">
          <input v-model.trim="form.mid" type="text" autocomplete="off" :disabled="!isDev" :class="[field('mid'), 'disabled:cursor-not-allowed disabled:opacity-60']" />
        </ConfigField>
        <ConfigField label="TID" :error="errors.tid" :locked="!isDev">
          <input v-model.trim="form.tid" type="text" autocomplete="off" :disabled="!isDev" :class="[field('tid'), 'disabled:cursor-not-allowed disabled:opacity-60']" />
        </ConfigField>
        <template v-if="form.isEmoney">
          <ConfigField label="MID E-Money" :locked="!isDev">
            <input v-model.trim="form.mid_emoney" type="text" autocomplete="off" :disabled="!isDev" :class="[field('mid_emoney'), 'disabled:cursor-not-allowed disabled:opacity-60']" />
          </ConfigField>
          <ConfigField label="TID E-Money" :locked="!isDev">
            <input v-model.trim="form.tid_emoney" type="text" autocomplete="off" :disabled="!isDev" :class="[field('tid_emoney'), 'disabled:cursor-not-allowed disabled:opacity-60']" />
          </ConfigField>
        </template>
      </div>
    </div>
  </section>
</template>
