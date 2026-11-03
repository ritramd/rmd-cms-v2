export interface CatalogProduct {
  code: string
  name: string
  /** Short secondary line under the name, e.g. brand + size. */
  variant: string
  description: string
  price: number
  image: string
}
