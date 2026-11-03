<script setup lang="ts">
// Figma: compact page header on Atur Produk (1097:22028) — title, bordered search, round bell and avatar.
// Penjualan (1097:20239) adds a filter row below it through the default slot.
import avatarPlaceholder from '@/assets/demo/avatar-admin.png'
import NotificationMenu from '@/components/announcement/NotificationMenu.vue'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { getSession } from '@/services/auth'

defineProps<{
  title: string
  searchPlaceholder: string
}>()

defineEmits<{
  /** Enter in the search field. */
  submit: [query: string]
}>()

const search = defineModel<string>('search', { default: '' })
const userName = getSession()?.name ?? 'Admin'
</script>

<template>
  <header class="flex flex-col gap-6 px-8" :class="$slots.default ? 'pt-6 pb-[25px]' : 'pt-10 pb-10'">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-2xl font-bold text-ink-strong">{{ title }}</h1>
      <div class="flex items-center gap-4">
        <label class="relative block w-64 max-w-[50vw]">
          <span class="sr-only">{{ searchPlaceholder }}</span>
          <AppIcon name="search-sm" class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            v-model="search"
            type="search"
            :placeholder="searchPlaceholder"
            class="w-full rounded-lg border border-line bg-surface py-[9px] pr-3 pl-9 text-sm text-ink-strong outline-none placeholder:text-ink-subtle focus:border-primary focus:ring-2 focus:ring-primary/20"
            @keydown.enter="$emit('submit', search)"
          />
        </label>
        <NotificationMenu trigger="round" />
        <!-- Placeholder photo until the user API exposes an avatar. -->
        <UserAvatar :src="avatarPlaceholder" :name="userName" shape="round" />
      </div>
    </div>
    <slot />
  </header>
</template>
