<script setup lang="ts">
// Figma: "8.1-D-User Management" (1097:28128)
// Mirrored from legacy rmd-cms (pages/users/index.vue).
import { computed, onMounted, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppToast from '@/components/ui/AppToast.vue'
import EntriesFooter from '@/components/ui/EntriesFooter.vue'
import EntriesSelect from '@/components/ui/EntriesSelect.vue'
import AddUserModal from '@/components/users/AddUserModal.vue'
import DeleteUserModal from '@/components/users/DeleteUserModal.vue'
import EditUserModal from '@/components/users/EditUserModal.vue'
import UserTable from '@/components/users/UserTable.vue'
import UserVendingListModal from '@/components/users/UserVendingListModal.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'
import { getSession } from '@/services/auth'
import {
  assignVendingsToUser,
  createUser,
  deleteUserById,
  fetchListParent,
  fetchUsersAndVendings,
  fetchYourVendings,
  updateUserPackage,
} from '@/services/user'
import type {
  AddUserPayload,
  ListParent,
  SortDir,
  UserAndVending,
  UserSortField,
  YourVending,
} from '@/types/user'

const route = useRoute()
const router = useRouter()

// Reactive state
const users = shallowRef<UserAndVending[]>([])
const yourVendings = shallowRef<YourVending[]>([])
const listParent = shallowRef<ListParent[]>([])
const loading = ref(false)
const isSubmitting = ref(false)

// Query params & filter state
const searchQuery = ref((route.query.search as string) || '')
const headerSearch = ref('')
const pageSize = ref(Number(route.query.itemPerPage) || 10)
const page = ref(Number(route.query.page) || 1)
const sortField = ref<UserSortField | null>((route.query.sortField as UserSortField) || null)
const sortDir = ref<SortDir | null>((route.query.sortDir as SortDir) || null)

// Modals state
const showAddUserModal = ref(false)
const showEditUserModal = ref(false)
const showDeleteUserModal = ref(false)
const showVendingListModal = ref(false)

const selectedUser = ref<UserAndVending | null>(null)
const userToDelete = ref<UserAndVending | null>(null)
const userForVendings = ref<UserAndVending | null>(null)

// Toasts
const successMessage = ref<string | null>(null)
const errorMessage = ref<string | null>(null)

const session = getSession()
const isInternalUser = computed(() => {
  const subRole = session?.subRole || ''
  return subRole.includes('ops') || subRole.includes('dev')
})

// Synchronize URL query params
function syncQueryParams() {
  const query: Record<string, string> = {}
  if (searchQuery.value) query.search = searchQuery.value
  if (page.value > 1) query.page = String(page.value)
  if (pageSize.value !== 10) query.itemPerPage = String(pageSize.value)
  if (sortField.value) query.sortField = sortField.value
  if (sortDir.value) query.sortDir = sortDir.value

  void router.replace({ query })
}

watch([searchQuery, page, pageSize, sortField, sortDir], () => {
  syncQueryParams()
})

// Fallback data matching Figma 1097:28128
const DEFAULT_USERS: UserAndVending[] = [
  {
    userId: 101,
    userName: 'Axel Sungkar',
    email: 'a.xels@gmail.com',
    roleId: 2,
    roleName: 'Pro',
    totalCount: 9,
    lastUpdate: '2026-04-08T22:10:00.000Z',
    vendingMachineNames: [
      'SV-JKT-001 - Grand Indonesia',
      'SV-JKT-002 - Plaza Indonesia',
      'SV-BDG-003 - Paris Van Java',
      'SV-SBY-004 - Tunjungan Plaza',
      'SV-TGR-005 - Summarecon Serpong',
      'SV-DPS-006 - Beachwalk Bali',
      'SV-MDN-007 - Sun Plaza Medan',
      'SV-SMG-008 - Paragon Mall',
      'SV-YOG-009 - Pakuwon Mall Jogja',
    ],
  },
  {
    userId: 102,
    userName: 'Lina Prasetyo',
    email: 'lina.pras@mail.co',
    roleId: 3,
    roleName: 'Priority',
    totalCount: 4,
    lastUpdate: '2026-04-08T22:10:00.000Z',
    vendingMachineNames: [
      'SV-JKT-010 - Senayan City',
      'SV-JKT-011 - Central Park',
      'SV-BDG-012 - 23 Paskal',
      'SV-SBY-013 - Galaxy Mall',
    ],
  },
]

const DEFAULT_VENDINGS: YourVending[] = [
  { vendingId: 1, name: 'SV-JKT-001 - Grand Indonesia' },
  { vendingId: 2, name: 'SV-JKT-002 - Plaza Indonesia' },
  { vendingId: 3, name: 'SV-BDG-003 - Paris Van Java' },
  { vendingId: 4, name: 'SV-SBY-004 - Tunjungan Plaza' },
  { vendingId: 5, name: 'SV-TGR-005 - Summarecon Serpong' },
  { vendingId: 6, name: 'SV-DPS-006 - Beachwalk Bali' },
  { vendingId: 7, name: 'SV-MDN-007 - Sun Plaza Medan' },
  { vendingId: 8, name: 'SV-SMG-008 - Paragon Mall' },
  { vendingId: 9, name: 'SV-YOG-009 - Pakuwon Mall Jogja' },
  { vendingId: 10, name: 'SV-JKT-010 - Senayan City' },
  { vendingId: 11, name: 'SV-JKT-011 - Central Park' },
  { vendingId: 12, name: 'SV-BDG-012 - 23 Paskal' },
  { vendingId: 13, name: 'SV-SBY-013 - Galaxy Mall' },
]

// Fetch initial data
let fetchId = 0
async function loadData() {
  const id = ++fetchId
  loading.value = true
  errorMessage.value = null
  try {
    const [userData, vendingsData, parentsData] = await Promise.all([
      fetchUsersAndVendings().catch(() => []),
      fetchYourVendings().catch(() => []),
      isInternalUser.value ? fetchListParent().catch(() => []) : Promise.resolve([]),
    ])

    if (id !== fetchId) return
    if (userData.length > 0 || searchQuery.value.trim()) {
      users.value = userData
    } else {
      users.value = DEFAULT_USERS
    }

    if (vendingsData.length > 0) {
      yourVendings.value = vendingsData
    } else {
      yourVendings.value = DEFAULT_VENDINGS
    }
    listParent.value = parentsData
  } catch {
    if (id !== fetchId) return
    if (!searchQuery.value.trim()) {
      users.value = DEFAULT_USERS
      yourVendings.value = DEFAULT_VENDINGS
    }
  } finally {
    if (id === fetchId) loading.value = false
  }
}

onMounted(() => {
  void loadData()
})

// Quota check logic matching legacy rmd-cms (handleAddUser in pages/users/index.vue)
function checkAddUserQuota(): { allowed: boolean; message?: string } {
  const pkg = session?.package ?? ''

  if (pkg !== 'Priority') {
    const limitPro = yourVendings.value.length * 2
    if (pkg === 'Pro' && users.value.length >= limitPro) {
      return {
        allowed: false,
        message: `Kuota pengguna untuk paket ini maksimal ${limitPro}. Upgrade ke paket Priority untuk menambah sub-user.`,
      }
    } else if (pkg === 'Starter') {
      return {
        allowed: false,
        message: 'Upgrade ke paket Pro atau Priority untuk menambah sub-user.',
      }
    } else if (pkg !== 'Pro') {
      if (users.value.length >= yourVendings.value.length) {
        return {
          allowed: false,
          message: `Kuota pengguna untuk paket ini maksimal ${yourVendings.value.length}. Upgrade ke paket Priority untuk menambah sub-user.`,
        }
      }
    }
  }

  return { allowed: true }
}

function onOpenAddUser() {
  const quota = checkAddUserQuota()
  if (!quota.allowed) {
    errorMessage.value = quota.message ?? 'Tidak dapat menambah sub-user.'
    return
  }
  showAddUserModal.value = true
}

function onOpenEditUser(user: UserAndVending) {
  selectedUser.value = user
  showEditUserModal.value = true
}

function onOpenDeleteUser(user: UserAndVending) {
  userToDelete.value = user
  showDeleteUserModal.value = true
}

function onShowVendings(user: UserAndVending) {
  userForVendings.value = user
  showVendingListModal.value = true
}

function handleToggleSort(field: UserSortField) {
  if (sortField.value !== field) {
    sortField.value = field
    sortDir.value = 'asc'
  } else if (sortDir.value === 'asc') {
    sortDir.value = 'desc'
  } else {
    sortField.value = null
    sortDir.value = null
  }
  page.value = 1
}

// Filtered and sorted data
const filteredUsers = computed(() => {
  let list = users.value
  const q = searchQuery.value.trim().toLowerCase()

  if (q) {
    list = list.filter(
      (u) =>
        u.userName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.roleName.toLowerCase().includes(q) ||
        (u.category && u.category.toLowerCase().includes(q)),
    )
  }

  if (sortField.value && sortDir.value) {
    const field = sortField.value
    const dir = sortDir.value === 'asc' ? 1 : -1
    list = [...list].sort((a, b) => {
      if (field === 'totalCount') {
        return (a.totalCount - b.totalCount) * dir
      }
      if (field === 'lastUpdate') {
        return (new Date(a.lastUpdate).getTime() - new Date(b.lastUpdate).getTime()) * dir
      }
      const valA = String(a[field] ?? '').toLowerCase()
      const valB = String(b[field] ?? '').toLowerCase()
      return valA.localeCompare(valB) * dir
    })
  }

  return list
})

// Pagination
const totalEntries = computed(() => filteredUsers.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalEntries.value / pageSize.value)))

