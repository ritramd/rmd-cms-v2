<script setup lang="ts">
// Figma: header.sticky (1097:42276)
import avatarPlaceholder from '@/assets/demo/avatar-admin.png'
import NotificationMenu from '@/components/announcement/NotificationMenu.vue'
import SearchInput from '@/components/layout/SearchInput.vue'
import UserAvatar from '@/components/layout/UserAvatar.vue'

defineProps<{
  title: string
  subtitle?: string
  userName: string
}>()

const search = defineModel<string>('search', { default: '' })
</script>

<template>
  <header class="sticky top-0 z-10 bg-canvas/80 px-8 py-6 backdrop-blur-[6px]">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-ink-strong">{{ title }}</h1>
        <p v-if="subtitle" class="text-sm text-ink-muted">{{ subtitle }}</p>
      </div>
      <div class="flex items-center gap-4">
        <SearchInput v-model="search" placeholder="Cari mesin, lokasi, atau transaksi..." class="w-80 max-w-[50vw]" />
        <NotificationMenu />
        <!-- Placeholder photo until the user API exposes an avatar. -->
        <UserAvatar :src="avatarPlaceholder" :name="userName" />
      </div>
    </div>
  </header>
</template>
