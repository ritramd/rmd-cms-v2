<script setup lang="ts">
import PageHeader from '@/components/layout/PageHeader.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import emptyIllustration from '@/assets/flashsale/empty-flashsale.png'
</script>

<template>
  <DashboardLayout title="Almost Expired Item">
    <template #header>
      <PageHeader title="Almost Expired Item" search-placeholder="Cari item..." />
    </template>

    <div class="rounded-2xl border border-line-faint bg-surface p-12 text-center shadow-card">
      <div class="mx-auto mb-4 h-[180px] w-[280px]">
        <img
          :src="emptyIllustration"
          alt="Almost Expired Item"
          class="size-full object-contain pointer-events-none"
        />
      </div>
      <h2 class="font-inter text-2xl font-bold text-ink-strong">
        Almost Expired Item
      </h2>
      <p class="mt-2 text-sm text-ink-muted">
        Atur diskon dan promosi otomatis untuk produk yang mendekati masa kedaluwarsa.
      </p>
    </div>
  </DashboardLayout>
</template>
