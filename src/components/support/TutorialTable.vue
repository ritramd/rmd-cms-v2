<script setup lang="ts">
// Figma: Tutorial & Troubleshoot table (1097:27510) - 1:1 parity with design
// Legacy parity: rmd-cms/components/bantuan/tutorial.vue & rmd-cms/components/bantuan/troubleshoot.vue
import { computed } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import EntriesPagination from '@/components/ui/EntriesPagination.vue'
import EntriesSelect from '@/components/ui/EntriesSelect.vue'
import { getGuideDownloadUrl } from '@/services/support'
import type { GuideItem } from '@/types/support'

const props = withDefaults(
  defineProps<{
    items: GuideItem[]
    totalItems: number
    loading?: boolean
    isAdmin?: boolean
  }>(),
  {
    loading: false,
    isAdmin: false,
  },
)

const emit = defineEmits<{
  add: []
  edit: [item: GuideItem]
  delete: [item: GuideItem]
}>()

const page = defineModel<number>('page', { default: 1 })
const perPage = defineModel<number>('perPage', { default: 10 })

const totalPages = computed(() => Math.max(1, Math.ceil(props.totalItems / perPage.value)))

const startIndex = computed(() => {
  if (props.totalItems === 0) return 0
  return (page.value - 1) * perPage.value + 1
})

const endIndex = computed(() => {
  return Math.min(page.value * perPage.value, props.totalItems)
})
</script>

<template>
  <div class="rounded-2xl border border-line-soft bg-surface">
    <!-- Top toolbar: Entries select (Figma 1097:27512) + Admin action -->
    <div class="flex items-center justify-between border-b border-line-soft px-6 py-4 md:px-8">
      <EntriesSelect v-model="perPage" />

      <!-- Super Admin Add Button (v1 parity for role_id == 1) -->
      <div v-if="isAdmin" class="flex items-center gap-2">
        <AppButton variant="primary" class="!py-1.5 !px-3 !text-xs font-semibold" @click="emit('add')">
          <AppIcon name="line-plus" class="size-3.5 shrink-0" />
          <span>Tambah Dokumen</span>
        </AppButton>
      </div>
    </div>

    <!-- Table (Figma 1097:27524) -->
    <div class="overflow-x-auto">
      <table class="w-full text-left font-inter">
        <thead>
          <tr class="border-b border-line-soft">
            <th scope="col" class="w-20 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
              NO
            </th>
            <th scope="col" class="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
              JUDUL TUTORIAL
            </th>
            <th scope="col" class="w-36 px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
              ACTION
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-line-soft">
          <!-- Loading skeleton -->
          <tr v-if="loading" v-for="i in 5" :key="`skeleton-${i}`" class="animate-pulse">
            <td class="px-6 py-4 text-sm text-[#64748b]">
              <div class="h-4 w-6 rounded bg-line-soft"></div>
            </td>
            <td class="px-6 py-4 text-sm">
              <div class="h-4 w-3/4 rounded bg-line-soft"></div>
            </td>
            <td class="px-6 py-4 text-right text-sm">
              <div class="ml-auto h-4 w-12 rounded bg-line-soft"></div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-else-if="items.length === 0">
            <td colspan="3" class="px-6 py-12 text-center text-sm text-ink-muted">
              Tidak ada data panduan yang cocok dengan kriteria pencarian.
            </td>
          </tr>

          <!-- Data rows (Figma 1097:27539) -->
          <tr
            v-else
            v-for="(guide, index) in items"
            :key="`${guide.type}-${guide.id}`"
            class="transition-colors hover:bg-surface-muted/40"
          >
            <!-- Row index (Figma 1097:27544) -->
            <td class="px-6 py-4 text-sm text-[#64748b]">
              {{ startIndex + index }}
            </td>

            <!-- Judul Tutorial (Figma 1097:27546) -->
            <td class="px-6 py-4 text-sm font-normal text-[#475569]">
              <div class="flex items-center gap-2">
                <span>{{ guide.title }}</span>
                <span
                  v-if="isAdmin && guide.status === 'draft'"
                  class="rounded-md bg-canvas px-1.5 py-0.5 text-[11px] font-medium text-ink-muted"
                >
                  Draft
                </span>
              </div>
            </td>

            <!-- Action: Unduh (Figma 1097:27553) -->
            <td class="px-6 py-4 text-right">
              <div class="flex items-center justify-end gap-3">
                <a
                  v-if="guide.file"
                  :href="getGuideDownloadUrl(guide)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-sm font-medium text-[#4f46e5] transition hover:underline cursor-pointer"
                  title="Unduh dokumen"
                >
                  Unduh
                </a>
                <span v-else class="text-xs text-ink-placeholder">Tidak ada file</span>

                <!-- Admin edit & delete actions -->
                <template v-if="isAdmin">
                  <button
                    type="button"
                    class="text-xs font-semibold text-primary hover:underline cursor-pointer"
                    title="Ubah dokumen"
                    @click="emit('edit', guide)"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    class="text-xs font-semibold text-danger-strong hover:underline cursor-pointer"
                    title="Hapus dokumen"
                    @click="emit('delete', guide)"
                  >
                    Hapus
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Table Footer / Pagination (Figma 1097:27726) -->
    <div class="flex flex-wrap items-center justify-between gap-4 border-t border-line-soft px-6 py-4 text-sm text-[#94a3b8] md:px-8">
      <div>
        Showing <span class="font-medium text-[#334155]">{{ startIndex }}</span> to
        <span class="font-medium text-[#334155]">{{ endIndex }}</span> of
        <span class="font-medium text-[#334155]">{{ totalItems }}</span> entries
      </div>

      <EntriesPagination v-model:page="page" :total-pages="totalPages" />
    </div>
  </div>
</template>
