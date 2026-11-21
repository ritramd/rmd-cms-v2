<script setup lang="ts">
// Figma: Table in User Management (1097:28273)
// Mirrored from rmd-cms v1 (pages/users/index.vue).
import SortHeader from '@/components/ui/SortHeader.vue'
import type { SortDir, UserAndVending, UserSortField } from '@/types/user'
import UserTableRow from './UserTableRow.vue'

defineProps<{
  users: UserAndVending[]
  loading?: boolean
  page: number
  pageSize: number
  sortField?: UserSortField | null
  sortDir?: SortDir | null
}>()

defineEmits<{
  toggleSort: [field: UserSortField]
  edit: [user: UserAndVending]
  delete: [user: UserAndVending]
  showVendings: [user: UserAndVending]
}>()
</script>

<template>
  <div class="w-full overflow-x-auto overscroll-x-contain pb-2">
    <table class="w-full text-left border-collapse table-fixed min-w-[1128px]">
      <colgroup>
        <col class="w-14" />
        <col class="w-44" />
        <col class="w-60" />
        <col class="w-28" />
        <col class="w-40" />
        <col class="w-64" />
        <col class="w-32" />
      </colgroup>
      <thead>
        <tr class="border-b border-row-line font-inter text-xs font-semibold uppercase tracking-wider text-ink-placeholder">
          <th scope="col" class="px-4 py-4">
            No
          </th>
          <th scope="col" class="px-4 py-4">
            Name
          </th>
          <th scope="col" class="px-4 py-4">
            Email
          </th>
          <th scope="col" class="px-4 py-4">
            Role
          </th>
          <th scope="col" class="px-4 py-4">
            <SortHeader
              label="Assigned Machine"
              :direction="sortField === 'totalCount' ? sortDir ?? null : null"
              @toggle="$emit('toggleSort', 'totalCount')"
            />
          </th>
          <th scope="col" class="px-4 py-4">
            <SortHeader
              label="Last Update"
              :direction="sortField === 'lastUpdate' ? sortDir ?? null : null"
              @toggle="$emit('toggleSort', 'lastUpdate')"
            />
          </th>
          <th
            scope="col"
            class="sticky right-0 z-20 bg-surface px-4 py-4 text-right shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] border-l border-line-soft/60"
          >
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- Loading State -->
        <template v-if="loading">
          <tr v-for="i in 5" :key="`skeleton-${i}`" class="border-b border-row-line animate-pulse">
            <td class="px-4 py-3.5"><div class="h-4 w-6 rounded bg-surface-muted" /></td>
            <td class="px-4 py-3.5"><div class="h-4 w-28 rounded bg-surface-muted" /></td>
            <td class="px-4 py-3.5"><div class="h-4 w-36 rounded bg-surface-muted" /></td>
            <td class="px-4 py-3.5"><div class="h-4 w-16 rounded bg-surface-muted" /></td>
            <td class="px-4 py-3.5"><div class="h-4 w-16 rounded bg-surface-muted" /></td>
            <td class="px-4 py-3.5"><div class="h-4 w-32 rounded bg-surface-muted" /></td>
            <td
              class="sticky right-0 z-10 bg-surface px-4 py-3.5 text-right shadow-[-8px_0_12px_-4px_rgba(0,0,0,0.08)] border-l border-line-soft/60"
            >
              <div class="ml-auto h-9 w-20 rounded bg-surface-muted" />
            </td>
          </tr>
        </template>

        <!-- Empty State -->
        <template v-else-if="users.length === 0">
          <tr>
            <td colspan="7" class="px-6 py-12 text-center text-ink-muted font-inter text-sm">
              Tidak ada data user ditemukan.
            </td>
          </tr>
        </template>

        <!-- Data Rows -->
        <template v-else>
          <UserTableRow
            v-for="(user, index) in users"
            :key="user.userId"
            :user="user"
            :index="(page - 1) * pageSize + index"
            @edit="$emit('edit', user)"
            @delete="$emit('delete', user)"
            @show-vendings="$emit('showVendings', user)"
          />
        </template>
      </tbody>
    </table>
  </div>
</template>
