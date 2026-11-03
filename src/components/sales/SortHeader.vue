<script setup lang="ts">
// Figma: sortable column headers with arrow-drop-up (1097:33520, 1097:33528). The arrow pair is one asset;
// the active half (up = ascending, down = descending) is tinted, the other faded.
import sortIcon from '@/assets/table/sort-toggle.svg'
import TintedIcon from '@/components/ui/TintedIcon.vue'

defineProps<{
  label: string
  /** Direction when this column is the active sort, else null. */
  direction: 'asc' | 'desc' | null
}>()

defineEmits<{ toggle: [] }>()
</script>

<template>
  <button
    type="button"
    class="group inline-flex items-center uppercase hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-link"
    @click="$emit('toggle')"
  >
    {{ label }}
    <span class="relative -my-1 size-6 shrink-0" aria-hidden="true">
      <img v-if="!direction" :src="sortIcon" alt="" />
      <template v-else>
        <TintedIcon
          :src="sortIcon"
          :color="direction === 'asc' ? 'bg-link' : 'bg-line-strong'"
          class="absolute inset-0 [clip-path:inset(0_0_50%_0)]"
        />
        <TintedIcon
          :src="sortIcon"
          :color="direction === 'desc' ? 'bg-link' : 'bg-line-strong'"
          class="absolute inset-0 [clip-path:inset(50%_0_0_0)]"
        />
      </template>
    </span>
  </button>
</template>
