import { Order } from './order.model';

export interface Invoice {
  id: number;
  invoiceNumber: string;
  order: Order;
  invoiceAmount: number;
  taxAmount: number;
  totalAmount: number;
  invoiceDate: string;
}
