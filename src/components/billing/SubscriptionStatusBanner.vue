<script setup lang="ts">
// Top of the billing page: whether this is an early renewal or a required one (v1 subscription-end.vue
// had one fixed heading for both). Not in Figma; colours of the status pills.
import { computed } from 'vue'
import { RENEWAL_WARNING_DAYS, type SubscriptionStatus } from '@/utils/subscription'

const props = defineProps<{
  status: SubscriptionStatus
}>()

const longDate = (value: string) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(`${value}T00:00:00`),
  )

const content = computed(() => {
  const status = props.status
  if (status.kind === 'expired') {
    return {
      tone: 'bg-danger-soft text-danger-strong border-danger/30',
      title: 'Masa subscription kamu sudah habis',
      body:
        (status.endDate ? `Subscription berakhir pada ${longDate(status.endDate)}. ` : '') +
        'Perpanjang sekarang untuk membuka kembali semua menu CMS. Menu lain terkunci sampai pembayaran berhasil.',
      role: 'alert',
    }
  }
  if (status.kind === 'active' && status.daysLeft <= RENEWAL_WARNING_DAYS) {
    return {
      tone: 'bg-warning-soft text-warning-strong border-warning/30',
      title: status.daysLeft === 0 ? 'Subscription kamu berakhir hari ini' : `Subscription kamu berakhir dalam ${status.daysLeft} hari`,
      body: `Masa aktif sampai ${longDate(status.endDate)}. Perpanjang sebelum tanggal tersebut agar akses CMS tidak terkunci.`,
      role: 'status',
    }
  }
  if (status.kind === 'active') {
    return {
      tone: 'bg-primary-tint text-primary border-primary/20',
      title: 'Subscription kamu masih aktif',
      body: `Masa aktif sampai ${longDate(status.endDate)}. Kamu bisa memperpanjang lebih awal kapan saja.`,
      role: 'status',
    }
  }
  return null // internal accounts: nothing to renew
})
</script>

<template>
  <section v-if="content" class="w-full rounded-2xl border px-6 py-4" :class="content.tone" :role="content.role">
    <p class="text-sm font-bold">{{ content.title }}</p>
    <p class="mt-1 text-sm">{{ content.body }}</p>
  </section>
</template>
