import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../core/services/order.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { AuthService } from '../../core/services/auth.service';
import { Order } from '../../core/models/order.model';
import { PagedResponse } from '../../core/models/product.model';
import {
  FilterCriteria,
  QueryParams,
} from '../../core/services/product.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="fas fa-shopping-bag me-2"></i>Order Management</h2>
            <button
              class="btn btn-primary"
              routerLink="/orders/create"
              *ngIf="isAdmin"
            >
              <i class="fas fa-plus me-1"></i>Create Order
            </button>
          </div>

          <div class="card shadow">
            <div class="card-header bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                  Orders ({{ totalElements }} total)
                </h5>
                <button
                  class="btn btn-sm btn-outline-secondary"
                  (click)="toggleFilters()"
                >
                  <i class="fas fa-filter me-1"></i
                  >{{ showFilters ? 'Hide Filters' : 'Show Filters' }}
                </button>
              </div>

              <!-- Filters Section -->
              <div *ngIf="showFilters">
                <!-- Global Search -->
                <div class="row mt-3">
                  <div class="col-md-6">
                    <label class="form-label">Global Search</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="globalSearch"
                      (keyup.enter)="applyFilters()"
                      placeholder="Search orders..."
                    />
                  </div>
                  <div class="col-md-6 d-flex align-items-end gap-2">
                    <button class="btn btn-primary" (click)="applyFilters()">
                      <i class="fas fa-search me-1"></i>Search
                    </button>
                    <button
                      class="btn btn-outline-secondary"
                      (click)="resetFilters()"
                    >
                      <i class="fas fa-undo me-1"></i>Reset
                    </button>
                    <button
                      class="btn btn-outline-info"
                      (click)="showAdvancedFilters = !showAdvancedFilters"
                    >
                      <i
                        class="fas"
                        [class.fa-chevron-down]="!showAdvancedFilters"
                        [class.fa-chevron-up]="showAdvancedFilters"
                      ></i>
                      Advanced
                    </button>
                  </div>
                </div>

                <!-- Quick Filters -->
                <div class="row mt-3">
                  <div class="col-md-3">
                    <label class="form-label">Status</label>
                    <select
                      class="form-select"
                      [(ngModel)]="quickFilters.status"
                      (change)="
                        applyQuickFilter(
                          'orderStatus',
                          quickFilters.status,
                          'EQUALS'
                        )
                      "
                    >
                      <option value="">All Statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Customer ID</label>
                    <input
                      type="number"
                      class="form-control"
                      [(ngModel)]="quickFilters.customerId"
                      (blur)="
                        applyQuickFilter(
                          'customer.id',
                          quickFilters.customerId?.toString() || '',
                          'EQUALS'
                        )
                      "
                      placeholder="Customer ID"
                    />
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Amount Range</label>
                    <select
                      class="form-select"
                      [(ngModel)]="quickFilters.amountRange"
                      (change)="
                        applyAmountRangeFilter(quickFilters.amountRange)
                      "
                    >
                      <option value="">All Amounts</option>
                      <option value="0-100">$0 - $100</option>
                      <option value="100-500">$100 - $500</option>
                      <option value="500-1000">$500 - $1000</option>
                      <option value="1000+">$1000+</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Date Range</label>
                    <select
                      class="form-select"
                      [(ngModel)]="quickFilters.dateRange"
                      (change)="applyDateRangeFilter(quickFilters.dateRange)"
                    >
                      <option value="">All Dates</option>
                      <option value="today">Today</option>
                      <option value="week">This Week</option>
                      <option value="month">This Month</option>
                      <option value="year">This Year</option>
                    </select>
                  </div>
                </div>

                <!-- Advanced Filters -->
                <div *ngIf="showAdvancedFilters" class="border-top pt-3 mt-3">
                  <h6 class="mb-3">Advanced Filters</h6>
                  <div
                    *ngFor="let filter of customFilters; let i = index"
                    class="row mb-2"
                  >
                    <div class="col-md-3">
                      <select
                        class="form-select"
                        [(ngModel)]="filter.field"
                        (change)="updateFilter(i)"
                      >
                        <option value="">Select Field</option>
                        <option value="orderStatus">Order Status</option>
                        <option value="totalAmount">Total Amount</option>
                        <option value="orderDate">Order Date</option>
                        <option value="customer.id">Customer ID</option>
                        <option value="customer.firstName">
                          Customer First Name
                        </option>
                        <option value="customer.lastName">
                          Customer Last Name
                        </option>
                      </select>
                    </div>
                    <div class="col-md-3">
                      <select
                        class="form-select"
                        [(ngModel)]="filter.operator"
                        (change)="updateFilter(i)"
                      >
                        <option value="">Select Operator</option>
                        <option value="EQUALS">Equals</option>
                        <option value="NOT_EQUALS">Not Equals</option>
                        <option value="CONTAINS">Contains</option>
                        <option value="GREATER_THAN">Greater Than</option>
                        <option value="GREATER_THAN_OR_EQUAL">
                          Greater Than or Equal
                        </option>
                        <option value="LESS_THAN">Less Than</option>
                        <option value="LESS_THAN_OR_EQUAL">
                          Less Than or Equal
                        </option>
                        <option value="BETWEEN">Between</option>
                        <option value="IN">In (comma-separated)</option>
                        <option value="NOT_IN">Not In</option>
                      </select>
                    </div>
                    <div class="col-md-2">
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="filter.value"
                        (blur)="updateFilter(i)"
                        placeholder="Value"
                      />
                    </div>
                    <div class="col-md-2" *ngIf="filter.operator === 'BETWEEN'">
                      <input
                        type="text"
                        class="form-control"
                        [(ngModel)]="filter.value2"
                        (blur)="updateFilter(i)"
                        placeholder="To Value"
                      />
                    </div>
                    <div
                      class="col-md-2"
                      [class.col-md-4]="filter.operator !== 'BETWEEN'"
                    >
                      <div class="d-flex gap-1">
                        <button
                          class="btn btn-outline-danger btn-sm"
                          (click)="removeFilter(i)"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                        <button
                          *ngIf="i === customFilters.length - 1"
                          class="btn btn-outline-success btn-sm"
                          (click)="addFilter()"
                        >
                          <i class="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div *ngIf="customFilters.length === 0" class="text-center">
                    <button
                      class="btn btn-outline-primary"
                      (click)="addFilter()"
                    >
                      <i class="fas fa-plus me-1"></i>Add Filter
                    </button>
                  </div>
                </div>

                <!-- Sorting & Pagination -->
                <div class="row mt-3 pt-3 border-top">
                  <div class="col-md-3">
                    <label class="form-label">Sort By</label>
                    <select
                      class="form-select"
                      [(ngModel)]="sortBy"
                      (change)="applyFilters()"
                    >
                      <option value="orderDate">Order Date</option>
                      <option value="totalAmount">Total Amount</option>
                      <option value="orderStatus">Status</option>
                      <option value="customer.firstName">Customer Name</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Sort Direction</label>
                    <select
                      class="form-select"
                      [(ngModel)]="sortDirection"
                      (change)="applyFilters()"
                    >
                      <option value="desc">Descending</option>
                      <option value="asc">Ascending</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Page Size</label>
                    <select
                      class="form-select"
                      [(ngModel)]="pageSize"
                      (change)="applyFilters()"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Applied Filters</label>
                    <div class="badge bg-info">
                      {{ getActiveFiltersCount() }} active
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-dark">
                    <tr>
                      <th class="sortable" (click)="sort('id')">
                        Order ID
                        <i class="fas" [class]="getSortIcon('id')"></i>
                      </th>
                      <th class="sortable" (click)="sort('customerId')">
                        Customer ID
                        <i class="fas" [class]="getSortIcon('customerId')"></i>
                      </th>
                      <th class="sortable" (click)="sort('orderStatus')">
                        Status
                        <i class="fas" [class]="getSortIcon('orderStatus')"></i>
                      </th>
                      <th class="sortable" (click)="sort('totalAmount')">
                        Total Amount
                        <i class="fas" [class]="getSortIcon('totalAmount')"></i>
                      </th>
                      <th class="sortable" (click)="sort('createdAt')">
                        Created Date
                        <i class="fas" [class]="getSortIcon('createdAt')"></i>
                      </th>
                      <th>Items</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let order of orders" class="align-middle">
                      <td>
                        <strong>#{{ order.id }}</strong>
                      </td>
                      <td>{{ order.customer.id }}</td>
                      <td>
                        <span
                          class="badge"
                          [class]="getStatusBadgeClass(order.orderStatus)"
                        >
                          {{ order.orderStatus }}
                        </span>
                      </td>
                      <td>
                        <strong
                          >\${{ order.totalAmount | number : '1.2-2' }}</strong
                        >
                      </td>
                      <td>{{ order.orderDate | date : 'short' }}</td>
                      <td>
                        <span class="badge bg-info"
                          >{{
                            (order.orderItems && order.orderItems.length) || 0
                          }}
                          items</span
                        >
                      </td>
                      <td>
                        <div class="btn-group" role="group">
                          <button
                            class="btn btn-sm btn-outline-info"
                            (click)="viewOrderDetails(order)"
                          >
                            <i class="fas fa-eye"></i> Details
                          </button>

                          <button
                            class="btn btn-sm btn-outline-success"
                            *ngIf="canApproveOrder(order)"
                            (click)="approveOrder(order.id)"
                            [disabled]="approvingid === order.id"
                          >
                            <span
                              *ngIf="approvingid === order.id"
                              class="spinner-border spinner-border-sm me-1"
                            ></span>
                            <i
                              class="fas fa-check"
                              *ngIf="approvingid !== order.id"
                            ></i>
                            Approve
                          </button>

                          <button
                            class="btn btn-sm btn-outline-warning"
                            *ngIf="order.orderStatus === 'CONFIRMED'"
                            (click)="viewInvoice(order)"
                          >
                            <i class="fas fa-file-invoice"></i> Invoice
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr *ngIf="orders.length === 0 && !loading">
                      <td colspan="7" class="text-center text-muted py-4">
                        No orders found
                      </td>
                    </tr>
                    <tr *ngIf="loading">
                      <td colspan="7" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <nav *ngIf="totalPages > 1">
                <ngb-pagination
                  [(page)]="currentPage"
                  [pageSize]="pageSize"
                  [collectionSize]="totalElements"
                  [maxSize]="5"
                  [rotate]="true"
                  (pageChange)="onPageChange($event)"
                >
                </ngb-pagination>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div
      class="modal fade"
      [class.show]="showDetailsModal"
      [style.display]="showDetailsModal ? 'block' : 'none'"
      tabindex="-1"
      *ngIf="showDetailsModal && selectedOrder"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Order Details - #{{ selectedOrder.id }}</h5>
            <button
              type="button"
              class="btn-close"
              (click)="showDetailsModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <h6>Order Information</h6>
                <p><strong>Order ID:</strong> {{ selectedOrder.id }}</p>
                <p>
                  <strong>Customer ID:</strong> {{ selectedOrder.customer.id }}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    class="badge"
                    [class]="getStatusBadgeClass(selectedOrder.orderStatus)"
                  >
                    {{ selectedOrder.orderStatus }}
                  </span>
                </p>
                <p>
                  <strong>Total Amount:</strong> \${{
                    selectedOrder.totalAmount | number : '1.2-2'
                  }}
                </p>
              </div>
              <div class="col-md-6">
                <h6>Dates</h6>
                <p>
                  <strong>Created:</strong>
                  {{ selectedOrder.orderDate | date : 'full' }}
                </p>
                <p>
                  <strong>Updated:</strong>
                  {{ selectedOrder.orderDate | date : 'full' }}
                </p>
              </div>
            </div>

            <h6 class="mt-4">Order Items</h6>
            <div class="table-responsive">
              <table class="table table-sm">
                <thead class="table-light">
                  <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of selectedOrder.orderItems">
                    <td>{{ item.id }}</td>
                    <td>{{ item.product?.productName || 'N/A' }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>\${{ item.unitPrice | number : '1.2-2' }}</td>
                    <td>\${{ item.subtotal | number : '1.2-2' }}</td>
                  </tr>
                </tbody>
                <tfoot class="table-light">
                  <tr>
                    <th colspan="4" class="text-end">Total:</th>
                    <th>
                      \${{ selectedOrder.totalAmount | number : '1.2-2' }}
                    </th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="showDetailsModal = false"
            >
              Close
            </button>
            <button
              type="button"
              class="btn btn-success"
              *ngIf="canApproveOrder(selectedOrder)"
              (click)="approveOrder(selectedOrder.id)"
            >
              <i class="fas fa-check me-1"></i>Approve Order
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      class="modal-backdrop fade"
      [class.show]="showDetailsModal"
      *ngIf="showDetailsModal"
    ></div>
  `,
  styles: [
    `
      .table th {
        border-top: none;
      }
      .badge {
        font-size: 0.75em;
      }
      .modal {
        background: rgba(0, 0, 0, 0.5);
      }
      .btn-sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.775rem;
      }
      .btn-group .btn {
        border-radius: 0;
      }
      .btn-group .btn:first-child {
        border-top-left-radius: 0.375rem;
        border-bottom-left-radius: 0.375rem;
      }
      .btn-group .btn:last-child {
        border-top-right-radius: 0.375rem;
        border-bottom-right-radius: 0.375rem;
      }
      .sortable {
        cursor: pointer;
        user-select: none;
      }
      .sortable:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
      .sortable i {
        font-size: 0.8em;
        margin-left: 5px;
      }
      .form-label {
        font-size: 0.875rem;
        font-weight: 500;
        margin-bottom: 0.25rem;
      }
      .gap-1 {
        gap: 0.25rem;
      }
      .gap-2 {
        gap: 0.5rem;
      }
    `,
  ],
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  loading = false;
  showDetailsModal = false;
  approvingid: number | null = null;

  // Filtering and Sorting
  showFilters = false;
  showAdvancedFilters = false;
  sortBy = 'orderDate';
  sortDirection: 'asc' | 'desc' = 'desc';
  globalSearch = '';

  // Quick filters
  quickFilters = {
    status: '',
    customerId: null as number | null,
    amountRange: '',
    dateRange: '',
  };

  // Advanced custom filters
  customFilters: FilterCriteria[] = [];

  constructor(
    private orderService: OrderService,
    private invoiceService: InvoiceService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loadOrders(): void {
    this.loading = true;

    const queryParams: QueryParams = {
      page: this.currentPage - 1,
      size: this.pageSize,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
    };

    // Add global search if present
    if (this.globalSearch?.trim()) {
      queryParams.globalSearch = this.globalSearch.trim();
    }

    // Add active filters
    const activeFilters = this.getActiveFilters();
    if (activeFilters.length > 0) {
      queryParams.filters = activeFilters;
    }

    this.orderService.getAllOrders(queryParams).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.orders = response.data.content;
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading orders:', error);
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadOrders();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'bg-warning text-dark';
      case 'CONFIRMED':
        return 'bg-success';
      case 'CANCELLED':
        return 'bg-danger';
      case 'COMPLETED':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  canApproveOrder(order: Order): boolean {
    return this.isAdmin && order.orderStatus === 'PENDING';
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.showDetailsModal = true;
  }

  approveOrder(id: number): void {
    if (!confirm('Are you sure you want to approve this order?')) {
      return;
    }

    this.approvingid = id;
    this.orderService.approveOrder(id).subscribe({
      next: (response) => {
        this.approvingid = null;
        if (response.success) {
          this.showDetailsModal = false;
          this.loadOrders(); // Reload to get updated status
          alert(
            'Order approved successfully! Invoice has been generated automatically.'
          );
        }
      },
      error: (error) => {
        this.approvingid = null;
        console.error('Error approving order:', error);
        alert(
          'Error approving order: ' + (error.error?.message || 'Unknown error')
        );
      },
    });
  }

  viewInvoice(order: Order): void {
    console.log('viewInvoice called with order:', order);

    const id = order.id;
    if (!id || id === undefined || id === null) {
      this.notificationService.showError('Error', 'Invalid order ID');
      console.error('Invalid order ID:', id, 'from order:', order);
      return;
    }

    this.invoiceService.getInvoiceByOrderId(Number(id)).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const invoice = response.data;
          this.notificationService.showInfo(
            'Invoice Details',
            `Invoice #${invoice.invoiceNumber}\nTotal: $${invoice.totalAmount}\nStatus: Generated`
          );
        } else {
          this.notificationService.showError(
            'Error',
            'Invoice not found for this order'
          );
        }
      },
      error: (error) => {
        const errorMessage =
          this.notificationService.extractErrorMessage(error);
        this.notificationService.showError(
          'Error',
          `Failed to load invoice: ${errorMessage}`
        );
        console.error('Error loading invoice:', error);
      },
    });
  }

  // Filter and Sort Methods
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadOrders();
  }

  resetFilters(): void {
    this.sortBy = 'orderDate';
    this.sortDirection = 'desc';
    this.pageSize = 10;
    this.currentPage = 1;
    this.globalSearch = '';
    this.quickFilters = {
      status: '',
      customerId: null,
      amountRange: '',
      dateRange: '',
    };
    this.customFilters = [];
    this.showAdvancedFilters = false;
    this.loadOrders();
  }

  applyQuickFilter(field: string, value: string, operator: string): void {
    // Remove existing filter for this field
    this.customFilters = this.customFilters.filter((f) => f.field !== field);

    // Add new filter if value is not empty
    if (value?.trim()) {
      this.customFilters.push({
        field: field,
        operator: operator,
        value: value.trim(),
      });
    }

    this.applyFilters();
  }

  applyAmountRangeFilter(range: string): void {
    // Remove existing amount filters
    this.customFilters = this.customFilters.filter(
      (f) => f.field !== 'totalAmount'
    );

    if (range) {
      if (range === '1000+') {
        this.customFilters.push({
          field: 'totalAmount',
          operator: 'GREATER_THAN',
          value: '1000',
        });
      } else {
        const [min, max] = range.split('-');
        this.customFilters.push({
          field: 'totalAmount',
          operator: 'BETWEEN',
          value: min,
          value2: max,
        });
      }
    }

    this.applyFilters();
  }

  applyDateRangeFilter(range: string): void {
    // Remove existing date filters
    this.customFilters = this.customFilters.filter(
      (f) => f.field !== 'orderDate'
    );

    if (range) {
      const now = new Date();
      let startDate: Date;

      switch (range) {
        case 'today':
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          return;
      }

      this.customFilters.push({
        field: 'orderDate',
        operator: 'GREATER_THAN',
        value: startDate.toISOString().split('T')[0] + 'T00:00:00',
      });
    }

    this.applyFilters();
  }

  addFilter(): void {
    this.customFilters.push({
      field: '',
      operator: '',
      value: '',
    });
  }

  removeFilter(index: number): void {
    this.customFilters.splice(index, 1);
    this.applyFilters();
  }

  updateFilter(index: number): void {
    // Apply filters after a short delay to avoid too many API calls
    setTimeout(() => {
      const filter = this.customFilters[index];
      if (filter.field && filter.operator && filter.value) {
        this.applyFilters();
      }
    }, 300);
  }

  getActiveFilters(): FilterCriteria[] {
    return this.customFilters.filter((f) => f.field && f.operator && f.value);
  }

  getActiveFiltersCount(): number {
    let count = this.getActiveFilters().length;
    if (this.globalSearch?.trim()) count++;
    return count;
  }

  sort(field: string): void {
    if (this.sortBy === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
    this.loadOrders();
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) {
      return 'fa-sort text-muted';
    }
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
}
