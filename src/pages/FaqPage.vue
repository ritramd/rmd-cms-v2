<script setup lang="ts">
// Figma & Legacy parity: rmd-cms/pages/faq/index.vue
// Frequently Asked Questions
import { computed, onMounted, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { fetchFaqs } from '@/services/support'
import type { FaqItem } from '@/types/support'
import { sanitizeHtml } from '@/utils/html'

const search = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const faqs = ref<FaqItem[]>([])
const openIds = ref<Set<number>>(new Set())

async function loadData() {
  loading.value = true
  error.value = null
  try {
    faqs.value = await fetchFaqs()
  } catch (err) {
    error.value = err instanceof ApiError || err instanceof Error ? err.message : 'Gagal memuat FAQ.'
  } finally {
    loading.value = false
  }
}

function toggleFaq(id: number) {
  if (openIds.value.has(id)) {
    openIds.value.delete(id)
  } else {
    openIds.value.add(id)
  }
}

const filteredFaqs = computed(() => {
  if (!search.value.trim()) return faqs.value
  const query = search.value.toLowerCase().trim()
  return faqs.value.filter(
    (item) => item.question.toLowerCase().includes(query) || item.answer.toLowerCase().includes(query),
  )
})

onMounted(loadData)
</script>

<template>
  <DashboardLayout
    v-model:search="search"
    title="FAQ"
    subtitle="Pertanyaan yang Sering Diajukan Seputar Layanan Smartven"
  >
    <div class="flex flex-col gap-6">
      <!-- Loading State -->
      <div v-if="loading" class="flex min-h-[300px] items-center justify-center rounded-2xl bg-surface p-8 shadow-card">
        <p class="text-sm text-ink-muted">Memuat FAQ…</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl bg-surface p-8 shadow-card">
        <p class="text-sm font-medium text-danger-strong">{{ error }}</p>
        <AppButton variant="primary" @click="loadData">Coba Lagi</AppButton>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredFaqs.length === 0" class="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-2xl bg-surface p-8 text-center shadow-card">
        <p class="text-base font-bold text-ink-strong">Belum Ada FAQ</p>
        <p class="text-sm text-ink-muted">Tidak ada pertanyaan yang sesuai dengan pencarian Anda.</p>
      </div>

      <!-- Accordion list -->
      <div v-else class="flex flex-col gap-3">
        <div
          v-for="item in filteredFaqs"
          :key="item.id"
          class="rounded-2xl border border-line-soft bg-surface shadow-card transition"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between gap-4 p-5 text-left cursor-pointer"
            @click="toggleFaq(item.id)"
          >
            <span class="text-base font-bold text-ink-strong">{{ item.question }}</span>
            <span
              class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-surface-muted transition-transform duration-200"
              :class="openIds.has(item.id) ? 'rotate-180' : ''"
            >
              <AppIcon name="chevron-expand" class="size-4" />
            </span>
          </button>

          <div
            v-if="openIds.has(item.id)"
            class="border-t border-line-soft px-5 pb-5 pt-3 text-sm leading-relaxed text-ink"
            v-html="sanitizeHtml(item.answer)"
          />
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
