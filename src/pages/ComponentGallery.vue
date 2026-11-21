<script setup lang="ts">
// Component gallery for the UI kits (Figma "SMRTVN" component sections).
import { ref } from 'vue'
import type { NavIconName } from '@/assets/icons'
import classicCola from '@/assets/demo/classic-cola.png'
import grapeSoda from '@/assets/demo/grape-soda.png'
import mineralWater from '@/assets/demo/mineral-water.png'
import orangeJuice from '@/assets/demo/orange-juice.png'
import BackButton from '@/components/editor/BackButton.vue'
import BreadcrumbItem from '@/components/editor/BreadcrumbItem.vue'
import CanvasToolButton from '@/components/editor/CanvasToolButton.vue'
import ColorSwatch from '@/components/editor/ColorSwatch.vue'
import EditLink from '@/components/editor/EditLink.vue'
import EditorTab from '@/components/editor/EditorTab.vue'
import MachinePreview from '@/components/editor/MachinePreview.vue'
import OutlineButton from '@/components/editor/OutlineButton.vue'
import SaveButton from '@/components/editor/SaveButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import essenceMask from '@/assets/demo/essence-mask.png'
import faceScrub from '@/assets/demo/face-scrub.png'
import lipScrub from '@/assets/demo/lip-scrub.png'
import magicPotion from '@/assets/demo/magic-potion.png'
import NotificationBell from '@/components/products/NotificationBell.vue'
import ProductPagination from '@/components/products/ProductPagination.vue'
import ProductSidebarItem from '@/components/products/ProductSidebarItem.vue'
import ProductTableRow from '@/components/products/ProductTableRow.vue'
import RedeemVoucherCard from '@/components/billing/RedeemVoucherCard.vue'
import PromotionPaymentModal from '@/components/billing/PromotionPaymentModal.vue'
import ProfileMenu from '@/components/profile/ProfileMenu.vue'
import ChangePasswordModal from '@/components/profile/ChangePasswordModal.vue'
import TutorialTable from '@/components/support/TutorialTable.vue'
import TutorialFormModal from '@/components/support/TutorialFormModal.vue'
import type { GuideItem } from '@/types/support'
import type { VoucherData } from '@/types/billing'
import type { IconName } from '@/assets/icons'
import type { CatalogProduct } from '@/types/product'
import type { ScreenProduct } from '@/types/screen'
import type { VendingMachine } from '@/types/vending'
import AppButton from '@/components/ui/AppButton.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
import IconButton from '@/components/ui/IconButton.vue'
import NotificationButton from '@/components/ui/NotificationButton.vue'
import SidebarNavItem from '@/components/ui/SidebarNavItem.vue'
import SidebarSubItem from '@/components/ui/SidebarSubItem.vue'
import StatusCountCard from '@/components/ui/StatusCountCard.vue'
import TextLink from '@/components/ui/TextLink.vue'
import VendingTableRow from '@/components/ui/VendingTableRow.vue'

const navItems: { icon: NavIconName; label: string }[] = [
  { icon: 'dashboard', label: 'Dashboard' },
  { icon: 'inventory', label: 'Produk' },
  { icon: 'receipt', label: 'Transaksi' },
  { icon: 'tune', label: 'Kelola Vending' },
  { icon: 'assignment', label: 'Laporan' },
  { icon: 'sell', label: 'Promo' },
  { icon: 'history', label: 'Riwayat' },
  { icon: 'receipt-long', label: 'Tagihan' },
  { icon: 'manage-accounts', label: 'Pengguna' },
  { icon: 'help', label: 'Bantuan' },
]
const activeNav = ref<NavIconName>('dashboard')
const activeSub = ref('Daftar vending')

const showBillingModal = ref(false)
const showPasswordModal = ref(false)
const sampleVoucher: VoucherData = {
  voucher: 'PROMO-SAMPLE-2026',
  clientId: 1,
  duration: 1,
  vmId: '1,2',
  billingAmount: 600000,
}

const machines: VendingMachine[] = [
  { id: '829232', name: 'VM-001 Snack', type: 'snack', location: 'Lobby Utama', status: 'online', stock: 85, revenue: 1250000 },
  { id: '829235', name: 'VM-002 Minuman', type: 'drink', location: 'Kantin Lt. 2', status: 'offline', stock: 32, revenue: 450000 },
  { id: '829240', name: 'VM-003 Snack', type: 'snack', location: 'Area Parkir B', status: 'online', stock: 60, revenue: 890000 },
  { id: '829299', name: 'VM-004 Kopi', type: 'coffee', location: 'Ruang Meeting', status: 'maintenance', stock: 95, revenue: 0 },
]

const page = ref(1)

