import { getSession } from '@/services/auth'
import type { Pagination, ProductCategory, ProductFormValues, ProductRecord } from '@/types/product'
import { apiGet, apiSendForm } from './api'

/** Sub-roles that see and edit "Nama Internal" (v1: canSeeNamaInternal). */
const INTERNAL_NAME_ROLES = ['ops', 'dev', 'main-client']

export function canEditInternalName(): boolean {
  const subRole = getSession()?.subRole
  return typeof subRole === 'string' && INTERNAL_NAME_ROLES.some((role) => subRole.includes(role))
}

/**
 * POST /products (create) or PUT /products (update), multipart with the same fields v1 sends.
 * Returns the backend's success message.
 */
export async function saveProduct(
  values: ProductFormValues,
  categories: ProductCategory[],
  existing: ProductRecord | null,
): Promise<string> {
  const user = getSession()
  const form = new FormData()
  const categoryName = categories.find((c) => c.id === values.categoryId)?.category
  const name = values.name.trim() || values.displayName.trim()

  if (values.categoryId) form.append('category_id', String(values.categoryId))
  form.append('categories', categoryName ?? existing?.categories ?? 'N/A')
  form.append('price', String(values.price ?? 0))
  form.append('name', name)
  form.append('display_name', values.displayName.trim())
  form.append('sku', values.sku.trim())
  if (values.file) form.append('file', values.file)

  if (existing) {
    const ownership = String(existing.ownership ?? '')
    form.append('id', String(existing.id))
    form.append('ownership', ownership)
    form.append('description', JSON.stringify({ ownership }))
  } else {
    const ownership = String(user?.parentId === 1 ? user.id : (user?.parentId ?? 0))
    form.append('ownership', ownership)
    form.append('description', JSON.stringify({ ownership }))
    form.append('created_by', String(user?.id ?? 0))
    form.append('parent_id', ownership)
  }

  const body = await apiSendForm<{ message?: string } | undefined>('/products', existing ? 'PUT' : 'POST', form)
  return body?.message ?? (existing ? 'Produk berhasil diperbarui.' : 'Produk berhasil ditambahkan.')
}

export interface ProductQuery {
  page: number
  itemPerPage: number
  search?: string
  categoryId?: number | null
}

/**
 * GET /products/list-product, same call as v1's product page. The backend scopes by the
 * logged-in account; `clientName` mirrors v1 (own id for main accounts, parent id for sub accounts).
 * 204 (no match) resolves to an empty page.
 */
export async function fetchProducts(query: ProductQuery): Promise<{ data: ProductRecord[]; pagination: Pagination }> {
  const user = getSession()
  const params = new URLSearchParams({ page: String(query.page), itemPerPage: String(query.itemPerPage) })
  if (user) params.set('clientName', String(user.parentId === 1 ? user.id : user.parentId))
  if (query.search) params.set('search', query.search)
  if (query.categoryId) params.set('categoryId', String(query.categoryId))

  const body = await apiGet<{ data?: ProductRecord[]; pagination?: Partial<Pagination> } | undefined>(
    `/products/list-product?${params}`,
  )
  const data = body?.data ?? []
  const p = body?.pagination ?? {}
  return {
    data,
    pagination: {
      page: Number(p.page ?? query.page),
      itemPerPage: Number(p.itemPerPage ?? query.itemPerPage),
      totalItem: Number(p.totalItem ?? data.length),
      totalPage: Number(p.totalPage ?? 1),
    },
  }
}

/** GET /product-categories */
export async function fetchProductCategories(): Promise<ProductCategory[]> {
  const body = await apiGet<{ data?: ProductCategory[] } | undefined>('/product-categories')
  return body?.data ?? []
}
