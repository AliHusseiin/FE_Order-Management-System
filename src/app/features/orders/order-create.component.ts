import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { CustomerService } from '../../core/services/customer.service';
import { ProductService } from '../../core/services/product.service';
import { Customer } from '../../core/models/customer.model';
import { Product } from '../../core/models/product.model';
import { OrderCreateRequest } from '../../core/models/order.model';
import { NotificationService } from '../../core/services/notification.service';

interface OrderItem {
  id: number;
  productName: string;
  price: number;
  maxQuantity: number;
  quantity: number;
  subtotal: number;
}

@Component({
  selector: 'app-order-create',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="fas fa-shopping-cart me-2"></i>Create New Order</h2>
            <button class="btn btn-outline-secondary" routerLink="/orders">
              <i class="fas fa-arrow-left me-1"></i>Back to Orders
            </button>
          </div>

          <div class="row">
            <!-- Customer Selection -->
            <div class="col-md-4">
              <div class="card shadow h-100">
                <div class="card-header bg-primary text-white">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-user me-2"></i>Select Customer
                  </h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="form-label">Customer</label>
                    <select
                      class="form-select"
                      [(ngModel)]="selectedCustomerId"
                      (change)="onCustomerSelect()"
                    >
                      <option value="">Select a customer...</option>
                      <option
                        *ngFor="let customer of customers"
                        [value]="customer.id"
                      >
                        {{ customer.firstName }} {{ customer.lastName }} ({{
                          customer.username
                        }})
                      </option>
                    </select>
                  </div>

                  <div *ngIf="selectedCustomer" class="card bg-light">
                    <div class="card-body">
                      <h6>Customer Details</h6>
                      <p class="mb-1">
                        <strong>Name:</strong> {{ selectedCustomer.firstName }}
                        {{ selectedCustomer.lastName }}
                      </p>
                      <p class="mb-1">
                        <strong>Email:</strong> {{ selectedCustomer.email }}
                      </p>
                      <p class="mb-0">
                        <strong>Mobile:</strong> {{ selectedCustomer.mobile }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Product Selection -->
            <div class="col-md-8">
              <div class="card shadow h-100">
                <div class="card-header bg-success text-white">
                  <h5 class="card-title mb-0">
                    <i class="fas fa-box me-2"></i>Select Products
                  </h5>
                </div>
                <div class="card-body">
                  <div class="mb-3">
                    <label class="form-label">Add Product</label>
                    <select
                      class="form-select"
                      [(ngModel)]="selectedid"
                      (change)="onProductSelect()"
                    >
                      <option value="">Select a product to add...</option>
                      <option
                        *ngFor="let product of availableProducts"
                        [value]="product.id"
                      >
                        {{ product.productName }} - \${{
                          product.price | number : '1.2-2'
                        }}
                        (Stock: {{ product.stockQuantity }})
                      </option>
                    </select>
                  </div>

                  <!-- Selected Products -->
                  <div *ngIf="orderItems.length > 0">
                    <h6>Selected Products:</h6>
                    <div class="table-responsive">
                      <table class="table table-sm">
                        <thead class="table-light">
                          <tr>
                            <th>Product</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Subtotal</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr *ngFor="let item of orderItems; let i = index">
                            <td>{{ item.productName }}</td>
                            <td>\${{ item.price | number : '1.2-2' }}</td>
                            <td>
                              <input
                                type="number"
                                class="form-control form-control-sm"
                                [(ngModel)]="item.quantity"
                                [min]="1"
                                [max]="item.maxQuantity"
                                (change)="updateSubtotal(i)"
                                style="width: 80px;"
                              />
                            </td>
                            <td>\${{ item.subtotal | number : '1.2-2' }}</td>
                            <td>
                              <button
                                class="btn btn-sm btn-outline-danger"
                                (click)="removeItem(i)"
                              >
                                <i class="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div class="text-end mt-3">
                      <h5>
                        Total: \${{ getTotalAmount() | number : '1.2-2' }}
                      </h5>
                    </div>
                  </div>

                  <div
                    *ngIf="orderItems.length === 0"
                    class="text-center text-muted py-4"
                  >
                    <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                    <p>No products selected yet</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Create Order Button -->
          <div class="row mt-4">
            <div class="col-12">
              <div class="card shadow">
                <div class="card-body text-center">
                  <button
                    class="btn btn-primary btn-lg me-3"
                    [disabled]="!canCreateOrder() || loading"
                    (click)="createOrder()"
                  >
                    <span
                      *ngIf="loading"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    <i class="fas fa-shopping-cart me-2" *ngIf="!loading"></i>
                    {{ loading ? 'Creating Order...' : 'Create Order' }}
                  </button>
                  <button
                    class="btn btn-outline-secondary btn-lg"
                    (click)="resetForm()"
                  >
                    <i class="fas fa-undo me-2"></i>Reset Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Modal -->
    <div
      class="modal fade"
      [class.show]="showSuccessModal"
      [style.display]="showSuccessModal ? 'block' : 'none'"
      tabindex="-1"
      *ngIf="showSuccessModal"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title">
              <i class="fas fa-check-circle me-2"></i>Order Created Successfully
            </h5>
          </div>
          <div class="modal-body">
            <p>Order has been created successfully!</p>
            <p><strong>Order ID:</strong> {{ createdOrderId }}</p>
            <p><strong>Status:</strong> PENDING</p>
            <p>
              <strong>Total Amount:</strong> \${{
                createdOrderTotal | number : '1.2-2'
              }}
            </p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="closeSuccessModal()"
            >
              Create Another Order
            </button>
            <button
              type="button"
              class="btn btn-primary"
              (click)="goToOrders()"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      class="modal-backdrop fade"
      [class.show]="showSuccessModal"
      *ngIf="showSuccessModal"
    ></div>
  `,
  styles: [
    `
      .card {
        border: none;
        border-radius: 10px;
      }
      .table th {
        border-top: none;
      }
      .btn-lg {
        padding: 0.75rem 2rem;
      }
      .modal {
        background: rgba(0, 0, 0, 0.5);
      }
      .form-control-sm {
        padding: 0.25rem 0.5rem;
      }
    `,
  ],
})
export class OrderCreateComponent implements OnInit {
  customers: Customer[] = [];
  availableProducts: Product[] = [];
  orderItems: OrderItem[] = [];

  selectedCustomerId: number | null = null;
  selectedCustomer: Customer | null = null;
  selectedid: string = '';

  loading = false;
  showSuccessModal = false;
  createdOrderId: number = 0;
  createdOrderTotal: number = 0;

  constructor(
    private orderService: OrderService,
    private customerService: CustomerService,
    private productService: ProductService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadProducts();
  }

  loadCustomers(): void {
    this.customerService.getAllCustomers({ page: 0, size: 100 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.customers = response.data.content;
        }
      },
      error: (error) => {
        console.error('Error loading customers:', error);
      },
    });
  }

  loadProducts(): void {
    this.productService.getAllProducts({ page: 0, size: 100 }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.availableProducts = response.data.content.filter(
            (p) => p.stockQuantity > 0
          );
        }
      },
      error: (error) => {
        console.error('Error loading products:', error);
      },
    });
  }

  onCustomerSelect(): void {
    if (!this.selectedCustomerId) {
      this.selectedCustomer = null;
      return;
    }
    this.selectedCustomer =
      this.customers.find(
        (c) => Number(c.id) === Number(this.selectedCustomerId)
      ) || null;
  }

  onProductSelect(): void {
    if (!this.selectedid) return;

    const product = this.availableProducts.find(
      (p) => p.id.toString() === this.selectedid
    );
    if (!product) return;

    // Check if product already added
    const existingItem = this.orderItems.find((item) => item.id === product.id);
    if (existingItem) {
      this.notificationService.showWarning(
        'Warning',
        'Product already added to order'
      );
      this.selectedid = '';
      return;
    }

    // Add product to order items
    const orderItem: OrderItem = {
      id: product.id,
      productName: product.productName,
      price: product.price,
      maxQuantity: product.stockQuantity,
      quantity: 1,
      subtotal: product.price,
    };

    this.orderItems.push(orderItem);
    this.selectedid = '';
  }

  updateSubtotal(index: number): void {
    const item = this.orderItems[index];
    if (item.quantity > item.maxQuantity) {
      item.quantity = item.maxQuantity;
    }
    if (item.quantity < 1) {
      item.quantity = 1;
    }
    item.subtotal = item.price * item.quantity;
  }

  removeItem(index: number): void {
    this.orderItems.splice(index, 1);
  }

  getTotalAmount(): number {
    return this.orderItems.reduce((total, item) => total + item.subtotal, 0);
  }

  canCreateOrder(): boolean {
    return !!this.selectedCustomerId && this.orderItems.length > 0;
  }

  createOrder(): void {
    if (!this.selectedCustomerId) {
      this.notificationService.showError(
        'Validation Error',
        'Please select a customer'
      );
      return;
    }

    if (this.orderItems.length === 0) {
      this.notificationService.showError(
        'Validation Error',
        'Please add at least one product to the order'
      );
      return;
    }

    if (this.orderItems.some((item) => item.quantity <= 0)) {
      this.notificationService.showError(
        'Validation Error',
        'All quantities must be greater than 0'
      );
      return;
    }

    this.loading = true;

    const orderRequest: OrderCreateRequest = {
      customerId: Number(this.selectedCustomerId),
      orderItems: this.orderItems.map((item) => ({
        productId: item.id, // ✅ matches the interface
        quantity: item.quantity,
      })),
    };

    this.orderService.createOrder(orderRequest).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.notificationService.showSuccess(
            'Success',
            'Order created successfully!'
          );
          this.createdOrderId = response.data.orderId;
          this.createdOrderTotal = response.data.totalAmount;
          this.showSuccessModal = true;
        } else {
          this.notificationService.showError(
            'Error',
            response.message || 'Failed to create order'
          );
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMessage =
          this.notificationService.extractErrorMessage(error);
        this.notificationService.showError(
          'Error',
          `Failed to create order: ${errorMessage}`
        );
        console.error('Error creating order:', error);
      },
    });
  }

  resetForm(): void {
    this.selectedCustomerId = null;
    this.selectedCustomer = null;
    this.selectedid = '';
    this.orderItems = [];
  }

  closeSuccessModal(): void {
    this.showSuccessModal = false;
    this.resetForm();
  }

  goToOrders(): void {
    this.showSuccessModal = false;
    this.router.navigate(['/orders']);
  }
}
