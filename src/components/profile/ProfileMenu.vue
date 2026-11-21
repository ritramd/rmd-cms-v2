<script setup lang="ts">
// Figma: Profile Menu Dropdown (1097:12648) & User Avatar Trigger
// Legacy parity: rmd-cms promptGlobalLogout.ts & drawer-menu.vue
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import avatarPlaceholder from '@/assets/demo/avatar-admin.png'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import ChangePasswordModal from '@/components/profile/ChangePasswordModal.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppToast from '@/components/ui/AppToast.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { getSession } from '@/services/auth'
import { logoutUser } from '@/services/user'
import { formatSubscriptionDate } from '@/utils/format'

const props = withDefaults(
  defineProps<{
    src?: string
    name?: string
    shape?: 'square' | 'round'
    align?: 'right' | 'left'
  }>(),
  {
    src: avatarPlaceholder,
    name: 'Admin',
    shape: 'square',
    align: 'right',
  },
)

// Active user session
const user = getSession()

// Computed display labels
const displayName = computed(() => props.name || user?.name || 'Admin')
const userRole = computed(() => user?.subRole || user?.name || 'Master Account')
const packageName = computed(() => user?.package || 'PRO')
const formattedEndDate = computed(() => formatSubscriptionDate(user?.subscription_end_date))

// Dropdown & modal states
const menuOpen = ref(false)
const showChangePassword = ref(false)
const showLogoutConfirm = ref(false)
const loggingOut = ref(false)
const toastMessage = ref<string | null>(null)

const menuRef = ref<HTMLElement | null>(null)

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function openChangePassword() {
  closeMenu()
  showChangePassword.value = true
}

function promptLogout() {
  closeMenu()
  showLogoutConfirm.value = true
}

async function handleConfirmLogout() {
  loggingOut.value = true
  try {
    await logoutUser()
  } finally {
    loggingOut.value = false
    showLogoutConfirm.value = false
  }
}

function onPasswordSuccess(message: string) {
  toastMessage.value = message
}

// Click outside handler
function handleClickOutside(event: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    closeMenu()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div ref="menuRef" class="relative inline-block">
    <!-- Trigger: User Avatar Button -->
    <button
      type="button"
      class="block cursor-pointer rounded-2xl outline-none transition focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      :aria-expanded="menuOpen"
      aria-haspopup="true"
      aria-label="Menu profil pengguna"
      @click.stop="toggleMenu"
    >
      <UserAvatar :src="src" :name="displayName" :shape="shape" />
    </button>

    <!-- Dropdown Popover matching Figma 1097:12648 -->
    <Transition
      enter-from-class="translate-y-2 opacity-0 scale-95"
      enter-active-class="transition duration-150 ease-out"
      leave-to-class="translate-y-2 opacity-0 scale-95"
      leave-active-class="transition duration-100 ease-in"
    >
      <div
        v-if="menuOpen"
        class="absolute top-full z-50 mt-3 w-[360px] sm:w-[382px] rounded-[32px] border border-white bg-surface p-6 shadow-card"
        :class="align === 'right' ? 'right-0' : 'left-0'"
        role="menu"
      >
        <!-- 1. Header: SubRole / Role -->
        <div class="text-sm font-medium text-ink-muted">
          {{ userRole }}
        </div>

        <!-- Divider -->
        <div class="my-3 h-px w-full bg-line-soft" />

        <!-- 2. Ganti Password -->
        <button
          type="button"
          class="flex w-full items-center justify-between py-1 text-left text-sm font-bold text-ink-strong transition hover:text-primary cursor-pointer"
          role="menuitem"
          @click="openChangePassword"
        >
          <span>Ganti Password</span>
        </button>

        <!-- Divider -->
        <div class="my-3 h-px w-full bg-line-soft" />

        <!-- 3. Paket Berlangganan -->
        <div class="flex flex-col gap-2 w-full">
          <div class="flex items-center gap-2 text-sm font-bold text-ink-strong">
            <AppIcon name="package" class="size-4 shrink-0" />
            <span>Paket Berlangganan</span>
          </div>

          <!-- Subscription Badge Card -->
          <router-link
            to="/subscription-end"
            class="flex flex-col rounded-[10px] border border-[#e5e2f7] bg-[#f5f4fd] px-4 py-2 text-left transition hover:border-primary/40 block"
            role="menuitem"
            @click="closeMenu"
          >
            <span class="text-sm font-bold text-[#1a1a2e]">{{ packageName }}</span>
            <span class="text-sm font-bold text-[#1a1a2e]">Masa Berlaku:</span>
            <span class="text-[13px] text-[#1a1a2e]">{{ formattedEndDate }}</span>
          </router-link>
        </div>

        <!-- Divider -->
        <div class="my-3 h-px w-full bg-line-soft" />

        <!-- 4. Keluar -->
        <button
          type="button"
          class="flex w-full items-center gap-2 py-1 text-left text-sm font-bold text-ink-strong transition hover:text-danger-strong cursor-pointer"
          role="menuitem"
          @click="promptLogout"
        >
          <AppIcon name="log-out" class="size-4 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </Transition>

    <!-- Stacked Dialog: Ganti Password Modal (Figma 1097:41893 & 1097:42038) -->
    <ChangePasswordModal
      :open="showChangePassword"
      @close="showChangePassword = false"
      @success="onPasswordSuccess"
    />

    <!-- Logout Confirmation Dialog (Legacy promptGlobalLogout.ts) -->
    <ConfirmDialog
      :open="showLogoutConfirm"
      title="Keluar dari Akun"
      :message="`Apakah Anda yakin ingin logout dari akun ${displayName}?`"
      confirm-label="Keluar"
      cancel-label="Batal"
      :busy="loggingOut"
      @confirm="handleConfirmLogout"
      @close="showLogoutConfirm = false"
    />

    <!-- Toast for change password success -->
    <AppToast v-model="toastMessage" variant="success" />
  </div>
</template>
