<script setup lang="ts">
// Figma & Legacy parity: rmd-cms/pages/tutorial/index.vue
// Tata Cara Penggunaan Cloud Management System & Troubleshoot Vending Machine Smartven
import { computed, onMounted, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { ApiError } from '@/services/api'
import { fetchTroubleshoots, fetchTutorials } from '@/services/support'
import type { Troubleshoot, Tutorial } from '@/types/support'

interface GuideItem {
  id: number
  title: string
  type: 'tutorial' | 'troubleshoot'
  file: string
}

const search = ref('')
const activeTab = ref<'all' | 'tutorial' | 'troubleshoot'>('all')

const loading = ref(false)
const error = ref<string | null>(null)
const guides = ref<GuideItem[]>([])

async function loadData() {
  loading.value = true
  error.value = null
  try {
    const [tutorials, troubleshoots] = await Promise.all([
      fetchTutorials().catch(() => [] as Tutorial[]),
      fetchTroubleshoots().catch(() => [] as Troubleshoot[]),
    ])

    const list: GuideItem[] = [
      ...tutorials.map((t) => ({ id: t.id, title: t.title, type: 'tutorial' as const, file: t.file })),
      ...troubleshoots.map((ts) => ({ id: ts.id, title: ts.title, type: 'troubleshoot' as const, file: ts.file })),
    ]

    guides.value = list
  } catch (err) {
    error.value = err instanceof ApiError || err instanceof Error ? err.message : 'Gagal memuat panduan.'
  } finally {
    loading.value = false
  }
}

const filteredGuides = computed(() => {
  let list = guides.value
  if (activeTab.value !== 'all') {
    list = list.filter((g) => g.type === activeTab.value)
  }
  if (search.value.trim()) {
    const query = search.value.toLowerCase().trim()
    list = list.filter((g) => g.title.toLowerCase().includes(query))
  }
  return list
})

onMounted(loadData)
</script>

<template>
  <DashboardLayout
    v-model:search="search"
    title="Tutorial & Troubleshoot"
    subtitle="Tata Cara Penggunaan Cloud Management System & Troubleshoot Vending Machine Smartven"
  >
    <div class="flex flex-col gap-6">
      <!-- Filter controls -->
      <div class="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface p-4 shadow-card">
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-semibold transition cursor-pointer"
            :class="activeTab === 'all' ? 'bg-primary text-white shadow-xs' : 'text-ink-muted hover:bg-surface-muted'"
            @click="activeTab = 'all'"
          >
            Semua
          </button>
          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-semibold transition cursor-pointer"
            :class="activeTab === 'tutorial' ? 'bg-primary text-white shadow-xs' : 'text-ink-muted hover:bg-surface-muted'"
            @click="activeTab = 'tutorial'"
          >
            Tutorial
          </button>
          <button
            type="button"
            class="rounded-xl px-4 py-2 text-sm font-semibold transition cursor-pointer"
            :class="activeTab === 'troubleshoot' ? 'bg-primary text-white shadow-xs' : 'text-ink-muted hover:bg-surface-muted'"
            @click="activeTab = 'troubleshoot'"
          >
            Troubleshoot
          </button>
        </div>

        <div class="text-xs text-ink-muted">
          Menampilkan {{ filteredGuides.length }} panduan
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex min-h-[300px] items-center justify-center rounded-2xl bg-surface p-8 shadow-card">
        <p class="text-sm text-ink-muted">Memuat panduan bantuan…</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl bg-surface p-8 shadow-card">
        <p class="text-sm font-medium text-danger-strong">{{ error }}</p>
        <AppButton variant="primary" @click="loadData">Coba Lagi</AppButton>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredGuides.length === 0" class="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-2xl bg-surface p-8 text-center shadow-card">
        <p class="text-base font-bold text-ink-strong">Belum Ada Panduan</p>
        <p class="text-sm text-ink-muted">Tidak ada dokumen tutorial atau troubleshoot yang cocok dengan kriteria pencarian.</p>
      </div>

      <!-- Guides Grid -->
      <div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="guide in filteredGuides"
          :key="`${guide.type}-${guide.id}`"
          class="flex flex-col justify-between rounded-2xl border border-line-soft bg-surface p-5 shadow-card transition hover:border-primary/40 hover:shadow-glow-success"
        >
          <div class="flex flex-col gap-2">
            <span
              class="self-start rounded-md px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider"
              :class="guide.type === 'tutorial' ? 'bg-primary-soft text-primary' : 'bg-warning-soft text-warning-strong'"
            >
              {{ guide.type === 'tutorial' ? 'Tutorial' : 'Troubleshoot' }}
            </span>
            <h3 class="text-base font-bold text-ink-strong">{{ guide.title }}</h3>
          </div>

          <div class="mt-4 flex items-center justify-end border-t border-line-soft pt-3">
            <a
              v-if="guide.file"
              :href="guide.file"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 rounded-xl bg-canvas px-3.5 py-2 text-xs font-bold text-ink-strong transition hover:bg-surface-muted"
            >
              <AppIcon name="download" class="size-4 shrink-0" />
              <span>Buka Dokumen</span>
            </a>
            <span v-else class="text-xs text-ink-subtle">Tidak ada lampiran</span>
          </div>
        </div>
      </div>
    </div>
  </DashboardLayout>
</template>
