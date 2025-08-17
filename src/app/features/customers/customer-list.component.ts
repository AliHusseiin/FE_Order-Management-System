import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { OrderService } from '../../core/services/order.service';
import {
  Customer,
  CustomerCreateRequest,
} from '../../core/models/customer.model';
import { Order } from '../../core/models/order.model';
import { PagedResponse } from '../../core/models/product.model';
import {
  FilterCriteria,
  QueryParams,
} from '../../core/services/product.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="fas fa-users me-2"></i>Customer Management</h2>
            <button class="btn btn-primary" (click)="showAddModal = true">
              <i class="fas fa-plus me-1"></i>Add Customer
            </button>
          </div>

          <!-- Filters -->
          <div class="card shadow mb-4">
            <div class="card-header bg-light">
              <h6 class="card-title mb-0">Customer Filters & Search</h6>
            </div>
            <div class="card-body">
              <!-- Global Search -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Global Search</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="globalSearch"
                    (keyup.enter)="applyFilters()"
                    placeholder="Search customers..."
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
              <div class="row mb-3">
                <div class="col-md-4">
                  <label class="form-label">Filter by Name</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="quickFilters.name"
                    (blur)="
                      applyQuickFilter(
                        'firstName',
                        quickFilters.name,
                        'CONTAINS'
                      )
                    "
                    placeholder="First name contains..."
                  />
                </div>
                <div class="col-md-4">
                  <label class="form-label">Filter by Email Domain</label>
                  <select
                    class="form-select"
                    [(ngModel)]="quickFilters.emailDomain"
                    (change)="applyEmailDomainFilter(quickFilters.emailDomain)"
                  >
                    <option value="">All Email Domains</option>
                    <option value="@gmail.com">Gmail</option>
                    <option value="@yahoo.com">Yahoo</option>
                    <option value="@outlook.com">Outlook</option>
                    <option value="@example.com">Example</option>
                  </select>
                </div>
                <div class="col-md-4">
                  <label class="form-label">Active Status</label>
                  <select
                    class="form-select"
                    [(ngModel)]="quickFilters.activeStatus"
                    (change)="
                      applyActiveStatusFilter(quickFilters.activeStatus)
                    "
                  >
                    <option value="">All Status</option>
                    <option value="true">Active Only</option>
                    <option value="false">Inactive Only</option>
                  </select>
                </div>
              </div>

              <!-- Advanced Filters -->
              <div *ngIf="showAdvancedFilters" class="border-top pt-3">
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
                      <option value="firstName">First Name</option>
                      <option value="lastName">Last Name</option>
                      <option value="user.email">Email</option>
                      <option value="mobile">Mobile</option>
                      <option value="user.isActive">Active Status</option>
                      <option value="addresses.city">City</option>
                      <option value="addresses.state">State</option>
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
                      <option value="NOT_CONTAINS">Not Contains</option>
                      <option value="STARTS_WITH">Starts With</option>
                      <option value="ENDS_WITH">Ends With</option>
                      <option value="IS_TRUE">Is True</option>
                      <option value="IS_FALSE">Is False</option>
                      <option value="IS_NULL">Is Null</option>
                      <option value="IS_NOT_NULL">Is Not Null</option>
                    </select>
                  </div>
                  <div
                    class="col-md-4"
                    *ngIf="
                      ![
                        'IS_TRUE',
                        'IS_FALSE',
                        'IS_NULL',
                        'IS_NOT_NULL'
                      ].includes(filter.operator)
                    "
                  >
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="filter.value"
                      (blur)="updateFilter(i)"
                      placeholder="Value"
                    />
                  </div>
                  <div class="col-md-2">
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
                  <button class="btn btn-outline-primary" (click)="addFilter()">
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
                    <option value="firstName">First Name</option>
                    <option value="lastName">Last Name</option>
                    <option value="user.email">Email</option>
                    <option value="mobile">Mobile</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Sort Direction</label>
                  <select
                    class="form-select"
                    [(ngModel)]="sortDirection"
                    (change)="applyFilters()"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
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

          <div class="card shadow">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                Customers List ({{ totalElements }} total)
              </h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let customer of customers" class="align-middle">
                      <td>
                        <strong>#{{ customer.id }}</strong>
                      </td>
                      <td>{{ customer.username }}</td>
                      <td>{{ customer.firstName }} {{ customer.lastName }}</td>
                      <td>{{ customer.email }}</td>
                      <td>{{ customer.mobile }}</td>

                      <td>
                        <button
                          class="btn btn-sm btn-outline-primary me-1"
                          (click)="viewCustomerOrders(customer.id)"
                        >
                          <i class="fas fa-shopping-bag"></i> Orders
                        </button>
                        <button
                          class="btn btn-sm btn-outline-danger"
                          (click)="deleteCustomer(customer.id)"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                    <tr *ngIf="customers.length === 0">
                      <td colspan="7" class="text-center text-muted py-4">
                        No customers found
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

    <!-- Add Customer Modal -->
    <div
      class="modal fade"
      [class.show]="showAddModal"
      [style.display]="showAddModal ? 'block' : 'none'"
      tabindex="-1"
      *ngIf="showAddModal"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Add New Customer</h5>
            <button
              type="button"
              class="btn-close"
              (click)="showAddModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <form #customerForm="ngForm" (ngSubmit)="addCustomer()">
              <!-- Customer Information -->
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Username</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="newCustomer.username"
                    name="username"
                    required
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Email</label>
                  <input
                    type="email"
                    class="form-control"
                    [(ngModel)]="newCustomer.email"
                    name="email"
                    required
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">First Name</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="newCustomer.firstName"
                    name="firstName"
                    required
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Last Name</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="newCustomer.lastName"
                    name="lastName"
                    required
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Mobile</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="newCustomer.mobile"
                    name="mobile"
                    required
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Password</label>
                  <input
                    type="password"
                    class="form-control"
                    [(ngModel)]="newCustomer.password"
                    name="password"
                    required
                  />
                </div>
              </div>

              <!-- Address Section -->
              <div class="mt-4">
                <h5 class="mb-3">Addresses</h5>
                <div
                  class="d-flex justify-content-between align-items-center mb-3"
                >
                  <h6 class="mb-0">Add customer addresses</h6>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary"
                    (click)="addAddress()"
                  >
                    <i class="fas fa-plus me-1"></i> Add Address
                  </button>
                </div>

                <div
                  class="address-container"
                  *ngFor="let address of newCustomer.addresses; let i = index"
                >
                  <div class="card mb-3">
                    <div
                      class="card-header d-flex justify-content-between align-items-center"
                    >
                      <span>Address #{{ i + 1 }}</span>
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-danger"
                        (click)="removeAddress(i)"
                      >
                        <i class="fas fa-trash me-1"></i> Remove
                      </button>
                    </div>
                    <div class="card-body">
                      <div class="row">
                        <div class="col-md-6 mb-3">
                          <label class="form-label">Address Type</label>
                          <input
                            type="text"
                            class="form-control"
                            [(ngModel)]="address.addressType"
                            [name]="'addressType' + i"
                            placeholder="e.g., Home, Office"
                            required
                          />
                        </div>
                        <div class="col-md-6 mb-3">
                          <label class="form-label">Street Address</label>
                          <input
                            type="text"
                            class="form-control"
                            [(ngModel)]="address.streetAddress"
                            [name]="'streetAddress' + i"
                            required
                          />
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-4 mb-3">
                          <label class="form-label">City</label>
                          <input
                            type="text"
                            class="form-control"
                            [(ngModel)]="address.city"
                            [name]="'city' + i"
                            required
                          />
                        </div>
                        <div class="col-md-4 mb-3">
                          <label class="form-label">State</label>
                          <input
                            type="text"
                            class="form-control"
                            [(ngModel)]="address.state"
                            [name]="'state' + i"
                            required
                          />
                        </div>
                        <div class="col-md-4 mb-3">
                          <label class="form-label">Postal Code</label>
                          <input
                            type="text"
                            class="form-control"
                            [(ngModel)]="address.postalCode"
                            [name]="'postalCode' + i"
                            required
                          />
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-md-8 mb-3">
                          <label class="form-label">Country</label>
                          <input
                            type="text"
                            class="form-control"
                            [(ngModel)]="address.country"
                            [name]="'country' + i"
                            required
                          />
                        </div>
                        <div class="col-md-4 mb-3">
                          <div class="form-check pt-4">
                            <input
                              type="checkbox"
                              class="form-check-input"
                              [(ngModel)]="address.isDefault"
                              [name]="'isDefault' + i"
                              id="defaultAddress{{ i }}"
                            />
                            <label
                              class="form-check-label"
                              for="defaultAddress{{ i }}"
                            >
                              Default Address
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-secondary"
                  (click)="showAddModal = false"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  [disabled]="!customerForm.form.valid || loading"
                >
                  <span
                    *ngIf="loading"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  Add Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div
      class="modal-backdrop fade"
      [class.show]="showAddModal"
      *ngIf="showAddModal"
    ></div>

    <!-- Customer Orders Modal -->
    <div
      class="modal fade"
      [class.show]="showOrdersModal"
      [style.display]="showOrdersModal ? 'block' : 'none'"
      tabindex="-1"
      *ngIf="showOrdersModal"
    >
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-shopping-bag me-2"></i>Customer Orders
              <span *ngIf="selectedCustomer" class="text-muted">
                - {{ selectedCustomer.firstName }}
                {{ selectedCustomer.lastName }}
              </span>
            </h5>
            <button
              type="button"
              class="btn-close"
              (click)="closeOrdersModal()"
            ></button>
          </div>
          <div class="modal-body">
            <div *ngIf="loadingOrders" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading orders...</span>
              </div>
            </div>

            <div
              *ngIf="!loadingOrders && customerOrders.length === 0"
              class="text-center py-4"
            >
              <i class="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
              <p class="text-muted">No orders found for this customer</p>
            </div>

            <div *ngIf="!loadingOrders && customerOrders.length > 0">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>Order ID</th>
                      <th>Status</th>
                      <th>Total Amount</th>
                      <th>Items</th>
                      <th>Created Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      *ngFor="let order of customerOrders"
                      class="align-middle"
                    >
                      <td>
                        <strong>#{{ order.id }}</strong>
                      </td>
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
                      <td>
                        <span class="badge bg-info"
                          >{{
                            (order.orderItems && order.orderItems.length) || 0
                          }}
                          items</span
                        >
                      </td>
                      <td>{{ order.orderDate | date : 'short' }}</td>
                      <td>
                        <button
                          class="btn btn-sm btn-outline-info"
                          (click)="viewOrderDetails(order)"
                        >
                          <i class="fas fa-eye"></i> Details
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              (click)="closeOrdersModal()"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      class="modal-backdrop fade"
      [class.show]="showOrdersModal"
      *ngIf="showOrdersModal"
    ></div>

    <!-- Order Details Modal -->
    <div
      class="modal fade"
      [class.show]="showOrderDetailsModal"
      [style.display]="showOrderDetailsModal ? 'block' : 'none'"
      tabindex="-1"
      *ngIf="showOrderDetailsModal && selectedOrder"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Order Details - #{{ selectedOrder.id }}</h5>
            <button
              type="button"
              class="btn-close"
              (click)="showOrderDetailsModal = false"
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
              (click)="showOrderDetailsModal = false"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      class="modal-backdrop fade"
      [class.show]="showOrderDetailsModal"
      *ngIf="showOrderDetailsModal"
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
      .gap-1 {
        gap: 0.25rem;
      }
      .gap-2 {
        gap: 0.5rem;
      }
      .address-container .card-header {
        background-color: #f8f9fa;
        padding: 0.5rem 1rem;
      }
      .address-container .card {
        border: 1px solid #dee2e6;
      }
    `,
  ],
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  loading = false;
  showAddModal = false;
  showAdvancedFilters = false;

  // Filter and sorting options
  sortBy = 'firstName';
  sortDirection = 'asc';
  globalSearch = '';

  // Quick filters
  quickFilters = {
    name: '',
    emailDomain: '',
    activeStatus: '',
  };

  // Advanced custom filters
  customFilters: FilterCriteria[] = [];

  // Customer Orders functionality
  showOrdersModal = false;
  showOrderDetailsModal = false;
  loadingOrders = false;
  customerOrders: Order[] = [];
  selectedCustomer: Customer | null = null;
  selectedOrder: Order | null = null;

  newCustomer: CustomerCreateRequest = {
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    mobile: '',
    password: '',
    addresses: [], // Initialize addresses array
  };

  constructor(
    private customerService: CustomerService,
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
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

    this.customerService.getAllCustomers(queryParams).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.customers = response.data.content;
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading customers:', error);
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCustomers();
  }

  addAddress(): void {
    this.newCustomer.addresses!.push({
      addressType: '',
      streetAddress: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isDefault: false,
    });
  }

  removeAddress(index: number): void {
    this.newCustomer.addresses!.splice(index, 1);
  }
  addCustomer(): void {
    // Validation
    if (!this.newCustomer.firstName?.trim()) {
      this.notificationService.showError(
        'Validation Error',
        'First name is required'
      );
      return;
    }
    if (!this.newCustomer.lastName?.trim()) {
      this.notificationService.showError(
        'Validation Error',
        'Last name is required'
      );
      return;
    }
    if (!this.newCustomer.email?.trim()) {
      this.notificationService.showError(
        'Validation Error',
        'Email is required'
      );
      return;
    }
    if (!this.newCustomer.mobile?.trim()) {
      this.notificationService.showError(
        'Validation Error',
        'Mobile number is required'
      );
      return;
    }

    this.loading = true;
    this.customerService.createCustomer(this.newCustomer).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.notificationService.showSuccess(
            'Success',
            'Customer added successfully!'
          );
          this.showAddModal = false;
          this.resetForm();
          this.loadCustomers();
        } else {
          this.notificationService.showError(
            'Error',
            response.message || 'Failed to add customer'
          );
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMessage =
          this.notificationService.extractErrorMessage(error);
        this.notificationService.showError(
          'Error',
          `Failed to add customer: ${errorMessage}`
        );
        console.error('Error adding customer:', error);
      },
    });
  }

  deleteCustomer(id: string): void {
    if (!id || id === undefined || id === null) {
      this.notificationService.showError('Error', 'Invalid customer ID');
      return;
    }

    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.deleteCustomer(Number(id)).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess(
              'Success',
              'Customer deleted successfully!'
            );
            this.loadCustomers();
          } else {
            this.notificationService.showError(
              'Error',
              response.message || 'Failed to delete customer'
            );
          }
        },
        error: (error) => {
          const errorMessage =
            this.notificationService.extractDeleteErrorMessage(
              error,
              'customer'
            );
          this.notificationService.showError('Delete Failed', errorMessage);
          console.error('Error deleting customer:', error);
        },
      });
    }
  }

  viewCustomerOrders(customerId: string): void {
    console.log('Customer ID:', customerId);

    this.selectedCustomer =
      this.customers.find((c) => c.id === customerId) || null;
    console.log('Selected Customer:', this.selectedCustomer);
    console.log('Customer ID:', customerId);
    console.log('Selected Customer email:', this.selectedCustomer?.email);
    this.showOrdersModal = true;
    this.loadCustomerOrders(Number(customerId));
  }

  loadCustomerOrders(customerId: number): void {
    if (!customerId || customerId === undefined || customerId === null) {
      this.notificationService.showError('Error', 'Invalid customer ID');
      return;
    }

    this.loadingOrders = true;
    this.customerOrders = [];

    this.orderService
      .getOrdersByCustomer(Number(customerId), { page: 0, size: 50 })
      .subscribe({
        next: (response) => {
          this.loadingOrders = false;
          if (response.success && response.data) {
            this.customerOrders = response.data.content;
          } else {
            this.notificationService.showError(
              'Error',
              'Failed to load customer orders'
            );
          }
        },
        error: (error) => {
          this.loadingOrders = false;
          const errorMessage =
            this.notificationService.extractErrorMessage(error);
          this.notificationService.showError(
            'Error',
            `Failed to load customer orders: ${errorMessage}`
          );
          console.error('Error loading customer orders:', error);
        },
      });
  }

  closeOrdersModal(): void {
    this.showOrdersModal = false;
    this.selectedCustomer = null;
    this.customerOrders = [];
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.showOrderDetailsModal = true;
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

  resetForm(): void {
    this.newCustomer = {
      username: '',
      email: '',
      firstName: '',
      lastName: '',
      mobile: '',
      password: '',
      addresses: [],
    };
  }

  // Filter management methods
  applyFilters(): void {
    this.currentPage = 1;
    this.loadCustomers();
  }

  resetFilters(): void {
    this.sortBy = 'firstName';
    this.sortDirection = 'asc';
    this.pageSize = 10;
    this.currentPage = 1;
    this.globalSearch = '';
    this.quickFilters = { name: '', emailDomain: '', activeStatus: '' };
    this.customFilters = [];
    this.showAdvancedFilters = false;
    this.loadCustomers();
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

  applyEmailDomainFilter(domain: string): void {
    // Remove existing email filters
    this.customFilters = this.customFilters.filter(
      (f) => f.field !== 'user.email'
    );

    if (domain) {
      this.customFilters.push({
        field: 'user.email',
        operator: 'ENDS_WITH',
        value: domain,
      });
    }

    this.applyFilters();
  }

  applyActiveStatusFilter(status: string): void {
    // Remove existing active status filters
    this.customFilters = this.customFilters.filter(
      (f) => f.field !== 'user.isActive'
    );

    if (status) {
      this.customFilters.push({
        field: 'user.isActive',
        operator: status === 'true' ? 'IS_TRUE' : 'IS_FALSE',
        value: '',
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
      if (
        filter.field &&
        filter.operator &&
        (filter.value ||
          ['IS_TRUE', 'IS_FALSE', 'IS_NULL', 'IS_NOT_NULL'].includes(
            filter.operator
          ))
      ) {
        this.applyFilters();
      }
    }, 300);
  }

  getActiveFilters(): FilterCriteria[] {
    return this.customFilters.filter(
      (f) =>
        f.field &&
        f.operator &&
        (f.value ||
          ['IS_TRUE', 'IS_FALSE', 'IS_NULL', 'IS_NOT_NULL'].includes(
            f.operator
          ))
    );
  }

  getActiveFiltersCount(): number {
    let count = this.getActiveFilters().length;
    if (this.globalSearch?.trim()) count++;
    return count;
  }
}
