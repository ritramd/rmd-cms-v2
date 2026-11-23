<script setup lang="ts">
// Figma: 1.7-D-Final Homepage shell (1097:42241) — sidebar + sticky header.
import AppHeader from '@/components/layout/AppHeader.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { getSession } from '@/services/auth'

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    noPadding?: boolean
    hideHeader?: boolean
  }>(),
  {
    noPadding: false,
    hideHeader: false,
  },
)

const search = defineModel<string>('search', { default: '' })
const userName = getSession()?.name ?? 'Admin'
</script>

<template>
  <div class="flex min-h-screen bg-canvas">
    <!-- No mobile menu in the design yet; the sidebar shows from the lg breakpoint. -->
    <AppSidebar class="sticky top-0 hidden h-screen shrink-0 lg:flex" />
    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Pages whose design has a different header (e.g. Atur Produk) pass their own. -->
      <slot v-if="!hideHeader" name="header">
        <AppHeader v-model:search="search" :title="title" :subtitle="subtitle" :user-name="userName" />
      </slot>
      <main :class="noPadding ? 'flex flex-1 flex-col min-h-0' : 'flex flex-col gap-8 px-8 pb-12'">
        <slot />
      </main>
    </div>
  </div>
</template>
