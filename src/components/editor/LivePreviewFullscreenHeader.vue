<script setup lang="ts">
// Figma: TopNavBar (1097:12210)
import avatarPlaceholder from '@/assets/demo/avatar-admin.png'
import ProfileMenu from '@/components/profile/ProfileMenu.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps<{
  saving?: boolean
}>()

const emit = defineEmits<{
  exitFullscreen: []
  save: []
}>()
</script>

<template>
  <header class="relative z-30 flex h-[61px] w-full shrink-0 items-center justify-between border-b border-[#e3e8ee] bg-white px-6 shadow-sm">
    <!-- Left: Back Button, Separator, Console Badge & Title (Figma: 1097:12211) -->
    <div class="flex items-center gap-4 shrink-0">
      <button
        type="button"
        class="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 active:scale-95 cursor-pointer"
        title="Kembali ke Tampilan Normal"
        @click="emit('exitFullscreen')"
      >
        <AppIcon name="line-chevron-left" class="size-4" />
      </button>

      <div class="h-6 w-px bg-[#e3e8ee] shrink-0" />

      <div class="flex items-center gap-3 shrink-0">
        <div class="flex size-8 shrink-0 items-center justify-center rounded-2xl bg-[rgba(95,147,236,0.1)] text-[#5f93ec]">
          <AppIcon name="tune-outline" class="size-4" />
        </div>
        <h2 class="text-base font-bold tracking-tight text-[#111827] whitespace-nowrap shrink-0">
          SMARTVEN CONSOLE
        </h2>
      </div>
    </div>

    <!-- Center/Right: Nav items, Save Button, Profile Avatar (Figma: 1097:12220) -->
    <div class="flex items-center gap-6 lg:gap-8 shrink-0">
      <nav class="hidden md:flex items-center gap-5 lg:gap-6 text-sm shrink-0">
        <router-link
          to="/"
          class="font-medium text-[#6b7280] hover:text-[#111827] transition-colors whitespace-nowrap"
        >
          DASHBOARD
        </router-link>
        <router-link
          to="/product"
          class="font-medium text-[#6b7280] hover:text-[#111827] transition-colors whitespace-nowrap"
        >
          PRODUK
        </router-link>
        <router-link
          to="/stok-vending"
          class="font-medium text-[#6b7280] hover:text-[#111827] transition-colors whitespace-nowrap"
        >
          INVENTARIS
        </router-link>
        <span class="font-bold text-[#111827] border-b-2 border-[#5f93ec] pb-0.5 whitespace-nowrap">
          DESAIN
        </span>
        <router-link
          to="/kelola-vending"
          class="font-medium text-[#6b7280] hover:text-[#111827] transition-colors whitespace-nowrap"
        >
          PENGATURAN
        </router-link>
      </nav>

      <div class="flex items-center gap-4 shrink-0">
        <button
          type="button"
          class="flex h-9 shrink-0 items-center justify-center rounded-2xl bg-[#5f93ec] px-4 text-sm font-bold text-white shadow-[0_1px_2px_rgba(59,130,246,0.2)] transition hover:bg-[#4d82dc] active:scale-95 cursor-pointer disabled:opacity-60 whitespace-nowrap"
          :disabled="saving"
          @click="emit('save')"
        >
          <span>{{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
        </button>

        <ProfileMenu
          :src="avatarPlaceholder"
          shape="round"
          align="right"
          class="shrink-0"
        />
      </div>
    </div>
  </header>
</template>
