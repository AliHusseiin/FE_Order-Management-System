import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderCreateRequest, OrderResponse } from '../models/order.model';
import { ApiResponse } from '../models/auth.model';
import { PagedResponse } from '../models/product.model';
import { FilterCriteria, QueryParams } from './product.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = 'http://localhost:8080/api/v1/orders';

  constructor(private http: HttpClient) {}

  getAllOrders(queryParams: QueryParams = {}): Observable<ApiResponse<PagedResponse<Order>>> {
    const params = this.buildQueryParams(queryParams);
    return this.http.get<ApiResponse<PagedResponse<Order>>>(this.API_URL, { params });
  }

  getOrderById(id: number | string): Observable<ApiResponse<Order>> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new Error('Invalid order ID');
    }
    return this.http.get<ApiResponse<Order>>(`${this.API_URL}/${numericId}`);
  }

  createOrder(order: OrderCreateRequest): Observable<ApiResponse<OrderResponse>> {
    // Ensure customerId is a number
    const orderRequest = {
      ...order,
      customerId: Number(order.customerId),
      orderItems: order.orderItems.map(item => ({
        productId: Number(item.productId),
        quantity: Number(item.quantity)
      }))
    };
    return this.http.post<ApiResponse<OrderResponse>>(this.API_URL, orderRequest);
  }

  approveOrder(orderId: number | string): Observable<ApiResponse<OrderResponse>> {
    const numericId = Number(orderId);
    if (isNaN(numericId) || numericId <= 0) {
      throw new Error('Invalid order ID');
    }
    return this.http.put<ApiResponse<OrderResponse>>(`${this.API_URL}/${numericId}/approve`, {});
  }

  getOrdersByCustomer(customerId: number | string, queryParams: QueryParams = {}): Observable<ApiResponse<PagedResponse<Order>>> {
    const numericId = Number(customerId);
    if (isNaN(numericId) || numericId <= 0) {
      throw new Error('Invalid customer ID');
    }
    const params = this.buildQueryParams(queryParams);
    return this.http.get<ApiResponse<PagedResponse<Order>>>(`${this.API_URL}/customer/${numericId}`, { params });
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
}