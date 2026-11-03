export type ProductTint = 'orange' | 'blue' | 'purple' | 'red'

export interface ScreenProduct {
  name: string
  price: number
  image: string
  tint: ProductTint
}
