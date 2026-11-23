<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppIcon from './AppIcon.vue'

export interface BreadcrumbItem {
  label: string
  to?: string | { name?: string; path?: string; params?: Record<string, string> }
}

defineProps<{
  items: BreadcrumbItem[]
}>()
</script>

<template>
  <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-sm font-medium whitespace-nowrap shrink-0">
    <template v-for="(item, index) in items" :key="index">
      <div v-if="index > 0" class="flex items-center text-ink-subtle shrink-0">
        <AppIcon name="line-chevron-right" class="size-3.5 text-ink-muted" />
      </div>

      <RouterLink
        v-if="item.to && index < items.length - 1"
        :to="item.to"
        class="text-ink-muted hover:text-primary transition-colors font-medium whitespace-nowrap"
      >
        {{ item.label }}
      </RouterLink>
      <span
        v-else
        class="text-ink-strong font-semibold whitespace-nowrap"
        :aria-current="index === items.length - 1 ? 'page' : undefined"
      >
        {{ item.label }}
      </span>
    </template>
  </nav>
</template>
