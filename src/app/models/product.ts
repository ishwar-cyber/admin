import { BrandM } from "./brand";

export interface ProductM {
  id: string;
  name: string;
  sku?: string;
  model:string;
  category: [];
  pincode: [];
  brand: BrandM;
  price: number;
  originalPrice?: number;
  stock: number;
  maxStock: number;
  rating?: number;
  reviewCount?: number;
  status: true | false | 'draft';
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
  sortBy?: string;
  sortOrder?: string,
  minPrice?: number,
  maxPrice?:number
}



export interface Specification {
  id?: string;
  value: string; // Unique identifier for the spec (e.g., 'cpu', 'ram')
  name: string; // Display name (e.g., 'Processor', 'Memory')
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductVariant {
  sku: string;
  price: number;
  stock: number;
  image?: string[]
}

export interface ProductModal {
  id?: string;
  name: string;
  category: [];
  pincode:[]; // Category ID
  brand: string; // Brand ID
  model?: string;
  description?: string;
  features?: string[];
  subCategory: string;
  price: number;
  stock: number;
  specifications: Specification[]; // Key-value pairs of specs
  variants?: ProductVariant[];
  warranty?: any;
  offerPrice: any;
  weight: number;
  width?: number;
  length:number;
  height: number;
  status: 'active' | 'inactive' | 'draft';
  slug?: string;
  serviceCharge: number;
  productImages: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface Warranty {
  period: number,
  type: string
}
export interface ProductOfferPrice {
  quantity?: number,
  price?: number
}

// For form data with files
export interface ProductFormData {
  name: string;
  category: [];
  pincode: [],
  subCategory?: string;
  brand: string;
  model?: string;
  description?: string;
  features?: string;
  price: number;
  stock: number;
  warranty?: any;
  status: string;
  productWeight: number;
  specifications: any;
  offerPrice?: any;
  variants?: {
    sku: string;
    price: number;
    stock: number;
    variantImages?: string[]; // Array of image URLs
  }[];
  productImages?: File[];
}
