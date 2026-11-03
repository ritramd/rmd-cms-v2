<script setup lang="ts">
// Figma: Component 10 (4:1112) — live preview of the vending machine's customer screen.
import AppIcon from '@/components/ui/AppIcon.vue'
import type { IconName } from '@/assets/icons'
import type { ProductTint, ScreenProduct } from '@/types/screen'
import { formatRupiah } from '@/utils/format'

withDefaults(
  defineProps<{
    products: ScreenProduct[]
    title?: string
    subtitle?: string
    time?: string
    accentColor?: string
    screenColor?: string
  }>(),
  {
    title: 'Haus?',
    subtitle: 'Pilih minuman segar favoritmu.',
    time: '12:45 PM',
    accentColor: '#9ca3af',
    screenColor: '#eff6ff',
  },
)

const tints: Record<ProductTint, { background: string; gradient: string }> = {
  orange: { background: '#ffedd5', gradient: 'rgb(254 215 170 / 0.5), rgb(254 249 195 / 0.5)' },
  blue: { background: '#dcfce7', gradient: 'rgb(191 219 254 / 0.5), rgb(207 250 254 / 0.5)' },
  purple: { background: '#f3e8ff', gradient: 'rgb(255 237 213 / 0.5), rgb(252 231 243 / 0.5)' },
  red: { background: '#fee2e2', gradient: 'rgb(254 202 202 / 0.5), rgb(255 237 213 / 0.5)' },
}

const navItems: { icon: IconName; label: string }[] = [
  { icon: 'home', label: 'Menu' },
  { icon: 'search-outline', label: 'Cari' },
  { icon: 'shopping-cart', label: 'Keranjang' },
]
</script>

<template>
  <div class="relative w-[340px] font-inter transition-transform duration-300 hover:scale-[1.01]">
    <div class="absolute inset-x-[12.5%] -bottom-12 h-8 rounded-full bg-black/20 blur-md" aria-hidden="true" />

    <div class="relative h-[640px] overflow-clip rounded-[32px] border-8 border-line-soft bg-surface shadow-device">
      <div class="absolute inset-x-0 top-0 flex h-8 items-center justify-between bg-black px-6">
        <div class="flex gap-1">
          <span v-for="i in 3" :key="i" class="size-1 rounded-full bg-white/50" />
        </div>
        <span class="text-[10px] leading-[15px] text-white/50">{{ time }}</span>
      </div>

      <!-- Extends 44px past the frame like the design, so the bottom nav labels are clipped. -->
      <div class="absolute inset-x-0 top-8 -bottom-11 flex flex-col justify-between" :style="{ backgroundColor: screenColor }">
        <header class="h-44 shrink-0 px-6 pt-8">
          <div class="flex items-start justify-between">
            <div class="flex size-12 items-center justify-center rounded-full shadow-accent" :style="{ backgroundColor: accentColor }">
              <AppIcon name="local-mall" />
            </div>
            <div class="rounded-2xl bg-surface p-2 shadow-hairline">
              <AppIcon name="qr-code" class="my-0.5" />
            </div>
          </div>
          <h2 class="mt-6 text-2xl font-bold text-ink-strong">{{ title }}</h2>
          <p class="mt-1 text-sm text-ink-soft">{{ subtitle }}</p>
        </header>

        <div class="grid h-[368px] shrink-0 grid-cols-2 content-start gap-3 overflow-clip px-6">
          <div
            v-for="product in products"
            :key="product.name"
            class="flex flex-col gap-2 rounded-2xl border border-line-soft bg-surface p-3 shadow-hairline"
          >
            <div
              class="relative flex h-24 items-center justify-center overflow-clip rounded-3xl"
              :style="{ backgroundColor: tints[product.tint].background }"
            >
              <div
                class="absolute inset-0"
                :style="{ backgroundImage: `linear-gradient(42.17deg, ${tints[product.tint].gradient})` }"
              />
              <div class="relative flex h-16 w-10 items-center opacity-60 mix-blend-multiply">
                <img :src="product.image" :alt="product.name" class="size-10 object-cover" />
              </div>
            </div>
            <div>
              <p class="truncate text-sm font-bold text-ink-strong">{{ product.name }}</p>
              <p class="text-xs font-bold text-ink-subtle">{{ formatRupiah(product.price) }}</p>
            </div>
          </div>
        </div>

        <nav class="shrink-0 border-t border-line bg-white/80 px-4 pt-4 pb-6 backdrop-blur-xs">
          <div class="flex items-center gap-16 px-8">
            <div v-for="(item, i) in navItems" :key="item.label" class="flex flex-col items-center gap-1">
              <AppIcon :name="item.icon" class="my-0.5" />
              <span class="text-[10px] leading-[15px] text-ink-subtle" :class="i === 0 ? 'font-bold' : 'font-medium'">
                {{ item.label }}
              </span>
            </div>
          </div>
        </nav>
      </div>
    </div>
  </div>
</template>
