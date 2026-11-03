<script setup lang="ts">
// Figma: shared shell of 0.2-D-Login (1097:12965) and 0.5-D-Reset Pass (1097:13751).
import heroImage from '@/assets/brand/auth-hero.jpg'
import SmartvenLogo from '@/components/ui/SmartvenLogo.vue'

defineProps<{
  title: string
}>()

const year = new Date().getFullYear()
</script>

<template>
  <div class="flex min-h-screen bg-line-soft">
    <aside class="relative hidden w-[576px] shrink-0 overflow-clip lg:block">
      <img :src="heroImage" alt="" class="absolute inset-0 size-full object-cover" />
      <div class="absolute inset-0 bg-linear-to-b from-transparent from-42% to-black/80" />
      <SmartvenLogo class="absolute top-8 left-8" />
      <figure class="absolute right-12 bottom-12 left-12 flex flex-col gap-2 text-white">
        <blockquote class="max-w-[358px] font-inter text-3xl font-bold tracking-[-0.75px]">
          “Sukses dalam Bisnis Vending Machine”
        </blockquote>
        <figcaption>
          <p class="text-base font-semibold">Rendy Otong</p>
          <p class="text-sm">Senior Vice President</p>
        </figcaption>
      </figure>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <main class="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-12">
        <h1 class="max-w-full text-center font-inter text-3xl font-bold tracking-[-0.75px] text-primary-hover">
          {{ title }}
        </h1>
        <slot />
      </main>

      <footer class="bg-surface-muted py-4 text-center font-inter text-sm font-medium text-ink-strong">
        © {{ year }} PT. Ritra Media Distribusi
      </footer>
    </div>
  </div>
</template>
