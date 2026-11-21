<script setup lang="ts">
// Figma: Empty Flashsale state (1097:35691 / 1097:36112)
import emptyIllustration from '@/assets/flashsale/empty-flashsale.png'
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="mb-2 h-[218px] w-[337px]">
      <img
        :src="emptyIllustration"
        alt="Belum Ada Flashsale"
        class="size-full object-contain pointer-events-none"
      />
    </div>
    <div class="flex flex-col items-center gap-2">
      <h2 class="font-inter text-[30px] font-bold tracking-[-0.75px] text-ink-strong leading-[36px]">
        Belum Ada Flashsale
      </h2>
      <p class="font-inter text-[16px] font-normal leading-[24px] text-ink-muted">
        Yuk buat kategori flashsale dan pilih produk yang ingin kan
      </p>
    </div>
  </div>
</template>
