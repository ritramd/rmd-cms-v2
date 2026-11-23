<script setup lang="ts">
// Figma: 5.1-D-Daftar Vending (1097:20872)
import AppButton from '@/components/ui/AppButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { KelolaVendingMachine } from '@/types/kelolaVending'

const props = defineProps<{
  selectedMachine: string
  machines: KelolaVendingMachine[]
  search: string
}>()

const emit = defineEmits<{
  'update:selectedMachine': [value: string]
  'update:search': [value: string]
  select: []
  addMachine: []
}>()
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-4">
    <!-- Left filter controls: machine selector dropdown & Pilih button -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-[220px]">
        <select
          :value="selectedMachine"
          class="w-full appearance-none rounded-xl border border-line bg-surface py-2.5 pr-10 pl-4 text-sm font-semibold text-ink shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          @change="emit('update:selectedMachine', ($event.target as HTMLSelectElement).value)"
        >
          <option value="Semua">Semua Mesin Vending</option>
          <option v-for="m in machines" :key="m.code" :value="m.code">
            {{ m.code }} - {{ m.name }}
          </option>
        </select>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-ink-subtle">
          <AppIcon name="line-chevron-down" class="size-4" />
        </span>
      </div>

      <AppButton variant="secondary" @click="emit('select')">
        Pilih
      </AppButton>
    </div>

    <!-- Right controls: Search input & + Tambah Mesin button -->
    <div class="flex flex-wrap items-center gap-3">
      <div class="relative min-w-[240px] sm:min-w-[280px]">
        <input
          :value="search"
          type="text"
          placeholder="Cari vending machine..."
          class="w-full rounded-xl border border-line bg-surface py-2.5 pr-4 pl-10 text-sm text-ink placeholder:text-ink-subtle shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          @input="emit('update:search', ($event.target as HTMLInputElement).value)"
        />
        <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-subtle">
          <AppIcon name="line-search" class="size-4" />
        </span>
      </div>

      <AppButton variant="primary" class="gap-1.5" @click="emit('addMachine')">
        <AppIcon name="add" class="size-4" />
        <span>Tambah Mesin</span>
      </AppButton>
    </div>
  </div>
</template>
