export interface CatalogProduct {
  /** Product id when the row comes from the API. */
  id?: number
  code: string
  name: string
  /** Short secondary line under the name, e.g. brand + size. */
  variant: string
  description: string
  price: number
  /** Absolute URL, or null when the product has no photo. */
  image: string | null
}

// GET /products/list-product row (rmd-api-cms product.model.ts → getAllClientProduct, `p.*`).
export interface ProductRecord {
  id: number
  name: string | null
  display_name: string | null
  sku: string | null
  price: number | string | null
  /** Relative storage path, e.g. "products/photos/abc.png". */
  photo: string | null
  /** Category name (legacy text column). */
  categories: string | null
  category_id: number | null
  /** Owner user id; sent back unchanged when editing. */
  ownership: number | string | null
}

/** Values of the add/edit product form. */
export interface ProductFormValues {
  categoryId: number | null
  sku: string
  displayName: string
  /** "Nama Internal"; falls back to the display name when the user can't see that field. */
  name: string
  price: number | null
  /** New photo; optional when editing. */
  file: File | null
}

export interface ProductCategory {
  id: number
  category: string
  /** Owner; 1 = system ("Umum") category shared with everyone. */
  user_id?: number | string
  created_at?: string | null
}

export interface Pagination {
  page: number
  itemPerPage: number
  totalItem: number
  totalPage: number
}
