import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductCreateRequest, PagedResponse } from '../models/product.model';
import { ApiResponse } from '../models/auth.model';

export interface FilterCriteria {
  field: string;
  operator: string;
  value: string;
  value2?: string;
}

export interface QueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: string;
  globalSearch?: string;
  filters?: FilterCriteria[];
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = 'http://localhost:8080/api/v1/products';

  constructor(private http: HttpClient) {}

  getAllProducts(queryParams: QueryParams = {}): Observable<ApiResponse<PagedResponse<Product>>> {
    const params = this.buildQueryParams(queryParams);
    return this.http.get<ApiResponse<PagedResponse<Product>>>(this.API_URL, { params });
  }

  private buildQueryParams(queryParams: QueryParams): HttpParams {
    let params = new HttpParams();

    // Add pagination parameters
    if (queryParams.page !== undefined) {
      params = params.set('page', queryParams.page.toString());
    }
    if (queryParams.size !== undefined) {
      params = params.set('size', queryParams.size.toString());
    }
    if (queryParams.sortBy) {
      params = params.set('sortBy', queryParams.sortBy);
    }
    if (queryParams.sortDirection) {
      params = params.set('sortDirection', queryParams.sortDirection);
    }
    if (queryParams.globalSearch) {
      params = params.set('globalSearch', queryParams.globalSearch);
    }

    // Add filter parameters
    if (queryParams.filters && queryParams.filters.length > 0) {
      queryParams.filters.forEach((filter, index) => {
        params = params.set(`filters[${index}].field`, filter.field);
        params = params.set(`filters[${index}].operator`, filter.operator);
        params = params.set(`filters[${index}].value`, filter.value);
        if (filter.value2) {
          params = params.set(`filters[${index}].value2`, filter.value2);
        }
      });
    }

    return params;
  }

  getProductById(id: number | string): Observable<ApiResponse<Product>> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new Error('Invalid product ID');
    }
    return this.http.get<ApiResponse<Product>>(`${this.API_URL}/${numericId}`);
  }

  createProduct(product: ProductCreateRequest): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.API_URL, product);
  }

  deleteProduct(id: number | string): Observable<ApiResponse<void>> {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      throw new Error('Invalid product ID');
    }
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${numericId}`);
  }
}