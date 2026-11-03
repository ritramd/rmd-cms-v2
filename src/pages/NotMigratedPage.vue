<script setup lang="ts">
// Fallback for sidebar links whose pages haven't been ported from rmd-cms v1 yet.
import { useRoute } from 'vue-router'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

const route = useRoute()
</script>

<template>
  <DashboardLayout title="Segera Hadir">
    <section class="rounded-[32px] border border-white bg-surface p-8 shadow-card">
      <p class="text-sm text-ink-muted">
        Halaman <code class="font-mono text-ink-strong">{{ route.path }}</code> belum dipindahkan ke CMS v2.
      </p>
      <RouterLink to="/" class="mt-4 inline-block text-sm font-bold text-primary hover:underline">← Kembali ke Dashboard</RouterLink>
    </section>
  </DashboardLayout>
</template>
