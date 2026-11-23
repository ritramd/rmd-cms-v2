<script setup lang="ts">
// Figma: 5.11-D-UI Editor overlay (1097:17962)
import { computed, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppModal from '@/components/ui/AppModal.vue'
import type { Advertisement } from '@/types/advertisement'
import type { KelolaVendingMachine } from '@/types/kelolaVending'

const props = defineProps<{
  open: boolean
  advertisements: Advertisement[]
  machines: KelolaVendingMachine[]
}>()

defineEmits<{
  close: []
}>()

const selectedMachineCode = ref(props.machines[0]?.code || 'VMENIG010')

const headerAd = computed(() => {
  return props.advertisements.find(
    (a) => a.spot.toLowerCase().includes('header') && a.vmcode.includes(selectedMachineCode.value),
  )
})

const idleAd = computed(() => {
  return props.advertisements.find(
    (a) => a.spot.toLowerCase().includes('idle') && a.vmcode.includes(selectedMachineCode.value),
  )
})

const footerAd = computed(() => {
  return props.advertisements.find(
    (a) => a.spot.toLowerCase().includes('footer') && a.vmcode.includes(selectedMachineCode.value),
  )
})

const dispenseAd = computed(() => {
  return props.advertisements.find(
    (a) => a.spot.toLowerCase().includes('dispense') && a.vmcode.includes(selectedMachineCode.value),
  )
})
</script>

<template>
  <AppModal
    :open="open"
    title="UI Editor Screen Layout"
    width="w-[960px]"
    @close="$emit('close')"
  >
    <div class="space-y-6">
      <!-- Machine Selection Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-canvas p-4">
        <div class="flex items-center gap-3">
          <label class="text-xs font-bold uppercase text-ink-subtle">Pilih Mesin Vending:</label>
          <div class="relative min-w-[240px]">
            <select
              v-model="selectedMachineCode"
              class="w-full appearance-none rounded-xl border border-line bg-surface py-2 pr-9 pl-3 text-xs font-semibold text-ink outline-none transition focus:border-primary"
            >
              <option v-for="m in machines" :key="m.code" :value="m.code">
                {{ m.code }} - {{ m.name }}
              </option>
            </select>
            <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-ink-subtle">
              <AppIcon name="line-chevron-down" class="size-3.5" />
            </span>
          </div>
        </div>

        <span class="text-xs text-ink-muted">
          Pratinjau tampilan banner yang aktif pada layar mesin ini
        </span>
      </div>

      <!-- Simulated Machine Screen (1080x1920 portrait kiosk display) -->
      <div class="mx-auto flex w-full max-w-md flex-col overflow-hidden rounded-3xl border-4 border-ink-heading bg-black p-3 shadow-2xl">
        <!-- TOP: Header Slot -->
        <div class="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-blue-950/80 text-white">
          <img
            v-if="headerAd"
            :src="headerAd.file"
            :alt="headerAd.description"
            class="size-full object-cover"
          />
          <div v-else class="flex flex-col items-center justify-center text-center p-2">
            <span class="text-xs font-bold uppercase tracking-wider text-blue-400">Slot Header</span>
            <span class="text-[10px] text-white/60">Belum ada konten diterapkan</span>
          </div>
        </div>

        <!-- MIDDLE: Idle / Dispense Content Zone -->
        <div class="relative my-3 flex h-64 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-purple-950/80 text-white">
          <img
            v-if="idleAd"
            :src="idleAd.file"
            :alt="idleAd.description"
            class="size-full object-cover"
          />
          <div v-else class="flex flex-col items-center justify-center text-center p-4">
            <span class="text-sm font-bold uppercase tracking-wider text-purple-400">Slot Idle Screen</span>
            <span class="mt-1 text-xs text-white/60">Tampil otomatis saat layar dalam mode siaga</span>
          </div>
        </div>

        <!-- Dispense View Preview Info -->
        <div v-if="dispenseAd" class="mb-3 rounded-xl border border-emerald-500/30 bg-emerald-950/60 p-2 text-center text-white">
          <span class="text-[10px] font-bold uppercase text-emerald-400">Dispense View Aktif:</span>
          <span class="ml-1 text-[11px]">{{ dispenseAd.description }}</span>
        </div>

        <!-- BOTTOM: Footer Slot -->
        <div class="relative flex h-20 w-full items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-amber-950/80 text-white">
          <img
            v-if="footerAd"
            :src="footerAd.file"
            :alt="footerAd.description"
            class="size-full object-cover"
          />
          <div v-else class="flex flex-col items-center justify-center text-center p-2">
            <span class="text-xs font-bold uppercase tracking-wider text-amber-400">Slot Footer</span>
            <span class="text-[10px] text-white/60">Belum ada konten diterapkan</span>
          </div>
        </div>
      </div>

      <!-- Footer Action -->
      <div class="flex items-center justify-between border-t border-line-soft pt-4">
        <RouterLink
          :to="`/live-preview?machine=${selectedMachineCode}&from=ui-material`"
          class="inline-flex items-center gap-2 rounded-xl bg-primary-soft px-4 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-white transition"
        >
          <AppIcon name="devices" class="size-4" />
          <span>Buka Full UI Editor & Live Preview</span>
        </RouterLink>

        <AppButton variant="secondary" @click="$emit('close')">
          Tutup
        </AppButton>
      </div>
    </div>
  </AppModal>
</template>
