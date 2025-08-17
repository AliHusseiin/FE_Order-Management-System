import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer, CustomerCreateRequest } from '../models/customer.model';
import { ApiResponse } from '../models/auth.model';
import { PagedResponse } from '../models/product.model';
import { FilterCriteria, QueryParams } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private readonly API_URL = 'http://localhost:8080/api/v1/customers';

  constructor(private http: HttpClient) {}

  getAllCustomers(queryParams: QueryParams = {}): Observable<ApiResponse<PagedResponse<Customer>>> {
    const params = this.buildQueryParams(queryParams);
    return this.http.get<ApiResponse<PagedResponse<Customer>>>(this.API_URL, { params });
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

  getCustomerById(id: number | string): Observable<ApiResponse<Customer>> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new Error('Invalid customer ID');
    }
    return this.http.get<ApiResponse<Customer>>(`${this.API_URL}/${numericId}`);
  }

  createCustomer(customer: CustomerCreateRequest): Observable<ApiResponse<Customer>> {
    return this.http.post<ApiResponse<Customer>>(this.API_URL, customer);
  }

  deleteCustomer(id: number | string): Observable<ApiResponse<void>> {
    const numericId = Number(id);
    if (isNaN(numericId) || numericId <= 0) {
      throw new Error('Invalid customer ID');
    }
    return this.http.delete<ApiResponse<void>>(`${this.API_URL}/${numericId}`);
  }
}