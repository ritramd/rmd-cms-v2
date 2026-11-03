// Kategori Produk: same endpoints and permission rules as rmd-cms v1 (pages/product/categories.vue).
// v1 calls the /categories alias; it routes to the same controller as /product-categories.
import { getSession } from '@/services/auth'
import type { ProductCategory } from '@/types/product'
import { apiDelete, apiSendJson } from './api'

export { fetchProductCategories } from './products'

const SYSTEM_OWNER_ID = 1

/** Sub-users (accounts under a main account) can only view categories; the backend also rejects their writes. */
export function isSubUser(): boolean {
  const parentId = Number(getSession()?.parentId ?? 0)
  return parentId > 0 && parentId !== SYSTEM_OWNER_ID
}

export function isSystemCategory(category: ProductCategory): boolean {
  return Number(category.user_id) === SYSTEM_OWNER_ID
}

/** Superadmin can change any category; a main account only its own (system ones are locked). */
export function canModifyCategory(category: ProductCategory): boolean {
  if (isSubUser()) return false
  const userId = Number(getSession()?.id)
  if (userId === SYSTEM_OWNER_ID) return true
  return Number(category.user_id) === userId
}

export async function createProductCategory(category: string): Promise<void> {
  await apiSendJson('/product-categories', 'POST', { category: category.trim() })
}

export async function updateProductCategory(id: number, category: string): Promise<void> {
  await apiSendJson(`/product-categories/${id}`, 'PUT', { category: category.trim() })
}

export async function deleteProductCategory(id: number): Promise<void> {
  await apiDelete(`/product-categories/${id}`)
}
