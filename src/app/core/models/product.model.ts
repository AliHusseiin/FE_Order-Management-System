export interface Product {
  id: number;
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
}

export interface ProductCreateRequest {
  productName: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
