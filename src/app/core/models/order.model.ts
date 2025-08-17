import { Customer } from './customer.model';

export interface Order {
  id: number;
  customer: Customer;
  orderStatus: string;
  totalAmount: number;
  orderDate: string;
  orderItems: OrderItem[];
}

export interface OrderItem {
  orderItemId?: number;
  id: number;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  product?: {
    id: number;
    productName: string;
    description: string;
    category: string;
    price: number;
  };
}

export interface OrderCreateRequest {
  customerId: number;
  orderItems: {
    productId: number;
    quantity: number;
  }[];
}

export interface OrderResponse {
  orderId: number;
  customerId: number;
  orderStatus: string;
  totalAmount: number;
  orderItems: OrderItem[];
}
