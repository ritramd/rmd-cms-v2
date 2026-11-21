<script setup lang="ts">
// Figma: Row in User Management Table (1097:28300)
// Mirrored from rmd-cms v1 (pages/users/index.vue).
import AppIcon from '@/components/ui/AppIcon.vue'
import type { UserAndVending } from '@/types/user'
import { formatIndonesianDateTime } from '@/utils/format'

defineProps<{
  user: UserAndVending
  index: number
}>()

defineEmits<{
  edit: [user: UserAndVending]
  delete: [user: UserAndVending]
  showVendings: [user: UserAndVending]
}>()
</script>

<template>
  <tr class="group border-b border-row-line transition-colors hover:bg-surface-muted/40 font-inter text-sm">
    <!-- No -->
    <td class="px-4 py-3.5 text-ink-muted">
      {{ index + 1 }}
    </td>

    <!-- Name -->
    <td class="px-4 py-3.5">
      <div class="font-semibold text-ink-heading truncate max-w-[160px]" :title="user.userName">
        {{ user.userName }}
      </div>
    </td>

    <!-- Email -->
    <td class="px-4 py-3.5">
      <div class="text-ink truncate max-w-[220px]" :title="user.email">
        {{ user.email }}
      </div>
    </td>

    <!-- Role -->
    <td class="px-4 py-3.5 text-ink whitespace-nowrap">
      <span
        class="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium"
        :class="
          user.roleName === 'Priority'
            ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20'
            : user.roleName === 'Pro'
              ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
              : 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/10'
        "
      >
        {{ user.roleName || '-' }}
      </span>
    </td>

    <!-- Assigned Machine -->
    <td class="px-4 py-3.5 text-ink whitespace-nowrap">
      <button
        v-if="user.totalCount > 0"
        type="button"
        title="Lihat daftar mesin"
        class="inline-flex cursor-pointer items-center justify-center rounded-lg bg-surface-muted px-2.5 py-1 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-white focus-visible:outline-2 focus-visible:outline-brand"
        @click="$emit('showVendings', user)"
      >
        {{ user.totalCount }} Mesin
      </button>
      <span v-else class="text-ink-muted">0</span>
    </td>

    <!-- Last Update -->
    <td class="px-4 py-3.5 text-ink whitespace-nowrap">
      <span class="text-xs">{{ formatIndonesianDateTime(user.lastUpdate) }}</span>
    </td>

    <!-- Action Buttons (Sticky Right to guarantee visibility during horizontal scroll) -->
    <td
      class="sticky right-0 z-10 bg-surface group-hover:bg-[#f7f9fc] px-4 py-3.5 text-right shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] border-l border-line-soft/60"
    >
      <div class="inline-flex items-center justify-end gap-2">
        <button
          type="button"
          aria-label="Ubah User"
          title="Ubah User"
          class="flex size-9 items-center justify-center rounded-xl bg-surface-muted text-ink-muted shadow-hairline transition-colors hover:bg-slate-200 hover:text-ink-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary cursor-pointer"
          @click="$emit('edit', user)"
        >
          <AppIcon name="line-pencil" class="size-4" />
        </button>
        <button
          type="button"
          aria-label="Hapus User"
          title="Hapus User"
          class="flex size-9 items-center justify-center rounded-xl bg-danger text-white shadow-hairline transition-colors hover:bg-red-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger cursor-pointer"
          @click="$emit('delete', user)"
        >
          <AppIcon name="line-trash-active" class="size-4 text-white" />
        </button>
      </div>
    </td>
  </tr>
</template>
