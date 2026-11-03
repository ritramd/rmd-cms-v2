<script setup lang="ts">
// Figma: aside.w-20 (1097:42242)
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import SidebarNavGroup from '@/components/layout/SidebarNavGroup.vue'
import SidebarNavItem from '@/components/ui/SidebarNavItem.vue'
import SidebarSubItem from '@/components/ui/SidebarSubItem.vue'
import { isNavGroup, navigation, type NavGroup } from '@/config/navigation'

const route = useRoute()

function isActive(path: string) {
  return path === '/' ? route.path === '/' : route.path === path || route.path.startsWith(`${path}/`)
}

// Groups start expanded when one of their pages is open.
const openGroups = ref<Record<string, boolean>>(
  Object.fromEntries(
    navigation.filter(isNavGroup).map((group: NavGroup) => [group.label, group.children.some((c) => isActive(c.to))]),
  ),
)
</script>

<template>
  <aside class="flex h-full w-64 flex-col border-r border-line bg-surface">
    <div class="flex h-20 shrink-0 items-center gap-3 border-b border-line-soft px-8">
      <span
        class="flex size-8 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white drop-shadow-[0_0_10px_rgb(100_149_237/0.3)]"
        aria-hidden="true"
      >
        S
      </span>
      <span class="text-xl font-bold text-ink-strong">Smartven</span>
    </div>

    <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-4 pt-6 pb-6" aria-label="Menu utama">
      <template v-for="(entry, i) in navigation" :key="i">
        <hr v-if="entry === 'divider'" class="border-line-soft" />
        <SidebarNavGroup
          v-else-if="isNavGroup(entry)"
          v-model:open="openGroups[entry.label]"
          :label="entry.label"
          :icon="entry.icon"
        >
          <SidebarSubItem
            v-for="child in entry.children"
            :key="child.to"
            :label="child.label"
            :to="child.to"
            :active="isActive(child.to)"
          />
        </SidebarNavGroup>
        <SidebarNavItem v-else :label="entry.label" :icon="entry.icon" :to="entry.to" :active="isActive(entry.to)" />
      </template>
    </nav>
  </aside>
</template>