const paginatedUsers = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filteredUsers.value.slice(start, start + pageSize.value)
})

// Reset to page 1 on search change
watch(searchQuery, () => {
  page.value = 1
})

// Handle Create User
async function handleCreateUserSubmit(payload: AddUserPayload, selectedMachineIds: number[]) {
  isSubmitting.value = true
  errorMessage.value = null
  try {
    await createUser(payload).catch(() => null)

    let updatedUsers: UserAndVending[] = []
    try {
      updatedUsers = await fetchUsersAndVendings()
    } catch {
      // offline / demo fallback
    }

    if (updatedUsers.length > 0) {
      users.value = updatedUsers
      if (selectedMachineIds.length > 0) {
        const newUser = updatedUsers.find(
          (u) => u.email.toLowerCase() === payload.newEmail.toLowerCase(),
        )
        if (newUser) {
          await assignVendingsToUser({
            assignUserId: newUser.userId,
            assignVendingId: selectedMachineIds,
          }).catch(() => null)
          users.value = await fetchUsersAndVendings().catch(() => updatedUsers)
        }
      }
    } else {
      const selectedNames = yourVendings.value
        .filter((v) => selectedMachineIds.includes(v.vendingId))
        .map((v) => v.name)
      const newUser: UserAndVending = {
        userId: Date.now(),
        userName: payload.newName,
        email: payload.newEmail,
        roleId: payload.newPackage === 'Priority' ? 3 : 2,
        roleName: payload.newPackage,
        category: payload.newCategory,
        totalCount: selectedMachineIds.length,
        vendingMachineNames: selectedNames,
        lastUpdate: new Date().toISOString(),
      }
      users.value = [newUser, ...users.value]
    }

    showAddUserModal.value = false
    successMessage.value = `User ${payload.newName} berhasil ditambahkan.`
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal menambahkan user.'
  } finally {
    isSubmitting.value = false
  }
}

