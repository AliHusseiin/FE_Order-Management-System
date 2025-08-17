import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Invoice } from '../models/invoice.model';
import { ApiResponse } from '../models/auth.model';
import { PagedResponse } from '../models/product.model';
import { FilterCriteria, QueryParams } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly API_URL = 'http://localhost:8080/api/v1/invoices';

  constructor(private http: HttpClient) {}

  getAllInvoices(queryParams: QueryParams = {}): Observable<ApiResponse<PagedResponse<Invoice>>> {
    const params = this.buildQueryParams(queryParams);
    return this.http.get<ApiResponse<PagedResponse<Invoice>>>(this.API_URL, { params });
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

  getInvoiceById(id: number): Observable<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(`${this.API_URL}/${id}`);
  }

  getInvoiceByOrderId(orderId: number): Observable<ApiResponse<Invoice>> {
    return this.http.get<ApiResponse<Invoice>>(`${this.API_URL}/order/${orderId}`);
  }
}