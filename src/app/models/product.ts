export interface ProductM {
  id: string;
  name: string;
  sku?: string;
  category: any;
  brand: string;
  price: number;
  originalPrice?: number;
  stock: number;
  maxStock: number;
  rating?: number;
  reviewCount?: number;
  status: 'active' | 'inactive' | 'draft';
  thumbnail?: string;
  updatedAt: string;

}

export interface ProductApiResponse {
  products: ProductM[];
  total: number;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
  status?: string;
}