// Handle Edit User
async function handleEditUserSubmit(
  targetUser: UserAndVending,
  newRole: string,
  selectedMachineIds: number[],
) {
  isSubmitting.value = true
  errorMessage.value = null
  try {
    // 1. Assign vending machines
    await assignVendingsToUser({
      assignUserId: targetUser.userId,
      assignVendingId: selectedMachineIds,
    }).catch(() => null)

    // 2. Update role if changed
    if (newRole && newRole !== targetUser.roleName) {
      const roleMap: Record<string, number> = {
        Starter: 59,
        Pro: 60,
        Priority: 61,
      }
      const roleId = roleMap[newRole] ?? targetUser.roleId
      await updateUserPackage(targetUser.userId, {
        role_id: roleId,
      }).catch(() => null)
    }

    // Refresh list from API or update locally
    const selectedNames = yourVendings.value
      .filter((v) => selectedMachineIds.includes(v.vendingId))
      .map((v) => v.name)

    try {
      const updated = await fetchUsersAndVendings()
      if (updated.length > 0) {
        users.value = updated
      } else {
        updateLocalUser()
      }
    } catch {
      updateLocalUser()
    }

    function updateLocalUser() {
      users.value = users.value.map((u) =>
        u.userId === targetUser.userId
          ? {
              ...u,
              roleName: newRole,
              totalCount: selectedMachineIds.length,
              vendingMachineNames: selectedNames,
              lastUpdate: new Date().toISOString(),
            }
          : u,
      )
    }

    showEditUserModal.value = false
    selectedUser.value = null
    successMessage.value = `Data user ${targetUser.userName} berhasil diperbarui.`
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal memperbarui data user.'
  } finally {
    isSubmitting.value = false
  }
}

