<script setup lang="ts">
// Figma: Component 9 (11:1328). Renders a <tr>; use inside a <table class="table-fixed">.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { IconName } from '@/assets/icons'
import type { VendingMachine, VendingType } from '@/types/vending'
import { formatRupiah } from '@/utils/format'
import AppIcon from './AppIcon.vue'
import IconButton from './IconButton.vue'
import StatusBadge from './StatusBadge.vue'
import StockProgress from './StockProgress.vue'

withDefaults(
  defineProps<{
    machine: VendingMachine
    isUpward?: boolean
  }>(),
  {
    isUpward: false,
  },
)

defineEmits<{
  actions: [machine: VendingMachine]
}>()

const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})

// Machines without a known type use the snack (robot) styling as the generic machine icon.
const typeStyles: Record<VendingType, { icon: IconName; tile: string }> = {
  snack: { icon: 'machine-snack', tile: 'bg-primary-soft' },
  drink: { icon: 'machine-drink', tile: 'bg-surface-muted' },
  coffee: { icon: 'machine-coffee', tile: 'bg-surface-muted' },
}
</script>

<template>
  <tr class="border-b border-surface-muted transition-colors last:border-b-0 hover:bg-surface-muted">
    <td class="py-[16.5px] pl-4">
      <div class="flex items-center gap-4">
        <RouterLink
          :to="`/vending-sales/${machine.id}`"
          class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform hover:scale-105"
          :class="typeStyles[machine.type ?? 'snack'].tile"
          :title="`Lihat detail ${machine.name}`"
        >
          <AppIcon :name="typeStyles[machine.type ?? 'snack'].icon" />
        </RouterLink>
        <div class="min-w-0">
          <RouterLink
            :to="`/vending-sales/${machine.id}`"
            class="group/link block min-w-0"
            :title="`Lihat detail ${machine.name}`"
          >
            <p class="truncate text-sm font-bold text-ink-strong transition-colors group-hover/link:text-primary">
              {{ machine.name }}
            </p>
            <p class="truncate text-xs text-ink-muted">ID: #{{ machine.id }}</p>
          </RouterLink>
        </div>
      </div>
    </td>
    <td class="truncate py-[16.5px] text-sm font-medium text-ink">
      <RouterLink
        v-if="machine.location"
        :to="`/vending-sales/${machine.id}`"
        class="transition-colors hover:text-primary"
        :title="`Lihat lokasi ${machine.location}`"
      >
        {{ machine.location }}
      </RouterLink>
      <span v-else class="text-ink-subtle" title="Data lokasi belum tersedia">—</span>
    </td>
    <td class="py-[16.5px]">
      <StatusBadge :status="machine.status" />
    </td>
    <td class="py-[16.5px]">
      <StockProgress :value="machine.stock" />
    </td>
    <td class="py-[16.5px] text-sm font-bold whitespace-nowrap text-ink-strong">
      <template v-if="machine.revenue !== undefined">{{ formatRupiah(machine.revenue) }}</template>
      <span v-else class="font-medium text-ink-subtle" title="Data penjualan per mesin belum tersedia">—</span>
    </td>
    <td class="relative py-[16.5px] pr-4">
      <div ref="menuRef" class="relative flex justify-end">
        <IconButton
          :label="`Aksi untuk ${machine.name}`"
          :aria-expanded="menuOpen"
          aria-haspopup="true"
          @click.stop="toggleMenu"
        />

        <Transition
          enter-from-class="translate-y-1 opacity-0 scale-95"
          enter-active-class="transition duration-150 ease-out"
          enter-to-class="translate-y-0 opacity-100 scale-100"
          leave-from-class="translate-y-0 opacity-100 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-to-class="translate-y-1 opacity-0 scale-95"
        >
          <div
            v-if="menuOpen"
            class="absolute right-0 z-40 w-48 rounded-2xl border border-line bg-surface p-1.5 shadow-card"
            :class="isUpward ? 'bottom-full mb-2' : 'top-full mt-2'"
          >
            <RouterLink
              :to="`/vending-sales/${machine.id}`"
              class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-ink-strong transition-colors hover:bg-surface-muted hover:text-primary"
              @click="closeMenu"
            >
              <AppIcon name="receipt" class="size-4 shrink-0 text-ink-muted" />
              <span>Lihat Penjualan</span>
            </RouterLink>

            <RouterLink
              :to="`/histori-stok-ulang/${machine.id}`"
              class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-ink-strong transition-colors hover:bg-surface-muted hover:text-primary"
              @click="closeMenu"
            >
              <AppIcon name="assignment" class="size-4 shrink-0 text-ink-muted" />
              <span>Riwayat Stok</span>
            </RouterLink>

            <RouterLink
              :to="`/almost-expired/${machine.id}`"
              class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-ink-strong transition-colors hover:bg-surface-muted hover:text-primary"
              @click="closeMenu"
            >
              <AppIcon name="sell" class="size-4 shrink-0 text-ink-muted" />
              <span>Diskon Kedaluarsa</span>
            </RouterLink>

            <RouterLink
              :to="`/flashsale/${machine.id}`"
              class="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-ink-strong transition-colors hover:bg-surface-muted hover:text-primary"
              @click="closeMenu"
            >
              <AppIcon name="sell" class="size-4 shrink-0 text-ink-muted" />
              <span>Kelola Flashsale</span>
            </RouterLink>
          </div>
        </Transition>
      </div>
    </td>
  </tr>
</template>
