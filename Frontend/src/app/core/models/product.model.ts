export interface Product {
  productId: number;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  isActive: boolean;
  categoryId: number;
  categoryName: string | null;
}

/**
 * What the form sends on create/update. Same fields as Product.
 */
export type ProductDTO = Product;
