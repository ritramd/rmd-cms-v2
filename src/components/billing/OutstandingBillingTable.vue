<script setup lang="ts">
// "Tagihan Tertunggak" box of v1 pages/subscription-end.vue: lapsed months per machine.
import type { OutstandingMachine } from '@/types/billing'
import { formatRupiah } from '@/utils/format'

defineProps<{
  machines: OutstandingMachine[]
  total: number
}>()
</script>

<template>
  <section class="flex flex-col gap-3 rounded-xl border border-danger/20 bg-danger-soft p-4">
    <div class="flex flex-col gap-0.5">
      <h3 class="text-sm font-bold text-danger-strong">Tagihan Tertunggak</h3>
      <p class="text-xs text-danger-strong/80">Tagihan tertunggak otomatis dimasukkan ke dalam pembayaran.</p>
    </div>
    <table class="w-full text-left text-xs">
      <thead>
        <tr class="border-b border-danger/20 text-danger-strong">
          <th scope="col" class="py-1.5 pr-2 font-semibold">Mesin</th>
          <th scope="col" class="px-2 py-1.5 font-semibold">Periode</th>
          <th scope="col" class="py-1.5 pl-2 text-right font-semibold">Jumlah</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in machines" :key="m.machine_id" class="border-b border-danger/10 last:border-0">
          <td class="py-1.5 pr-2 font-semibold text-ink-strong">{{ m.code }}</td>
          <td class="px-2 py-1.5 text-ink-muted">{{ m.periods.join(', ') }}</td>
          <td class="py-1.5 pl-2 text-right font-semibold whitespace-nowrap text-danger-strong">{{ formatRupiah(m.amount) }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="border-t border-danger/30 text-danger-strong">
          <td colspan="2" class="pt-2 pr-2 font-semibold">Total tertunggak</td>
          <td class="pt-2 pl-2 text-right font-bold whitespace-nowrap">{{ formatRupiah(total) }}</td>
        </tr>
      </tfoot>
    </table>
  </section>
</template>
