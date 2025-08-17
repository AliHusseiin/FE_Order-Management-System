import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import {
  ProductService,
  FilterCriteria,
  QueryParams,
} from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { PagedResponse } from '../../core/models/product.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="fas fa-box me-2"></i>Product Catalog</h2>
            <button class="btn btn-primary" (click)="showAddModal = true">
              <i class="fas fa-plus me-1"></i>Add Product
            </button>
          </div>

          <!-- Filters -->
          <div class="card shadow mb-4">
            <div class="card-header bg-light">
              <h6 class="card-title mb-0">Advanced Filters & Sorting</h6>
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
                    placeholder="Search across all fields..."
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
                </div>
              </div>

              <!-- Quick Filters -->
              <div class="row mb-3">
                <div class="col-md-3">
                  <label class="form-label">Category</label>
                  <select
                    class="form-select"
                    [(ngModel)]="quickFilters.category"
                    (change)="
                      applyQuickFilter('category', quickFilters.category)
                    "
                  >
                    <option value="">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Books">Books</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home">Home</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Price Range</label>
                  <select
                    class="form-select"
                    [(ngModel)]="quickFilters.priceRange"
                    (change)="applyPriceRangeFilter(quickFilters.priceRange)"
                  >
                    <option value="">All Prices</option>
                    <option value="0-50">$0 - $50</option>
                    <option value="50-100">$50 - $100</option>
                    <option value="100-500">$100 - $500</option>
                    <option value="500+">$500+</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Stock Status</label>
                  <select
                    class="form-select"
                    [(ngModel)]="quickFilters.stockStatus"
                    (change)="applyStockFilter(quickFilters.stockStatus)"
                  >
                    <option value="">All Stock</option>
                    <option value="in-stock">In Stock (>0)</option>
                    <option value="low-stock">Low Stock (1-10)</option>
                    <option value="high-stock">High Stock (>10)</option>
                    <option value="out-of-stock">Out of Stock (0)</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Show Filters</label>
                  <button
                    class="btn btn-outline-info w-100"
                    (click)="showAdvancedFilters = !showAdvancedFilters"
                  >
                    <i
                      class="fas"
                      [class.fa-chevron-down]="!showAdvancedFilters"
                      [class.fa-chevron-up]="showAdvancedFilters"
                    ></i>
                    Advanced Filters
                  </button>
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
                      <option value="productName">Product Name</option>
                      <option value="description">Description</option>
                      <option value="price">Price</option>
                      <option value="stockQuantity">Stock Quantity</option>
                      <option value="category">Category</option>
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
                      <option value="NOT_IN">Not In (comma-separated)</option>
                      <option value="IS_NULL">Is Null</option>
                      <option value="IS_NOT_NULL">Is Not Null</option>
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
                    <option value="productName">Product Name</option>
                    <option value="price">Price</option>
                    <option value="stockQuantity">Stock Quantity</option>
                    <option value="category">Category</option>
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

          <!-- Products Table -->
          <div class="card shadow">
            <div class="card-header bg-light">
              <h5 class="card-title mb-0">
                Products ({{ totalElements }} total)
              </h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead class="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Product Name</th>
                      <th>Description</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let product of products" class="align-middle">
                      <td>{{ product.id }}</td>
                      <td>
                        <strong>{{ product.productName }}</strong>
                      </td>
                      <td>
                        <span class="text-muted"
                          >{{ product.description | slice : 0 : 50 }}...</span
                        >
                      </td>
                      <td>
                        <span class="badge bg-success"
                          >\${{ product.price | number : '1.2-2' }}</span
                        >
                      </td>
                      <td>
                        <span
                          class="badge"
                          [class]="
                            product.stockQuantity > 10
                              ? 'bg-success'
                              : product.stockQuantity > 0
                              ? 'bg-warning'
                              : 'bg-danger'
                          "
                        >
                          {{ product.stockQuantity }}
                        </span>
                      </td>
                      <td>
                        <span class="badge bg-info">{{
                          product.category
                        }}</span>
                      </td>
                      <td>
                        <button
                          class="btn btn-sm btn-outline-danger"
                          (click)="deleteProduct(product.id)"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                    <tr *ngIf="products.length === 0 && !loading">
                      <td colspan="7" class="text-center text-muted py-4">
                        No products found
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

    <!-- Add Product Modal -->
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
            <h5 class="modal-title">Add New Product</h5>
            <button
              type="button"
              class="btn-close"
              (click)="showAddModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <form #productForm="ngForm" (ngSubmit)="addProduct()">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Product Name</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="newProduct.productName"
                    name="productName"
                    required
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Category</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="newProduct.category"
                    name="category"
                    required
                  />
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Description</label>
                <textarea
                  class="form-control"
                  rows="3"
                  [(ngModel)]="newProduct.description"
                  name="description"
                  required
                ></textarea>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Price</label>
                  <input
                    type="number"
                    class="form-control"
                    [(ngModel)]="newProduct.price"
                    name="price"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    class="form-control"
                    [(ngModel)]="newProduct.stockQuantity"
                    name="stockQuantity"
                    min="0"
                    required
                  />
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
                  [disabled]="!productForm.form.valid || loading"
                >
                  <span
                    *ngIf="loading"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  Add Product
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
      .card-title {
        color: #495057;
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
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  loading = false;
  showAddModal = false;
  showAdvancedFilters = false;

  // Filter and sorting options
  sortBy = 'productName';
  sortDirection = 'asc';
  globalSearch = '';

  // Quick filters
  quickFilters = {
    category: '',
    priceRange: '',
    stockStatus: '',
  };

  // Advanced custom filters
  customFilters: FilterCriteria[] = [];

  newProduct = {
    productName: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    category: '',
  };

  constructor(
    private productService: ProductService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
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

    this.productService.getAllProducts(queryParams).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.products = response.data.content;
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMessage =
          this.notificationService.extractErrorMessage(error);
        this.notificationService.showError(
          'Error',
          `Failed to load products: ${errorMessage}`
        );
        console.error('Error loading products:', error);
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadProducts();
  }

  resetFilters(): void {
    this.sortBy = 'productName';
    this.sortDirection = 'asc';
    this.pageSize = 10;
    this.currentPage = 1;
    this.globalSearch = '';
    this.quickFilters = { category: '', priceRange: '', stockStatus: '' };
    this.customFilters = [];
    this.showAdvancedFilters = false;
    this.loadProducts();
  }

  // Advanced filtering methods
  applyQuickFilter(field: string, value: string): void {
    // Remove existing filter for this field
    this.customFilters = this.customFilters.filter((f) => f.field !== field);

    // Add new filter if value is not empty
    if (value) {
      this.customFilters.push({
        field: field,
        operator: 'EQUALS',
        value: value,
      });
    }

    this.applyFilters();
  }

  applyPriceRangeFilter(range: string): void {
    // Remove existing price filters
    this.customFilters = this.customFilters.filter((f) => f.field !== 'price');

    if (range) {
      if (range === '500+') {
        this.customFilters.push({
          field: 'price',
          operator: 'GREATER_THAN',
          value: '500',
        });
      } else {
        const [min, max] = range.split('-');
        this.customFilters.push({
          field: 'price',
          operator: 'BETWEEN',
          value: min,
          value2: max,
        });
      }
    }

    this.applyFilters();
  }

  applyStockFilter(status: string): void {
    // Remove existing stock filters
    this.customFilters = this.customFilters.filter(
      (f) => f.field !== 'stockQuantity'
    );

    if (status) {
      switch (status) {
        case 'in-stock':
          this.customFilters.push({
            field: 'stockQuantity',
            operator: 'GREATER_THAN',
            value: '0',
          });
          break;
        case 'low-stock':
          this.customFilters.push({
            field: 'stockQuantity',
            operator: 'BETWEEN',
            value: '1',
            value2: '10',
          });
          break;
        case 'high-stock':
          this.customFilters.push({
            field: 'stockQuantity',
            operator: 'GREATER_THAN',
            value: '10',
          });
          break;
        case 'out-of-stock':
          this.customFilters.push({
            field: 'stockQuantity',
            operator: 'EQUALS',
            value: '0',
          });
          break;
      }
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
          filter.operator === 'IS_NULL' ||
          filter.operator === 'IS_NOT_NULL')
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
        (f.value || f.operator === 'IS_NULL' || f.operator === 'IS_NOT_NULL')
    );
  }

  getActiveFiltersCount(): number {
    let count = this.getActiveFilters().length;
    if (this.globalSearch?.trim()) count++;
    return count;
  }

  addProduct(): void {
    if (!this.newProduct.productName?.trim()) {
      this.notificationService.showError(
        'Validation Error',
        'Product name is required'
      );
      return;
    }
    if (!this.newProduct.category?.trim()) {
      this.notificationService.showError(
        'Validation Error',
        'Category is required'
      );
      return;
    }
    if (this.newProduct.price <= 0) {
      this.notificationService.showError(
        'Validation Error',
        'Price must be greater than 0'
      );
      return;
    }
    if (this.newProduct.stockQuantity < 0) {
      this.notificationService.showError(
        'Validation Error',
        'Stock quantity cannot be negative'
      );
      return;
    }

    this.loading = true;
    this.productService.createProduct(this.newProduct).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.notificationService.showSuccess(
            'Success',
            'Product added successfully!'
          );
          this.showAddModal = false;
          this.resetForm();
          this.loadProducts();
        } else {
          this.notificationService.showError(
            'Error',
            response.message || 'Failed to add product'
          );
        }
      },
      error: (error) => {
        this.loading = false;
        const errorMessage =
          this.notificationService.extractErrorMessage(error);
        this.notificationService.showError(
          'Error',
          `Failed to add product: ${errorMessage}`
        );
        console.error('Error adding product:', error);
      },
    });
  }

  deleteProduct(id: number): void {
    if (!id || id === undefined || id === null) {
      this.notificationService.showError('Error', 'Invalid product ID');
      return;
    }

    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(Number(id)).subscribe({
        next: (response) => {
          if (response.success) {
            this.notificationService.showSuccess(
              'Success',
              'Product deleted successfully!'
            );
            this.loadProducts();
          } else {
            this.notificationService.showError(
              'Error',
              response.message || 'Failed to delete product'
            );
          }
        },
        error: (error) => {
          const errorMessage =
            this.notificationService.extractDeleteErrorMessage(
              error,
              'product'
            );
          this.notificationService.showError('Delete Failed', errorMessage);
          console.error('Error deleting product:', error);
        },
      });
    }
  }

  resetForm(): void {
    this.newProduct = {
      productName: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      category: '',
    };
  }
}
