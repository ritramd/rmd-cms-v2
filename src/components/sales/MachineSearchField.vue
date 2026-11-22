<script setup lang="ts">
// Figma: Machine search on Vending Sales (1097:33454).
// Allows typing to search machines by name or code, with a dropdown list of matching machines.
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { SalesMachine } from '@/types/sales'

const props = withDefaults(
  defineProps<{
    machines: SalesMachine[]
    placeholder?: string
  }>(),
  {
    placeholder: 'Cari mesin apa',
  },
)

const emit = defineEmits<{
  select: [machine: SalesMachine]
}>()

const search = defineModel<string>({ default: '' })

const listId = useId()
const containerRef = ref<HTMLElement | null>(null)
const input = ref<HTMLInputElement>()
const open = ref(false)
const highlighted = ref(0)

const matches = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.machines.slice(0, 20)
  return props.machines
    .filter((m) => (m.name && m.name.toLowerCase().includes(q)) || (m.code && m.code.toLowerCase().includes(q)))
    .slice(0, 20)
})

function selectMachine(machine: SalesMachine) {
  search.value = machine.code || machine.name || ''
  open.value = false
  emit('select', machine)
}

function clear() {
  search.value = ''
  open.value = false
  input.value?.focus()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    open.value = true
    const step = event.key === 'ArrowDown' ? 1 : -1
    highlighted.value = (highlighted.value + step + matches.value.length) % Math.max(matches.value.length, 1)
  } else if (event.key === 'Enter') {
    if (open.value && matches.value[highlighted.value]) {
      event.preventDefault()
      selectMachine(matches.value[highlighted.value])
    }
  } else if (event.key === 'Escape') {
    open.value = false
  }
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div ref="containerRef" class="relative w-full min-w-56 sm:w-auto sm:flex-[0_1_480px]">
    <div
      class="flex min-h-[46px] cursor-text items-center gap-2 rounded-lg border border-line bg-surface py-[7px] pr-[13px] pl-[37px] focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
      @mousedown.self.prevent="input?.focus()"
    >
      <AppIcon name="search-sm" class="pointer-events-none absolute top-[23px] left-3 -translate-y-1/2" />
      <input
        ref="input"
        v-model="search"
        type="search"
        role="combobox"
        :aria-label="placeholder"
        aria-autocomplete="list"
        :aria-expanded="open && matches.length > 0"
        :aria-controls="listId"
        :aria-activedescendant="open && matches.length ? `${listId}-${highlighted}` : undefined"
        :placeholder="placeholder"
        autocomplete="off"
        class="h-7 min-w-24 flex-1 bg-transparent text-sm text-ink-strong outline-none placeholder:text-ink-subtle [&::-webkit-search-cancel-button]:appearance-none"
        @focus="open = true"
        @input="((open = true), (highlighted = 0))"
        @keydown="onKeydown"
      />
      <button
        v-if="search"
        type="button"
        aria-label="Hapus pencarian"
        class="flex size-5 items-center justify-center rounded-full text-xs text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink"
        @click="clear"
      >
        ✕
      </button>
      <AppIcon
        name="line-select-chevron"
        class="shrink-0 cursor-pointer transition-transform"
        :class="open && 'rotate-180'"
        @mousedown.prevent="open = !open; input?.focus()"
      />
    </div>

    <!-- Dropdown matching Figma 1097:33454 -->
    <ul
      v-show="open && matches.length > 0"
      :id="listId"
      role="listbox"
      class="absolute top-full right-0 left-0 z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-line bg-surface py-1 text-sm shadow-card"
    >
      <li
        v-for="(machine, i) in matches"
        :id="`${listId}-${i}`"
        :key="machine.id"
        role="option"
        :aria-selected="i === highlighted"
        class="flex cursor-pointer items-center justify-between gap-3 px-3 py-2 transition-colors"
        :class="i === highlighted ? 'bg-surface-muted text-ink-strong' : 'text-ink'"
        @mousedown.prevent="selectMachine(machine)"
        @mouseenter="highlighted = i"
      >
        <span class="truncate font-medium">{{ machine.name ?? machine.code }}</span>
        <span class="shrink-0 rounded bg-primary-soft px-1.5 py-0.5 text-xs font-semibold text-primary">
          #{{ machine.code }}
        </span>
      </li>
    </ul>
  </div>
</template>