const editorTabs = [
  { icon: 'tune-outline', label: 'Fisik' },
  { icon: 'devices', label: 'Digital' },
  { icon: 'payments', label: 'Pembayaran' },
] as const
const activeTab = ref<string>('Digital')

const defaultColors = { accent: '#9ca3af', screen: '#eff6ff' }
const accentColor = ref(defaultColors.accent)
const screenColor = ref(defaultColors.screen)
const template = ref('grid')
const zoom = ref(1)

const screenProducts: ScreenProduct[] = [
  { name: 'Jus Jeruk', price: 15000, image: orangeJuice, tint: 'orange' },
  { name: 'Air Mineral', price: 5000, image: mineralWater, tint: 'blue' },
  { name: 'Soda Anggur', price: 12000, image: grapeSoda, tint: 'purple' },
  { name: 'Cola Klasik', price: 10000, image: classicCola, tint: 'red' },
]

const productNav: { label: string; icon: IconName; activeIcon?: IconName }[] = [
  { label: 'Dashboard', icon: 'line-home' },
  { label: 'Produk', icon: 'line-cube', activeIcon: 'line-cube' },
  { label: 'Laporan', icon: 'line-bar-chart' },
  { label: 'Pengguna', icon: 'line-users' },
]
const activeProductNav = ref('Produk')
const productPage = ref(1)

const catalog: CatalogProduct[] = [
  { code: '808', name: 'Bright Stuff Face Scrub', variant: '22#Internal 50 ml', description: 'Bright Stuff Face Scrub 50 ml', price: 21000, image: faceScrub },
  { code: '812', name: 'Bright Stuff Essence', variant: 'CIMB Emina 23g', description: 'Bright Stuff Essence Sheet Mask 23 g', price: 14500, image: essenceMask },
  { code: '815', name: 'Magic Potion 01 Scarlet', variant: 'CIMB Magic 5.5ml', description: 'Magic Potion 01 Scarlet 5.5 ml', price: 46000, image: magicPotion },
  { code: '816', name: 'Sugar Rush Lip Scrub', variant: 'CIMB Sugar 4.2gr', description: 'Sugar Rush Lip Scrub 4.2 gr (Pc(s))', price: 38000, image: lipScrub },
]

function zoomBy(steps: number) {
  zoom.value = Math.round((zoom.value + steps * 0.1) * 10) / 10
}

function resetColors() {
  accentColor.value = defaultColors.accent
  screenColor.value = defaultColors.screen
}

const sampleGuides: GuideItem[] = [
  { id: 1, title: 'Membaca pengumuman di papan pengumuman', type: 'tutorial', status: 'publish', file: '230815103625_Membaca-Pengumuman di Announcement Board.pdf' },
  { id: 2, title: 'Pengambilan Data Sales Vending Machine', type: 'tutorial', status: 'publish', file: '230815102939_Pengambilan-Data Sales Vending Machine.pdf' },
  { id: 3, title: 'Error CMOS', type: 'troubleshoot', status: 'publish', file: '230815110533_TROUBLESHOOT-CMOS.pdf' },
]
const galleryTutorialPage = ref(1)
const galleryTutorialPerPage = ref(10)
const showTutorialModal = ref(false)
</script>