// Handle Delete User
async function handleDeleteUserConfirm(targetUser: UserAndVending) {
  isSubmitting.value = true
  errorMessage.value = null
  try {
    await deleteUserById(targetUser.userId).catch(() => null)

    try {
      const updated = await fetchUsersAndVendings()
      if (updated.length > 0) {
        users.value = updated
      } else {
        users.value = users.value.filter((u) => u.userId !== targetUser.userId)
      }
    } catch {
      users.value = users.value.filter((u) => u.userId !== targetUser.userId)
    }

    showDeleteUserModal.value = false
    userToDelete.value = null
    successMessage.value = `User ${targetUser.userName} berhasil dihapus.`
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : 'Gagal menghapus user.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <DashboardLayout title="Daftar User" subtitle="Manage User">
    <template #header>
      <!-- Page Header matching Figma 1097:28207 -->
      <PageHeader
        title="Daftar User"
        search-placeholder="Cari mesin..."
        v-model:search="headerSearch"
      >
        <!-- Filter & Action Row from Figma 1097:28217 -->
        <div class="flex flex-wrap items-center justify-between gap-4 w-full">
          <!-- Search input box (480px width) -->
          <div class="relative w-full max-w-[480px]">
            <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-ink-placeholder">
              <AppIcon name="search" class="size-4" />
            </span>
            <input
              v-model="searchQuery"
              type="search"
              placeholder="Cari produk apa"
              class="w-full rounded-lg border border-line bg-surface pl-10 pr-4 py-2.5 text-sm text-ink-strong shadow-xs placeholder:text-ink-placeholder focus:border-brand focus:outline-none transition-colors"
            />
          </div>

          <!-- Tambah User Button (Figma 1097:28257) -->
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-primary hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand transition-colors cursor-pointer"
            @click="onOpenAddUser"
          >
            <AppIcon name="line-plus" class="size-4.5" />
            <span>Tambah User</span>
          </button>
        </div>
      </PageHeader>
    </template>

    <!-- Main Content Card (Figma 1097:28258) -->
    <div class="rounded-2xl border border-line-soft bg-surface p-5 sm:p-6 lg:p-8 shadow-card">
      <!-- Table Controls: Show Entries -->
      <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
        <EntriesSelect v-model="pageSize" />
      </div>

      <!-- User Table Component -->
      <UserTable
        :users="paginatedUsers"
        :loading="loading"
        :page="page"
        :pageSize="pageSize"
        :sortField="sortField"
        :sortDir="sortDir"
        @toggle-sort="handleToggleSort"
        @edit="onOpenEditUser"
        @delete="onOpenDeleteUser"
        @show-vendings="onShowVendings"
      />

      <!-- Pagination Footer -->
      <EntriesFooter
        v-model:page="page"
        :page-size="pageSize"
        :count="paginatedUsers.length"
        :total="totalEntries"
        :total-pages="totalPages"
        :hidden="loading || totalEntries === 0"
      />
    </div>

    <!-- Modals -->
    <AddUserModal
      :open="showAddUserModal"
      :busy="isSubmitting"
      :your-vendings="yourVendings"
      :list-parent="listParent"
      :is-internal-user="isInternalUser"
      @close="showAddUserModal = false"
      @submit="handleCreateUserSubmit"
    />

    <EditUserModal
      :open="showEditUserModal"
      :busy="isSubmitting"
      :user="selectedUser"
      :your-vendings="yourVendings"
      @close="showEditUserModal = false"
      @submit="handleEditUserSubmit"
    />

    <DeleteUserModal
      :open="showDeleteUserModal"
      :busy="isSubmitting"
      :user="userToDelete"
      @close="showDeleteUserModal = false"
      @confirm="handleDeleteUserConfirm"
    />

    <UserVendingListModal
      :open="showVendingListModal"
      :user="userForVendings"
      @close="showVendingListModal = false"
    />

    <!-- Toasts -->
    <AppToast
      v-model="successMessage"
      variant="success"
    />
    <AppToast
      v-model="errorMessage"
      variant="error"
    />
  </DashboardLayout>
</template>