<template>
  <main class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-8">
    <header>
      <h1 class="text-2xl font-bold text-ink-strong">Smartven UI Kit</h1>
      <p class="text-sm text-ink-muted">Komponen rmd-cms-v2 dari Figma SMRTVN. Hover setiap elemen untuk melihat state-nya.</p>
    </header>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,260px)_1fr]">
      <section class="flex flex-col gap-1 rounded-2xl bg-surface p-4 shadow-card">
        <h2 class="mb-2 px-1 text-xs font-bold tracking-wide text-ink-subtle uppercase">SidebarNavItem</h2>
        <SidebarNavItem
          v-for="item in navItems"
          :key="item.icon"
          :icon="item.icon"
          :label="item.label"
          :active="activeNav === item.icon"
          @click="activeNav = item.icon"
        />

        <h2 class="mt-4 mb-2 px-1 text-xs font-bold tracking-wide text-ink-subtle uppercase">SidebarSubItem</h2>
        <SidebarSubItem
          v-for="label in ['Daftar vending', 'Planogram', 'Hadiah']"
          :key="label"
          :label="label"
          :active="activeSub === label"
          @click="activeSub = label"
        />
      </section>

      <div class="flex min-w-0 flex-col gap-6">
        <section class="rounded-2xl bg-surface p-6 shadow-card">
          <h2 class="mb-4 text-xs font-bold tracking-wide text-ink-subtle uppercase">AppButton · IconButton · NotificationButton · TextLink</h2>
          <div class="flex flex-wrap items-center gap-4">
            <AppButton icon="filter">Filter</AppButton>
            <AppButton icon="download">Export</AppButton>
            <AppButton variant="primary" icon="add">Tambah Vending</AppButton>
            <AppButton variant="primary" disabled>Disabled</AppButton>
            <IconButton label="Aksi lainnya" />
            <NotificationButton has-unread />
            <NotificationButton />
            <TextLink href="#">Lihat semua</TextLink>
          </div>
        </section>

        <section class="rounded-2xl bg-surface p-6 shadow-card">
          <h2 class="mb-4 text-xs font-bold tracking-wide text-ink-subtle uppercase">StatusCountCard</h2>
          <div class="grid max-w-[332px] gap-3">
            <StatusCountCard status="online" label="Online" :count="21" />
            <StatusCountCard status="offline" label="Offline" :count="3" />
          </div>
        </section>

        <section class="rounded-2xl bg-surface p-6 shadow-card">
          <h2 class="mb-4 text-xs font-bold tracking-wide text-ink-subtle uppercase">VendingTableRow · AppPagination</h2>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[880px] table-fixed text-left">
              <colgroup>
                <col class="w-[26%]" />
                <col class="w-[14%]" />
                <col class="w-[15%]" />
                <col class="w-[18%]" />
                <col class="w-[18%]" />
                <col class="w-[9%]" />
              </colgroup>
              <tbody>
                <VendingTableRow v-for="machine in machines" :key="machine.id" :machine="machine" />
              </tbody>
            </table>
          </div>
          <div class="mt-4 flex justify-end">
            <AppPagination v-model:page="page" :total-pages="12" />
          </div>
        </section>
      </div>
    </div>

    <section class="overflow-clip rounded-2xl bg-surface shadow-card">
      <h2 class="px-6 pt-6 text-xs font-bold tracking-wide text-ink-subtle uppercase">Editor Tampilan (Figma 4:1025)</h2>
      <header class="flex flex-wrap items-center justify-between gap-4 border-b border-line px-6 py-3">
        <div class="flex items-center gap-3">
          <BackButton />
          <nav aria-label="Breadcrumb" class="flex items-center gap-2 text-sm text-ink-subtle">
            <BreadcrumbItem href="#">DASHBOARD</BreadcrumbItem>
            <span aria-hidden="true">/</span>
            <BreadcrumbItem current>TAMPILAN LAYAR</BreadcrumbItem>
          </nav>
        </div>
        <SaveButton />
      </header>

      <div class="grid lg:grid-cols-[minmax(0,360px)_1fr]">
        <aside class="flex flex-col gap-6 border-line p-6 lg:border-r">
          <div role="tablist" class="flex gap-6 border-b border-line">
            <EditorTab
              v-for="tab in editorTabs"
              :key="tab.label"
              :icon="tab.icon"
              :label="tab.label"
              :active="activeTab === tab.label"
              @click="activeTab = tab.label"
            />
          </div>

          <div class="flex flex-col gap-4 font-inter text-sm text-ink-gray">
            <div class="flex items-center justify-between">
              <span>Warna aksen</span>
              <div class="flex items-center gap-3">
                <EditLink />
                <ColorSwatch v-model="accentColor" label="Warna aksen" />
              </div>
            </div>
            <div class="flex items-center justify-between">
              <span>Warna layar</span>
              <ColorSwatch v-model="screenColor" label="Warna layar" />
            </div>
            <label class="flex items-center justify-between gap-4">
              <span>Template</span>
              <span class="relative">
                <select
                  v-model="template"
                  class="appearance-none rounded-xl border border-line bg-surface py-2 pr-9 pl-3 text-sm text-ink-gray"
                >
                  <option value="grid">Grid 2 kolom</option>
                  <option value="list">Daftar</option>
                </select>
                <AppIcon name="line-select-chevron"class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2" />
              </span>
            </label>
          </div>

          <OutlineButton icon="restart" @click="resetColors">Reset ke Default</OutlineButton>
        </aside>

        <div class="relative flex justify-center overflow-hidden bg-surface-muted px-6 pt-12 pb-20">
          <div class="origin-top transition-transform" :style="{ transform: `scale(${zoom})` }">
            <MachinePreview :products="screenProducts" :accent-color="accentColor" :screen-color="screenColor" />
          </div>
          <div class="absolute top-6 right-6 flex flex-col gap-3">
            <CanvasToolButton icon="zoom-in" label="Perbesar" :disabled="zoom >= 1.2" @click="zoomBy(1)" />
            <CanvasToolButton icon="zoom-out" label="Perkecil" :disabled="zoom <= 0.6" @click="zoomBy(-1)" />
            <CanvasToolButton icon="smartphone" label="Ukuran asli" @click="zoom = 1" />
          </div>
        </div>
      </div>
    </section>

    <section class="overflow-clip rounded-2xl bg-surface shadow-card">
      <h2 class="px-6 pt-6 pb-4 text-xs font-bold tracking-wide text-ink-subtle uppercase">Manajemen Produk (Figma 187:4283)</h2>
      <div class="grid lg:grid-cols-[256px_1fr]">
        <nav class="flex flex-col gap-1 bg-ink-black p-4">
          <ProductSidebarItem
            v-for="item in productNav"
            :key="item.label"
            :label="item.label"
            :icon="item.icon"
            :active-icon="item.activeIcon"
            :active="activeProductNav === item.label"
            @click="activeProductNav = item.label"
          />
        </nav>

        <div class="min-w-0">
          <header class="flex items-center justify-between border-b border-line px-8 py-4 font-inter">
            <span class="text-sm font-semibold text-ink-navy">Daftar Produk</span>
            <NotificationBell has-unread />
          </header>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[960px] table-fixed text-left">
              <colgroup>
                <col class="w-[8%]" />
                <col class="w-[26%]" />
                <col class="w-[10%]" />
                <col class="w-[30%]" />
                <col class="w-[14%]" />
                <col class="w-[12%]" />
              </colgroup>
              <tbody>
                <ProductTableRow v-for="(product, i) in catalog" :key="product.code" :index="i + 1" :product="product" />
              </tbody>
            </table>
          </div>
          <div class="flex justify-end border-t border-line px-8 py-4">
            <ProductPagination v-model:page="productPage" :total-pages="8" />
          </div>
        </div>
      </div>
    </section>

    <!-- Billing & Voucher Promotion Preview (Figma 1097:27746 & 1097:27910) -->
    <section class="flex flex-col gap-6 rounded-2xl bg-surface p-6 shadow-card">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xs font-bold tracking-wide text-ink-subtle uppercase">
            Billing & Voucher Redeem (Figma 1097:27746 & 1097:27910)
          </h2>
          <p class="text-sm text-ink-muted">Tampilan Langganan Habis dan Popup Konfirmasi Pembayaran Promosi</p>
        </div>
        <AppButton variant="primary" @click="showBillingModal = true">
          Buka Modal Konfirmasi
        </AppButton>
      </div>

      <div class="rounded-xl bg-canvas p-6">
        <RedeemVoucherCard @submit="showBillingModal = true" />
      </div>

      <PromotionPaymentModal
        :open="showBillingModal"
        :voucher="sampleVoucher"
        @close="showBillingModal = false"
        @confirm="showBillingModal = false"
      />
    </section>

    <!-- Profile Popover & Change Password Dialog Preview (Figma 1097:12648 & 1097:41893) -->
    <section class="flex flex-col gap-6 rounded-2xl bg-surface p-6 shadow-card">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xs font-bold tracking-wide text-ink-subtle uppercase">
            Profile Dropdown & Ganti Password (Figma 1097:12648 & 1097:41893)
          </h2>
          <p class="text-sm text-ink-muted">Dropdown popover profil dan dialog modal ganti kata sandi</p>
        </div>
        <AppButton variant="primary" @click="showPasswordModal = true">
          Buka Dialog Ganti Password
        </AppButton>
      </div>

      <div class="flex items-center gap-12 rounded-xl bg-canvas p-6">
        <div>
          <p class="mb-2 text-xs font-semibold text-ink-muted">Square Avatar Trigger (Header):</p>
          <ProfileMenu align="left" />
        </div>
        <div>
          <p class="mb-2 text-xs font-semibold text-ink-muted">Round Avatar Trigger (Page Header):</p>
          <ProfileMenu shape="round" align="left" />
        </div>
      </div>

      <ChangePasswordModal
        :open="showPasswordModal"
        @close="showPasswordModal = false"
      />
    </section>

    <!-- Tutorial & Troubleshoot Table Preview (Figma 1097:27375) -->
    <section class="flex flex-col gap-6 rounded-2xl bg-surface p-6 shadow-card">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-xs font-bold tracking-wide text-ink-subtle uppercase">
            Tutorial & Troubleshoot Table (Figma 1097:27375)
          </h2>
          <p class="text-sm text-ink-muted">Tabel panduan tutorial dan troubleshoot vending machine</p>
        </div>
        <AppButton variant="primary" @click="showTutorialModal = true">
          Buka Modal Tambah Panduan
        </AppButton>
      </div>

      <TutorialTable
        v-model:page="galleryTutorialPage"
        v-model:per-page="galleryTutorialPerPage"
        :items="sampleGuides"
        :total-items="sampleGuides.length"
        :is-admin="true"
        @add="showTutorialModal = true"
      />

      <TutorialFormModal
        :open="showTutorialModal"
        @close="showTutorialModal = false"
        @submit="showTutorialModal = false"
      />
    </section>
  </main>
</template>
