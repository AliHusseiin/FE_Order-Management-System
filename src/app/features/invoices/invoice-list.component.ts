import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../core/services/invoice.service';
import { Invoice } from '../../core/models/invoice.model';
import { PagedResponse } from '../../core/models/product.model';
import {
  FilterCriteria,
  QueryParams,
} from '../../core/services/product.service';
import { NotificationService } from '../../core/services/notification.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2><i class="fas fa-file-invoice me-2"></i>Invoice Management</h2>
          </div>

          <div class="card shadow">
            <div class="card-header bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="card-title mb-0">
                  Invoices ({{ totalElements }} total)
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
                      placeholder="Search invoices..."
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
                    <label class="form-label">Invoice Status</label>
                    <select
                      class="form-select"
                      [(ngModel)]="quickFilters.status"
                      (change)="
                        applyQuickFilter(
                          'invoiceStatus',
                          quickFilters.status,
                          'EQUALS'
                        )
                      "
                    >
                      <option value="">All Status</option>
                      <option value="GENERATED">Generated</option>
                      <option value="SENT">Sent</option>
                      <option value="PAID">Paid</option>
                      <option value="OVERDUE">Overdue</option>
                    </select>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Invoice Number</label>
                    <input
                      type="text"
                      class="form-control"
                      [(ngModel)]="quickFilters.invoiceNumber"
                      (blur)="
                        applyQuickFilter(
                          'invoiceNumber',
                          quickFilters.invoiceNumber,
                          'CONTAINS'
                        )
                      "
                      placeholder="Invoice number..."
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
                      <option value="0-500">$0 - $500</option>
                      <option value="500-1000">$500 - $1000</option>
                      <option value="1000-5000">$1000 - $5000</option>
                      <option value="5000+">$5000+</option>
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
                        <option value="invoiceNumber">Invoice Number</option>
                        <option value="invoiceStatus">Invoice Status</option>
                        <option value="totalAmount">Total Amount</option>
                        <option value="invoiceDate">Invoice Date</option>
                        <option value="order.customer.id">Customer ID</option>
                        <option value="order.customer.addresses.city">
                          Customer City
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
                      <option value="invoiceDate">Invoice Date</option>
                      <option value="totalAmount">Total Amount</option>
                      <option value="invoiceNumber">Invoice Number</option>
                      <option value="invoiceStatus">Status</option>
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
                      <th class="sortable" (click)="sort('invoiceId')">
                        Invoice ID
                        <i class="fas" [class]="getSortIcon('invoiceId')"></i>
                      </th>
                      <th class="sortable" (click)="sort('invoiceNumber')">
                        Invoice Number
                        <i
                          class="fas"
                          [class]="getSortIcon('invoiceNumber')"
                        ></i>
                      </th>
                      <th class="sortable" (click)="sort('orderId')">
                        Order ID
                        <i class="fas" [class]="getSortIcon('orderId')"></i>
                      </th>
                      <th class="sortable" (click)="sort('invoiceAmount')">
                        Invoice Amount
                        <i
                          class="fas"
                          [class]="getSortIcon('invoiceAmount')"
                        ></i>
                      </th>
                      <th class="sortable" (click)="sort('taxAmount')">
                        Tax Amount
                        <i class="fas" [class]="getSortIcon('taxAmount')"></i>
                      </th>
                      <th class="sortable" (click)="sort('totalAmount')">
                        Total Amount
                        <i class="fas" [class]="getSortIcon('totalAmount')"></i>
                      </th>
                      <th class="sortable" (click)="sort('createdAt')">
                        Created Date
                        <i class="fas" [class]="getSortIcon('createdAt')"></i>
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let invoice of invoices" class="align-middle">
                      <td>
                        <strong>#{{ invoice.id }}</strong>
                      </td>
                      <td>
                        <span class="badge bg-primary">{{
                          invoice.invoiceNumber
                        }}</span>
                      </td>
                      <td>
                        <a routerLink="/orders" class="text-decoration-none">
                          Order #{{ invoice.order.id }}
                        </a>
                      </td>
                      <td>\${{ invoice.invoiceAmount | number : '1.2-2' }}</td>
                      <td>
                        <span class="badge bg-warning text-dark">
                          \${{ invoice.taxAmount | number : '1.2-2' }}
                        </span>
                      </td>
                      <td>
                        <strong class="text-success">
                          \${{ invoice.totalAmount | number : '1.2-2' }}
                        </strong>
                      </td>
                      <td>{{ invoice.invoiceDate | date : 'short' }}</td>
                      <td>
                        <div class="btn-group" role="group">
                          <button
                            class="btn btn-sm btn-outline-info"
                            (click)="viewInvoiceDetails(invoice)"
                          >
                            <i class="fas fa-eye"></i> View
                          </button>
                          <button
                            class="btn btn-sm btn-outline-primary"
                            (click)="downloadInvoice(invoice)"
                          >
                            <i class="fas fa-download"></i> Download
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr *ngIf="invoices.length === 0 && !loading">
                      <td colspan="8" class="text-center text-muted py-4">
                        No invoices found
                      </td>
                    </tr>
                    <tr *ngIf="loading">
                      <td colspan="8" class="text-center py-4">
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

    <!-- Invoice Details Modal -->
    <div
      class="modal fade"
      [class.show]="showDetailsModal"
      [style.display]="showDetailsModal ? 'block' : 'none'"
      tabindex="-1"
      *ngIf="showDetailsModal && selectedInvoice"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="fas fa-file-invoice me-2"></i>Invoice Details
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              (click)="showDetailsModal = false"
            ></button>
          </div>
          <div class="modal-body">
            <!-- Invoice Header -->
            <div class="invoice-header text-center mb-4">
              <h3 class="text-primary">INVOICE</h3>
              <h4>{{ selectedInvoice.invoiceNumber }}</h4>
            </div>

            <!-- Invoice Information Grid -->
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="card bg-light">
                  <div class="card-body">
                    <h6 class="card-title">Invoice Information</h6>
                    <p class="mb-1">
                      <strong>Invoice ID:</strong>
                      {{ selectedInvoice.id }}
                    </p>
                    <p class="mb-1">
                      <strong>Invoice Number:</strong>
                      {{ selectedInvoice.invoiceNumber }}
                    </p>
                    <p class="mb-1">
                      <strong>Order ID:</strong> {{ selectedInvoice.order.id }}
                    </p>
                    <p class="mb-0">
                      <strong>Created Date:</strong>
                      {{ selectedInvoice.invoiceDate | date : 'full' }}
                    </p>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card bg-light">
                  <div class="card-body">
                    <h6 class="card-title">Amount Breakdown</h6>
                    <div class="d-flex justify-content-between mb-1">
                      <span>Invoice Amount:</span>
                      <span
                        >\${{
                          selectedInvoice.invoiceAmount | number : '1.2-2'
                        }}</span
                      >
                    </div>
                    <div class="d-flex justify-content-between mb-1">
                      <span>Tax Amount:</span>
                      <span class="text-warning"
                        >\${{
                          selectedInvoice.taxAmount | number : '1.2-2'
                        }}</span
                      >
                    </div>
                    <hr class="my-2" />
                    <div class="d-flex justify-content-between">
                      <strong>Total Amount:</strong>
                      <strong class="text-success"
                        >\${{
                          selectedInvoice.totalAmount | number : '1.2-2'
                        }}</strong
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tax Calculation Details -->
            <div class="card bg-info bg-opacity-10 border-info">
              <div class="card-body">
                <h6 class="card-title text-info">
                  <i class="fas fa-calculator me-2"></i>Tax Calculation
                </h6>
                <div class="row">
                  <div class="col-md-4">
                    <small class="text-muted">Invoice Amount:</small>
                    <div>
                      \${{ selectedInvoice.invoiceAmount | number : '1.2-2' }}
                    </div>
                  </div>
                  <div class="col-md-4">
                    <small class="text-muted">Tax Rate:</small>
                    <div>{{ getTaxRate() }}%</div>
                  </div>
                  <div class="col-md-4">
                    <small class="text-muted">Tax Amount:</small>
                    <div class="text-warning">
                      \${{ selectedInvoice.taxAmount | number : '1.2-2' }}
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
              (click)="showDetailsModal = false"
            >
              <i class="fas fa-times me-1"></i>Close
            </button>
            <button
              type="button"
              class="btn btn-primary"
              (click)="downloadInvoice(selectedInvoice)"
            >
              <i class="fas fa-download me-1"></i>Download Invoice
            </button>
            <button
              type="button"
              class="btn btn-outline-primary"
              (click)="printInvoice()"
            >
              <i class="fas fa-print me-1"></i>Print
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
      .invoice-header {
        border-bottom: 2px solid #007bff;
        padding-bottom: 1rem;
      }
      .card.bg-light {
        border: 1px solid #dee2e6;
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
export class InvoiceListComponent implements OnInit {
  invoices: Invoice[] = [];
  selectedInvoice: Invoice | null = null;
  currentPage = 1;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  loading = false;
  showDetailsModal = false;

  // Filtering and Sorting
  showFilters = false;
  showAdvancedFilters = false;
  sortBy = 'invoiceDate';
  sortDirection: 'asc' | 'desc' = 'desc';
  globalSearch = '';

  // Quick filters
  quickFilters = {
    status: '',
    invoiceNumber: '',
    amountRange: '',
    dateRange: '',
  };

  // Advanced custom filters
  customFilters: FilterCriteria[] = [];

  constructor(
    private invoiceService: InvoiceService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
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

    this.invoiceService.getAllInvoices(queryParams).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success && response.data) {
          this.invoices = response.data.content;
          this.totalElements = response.data.totalElements;
          this.totalPages = response.data.totalPages;
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error loading invoices:', error);
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadInvoices();
  }

  viewInvoiceDetails(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.showDetailsModal = true;
  }

  downloadInvoice(invoice: Invoice): void {
    try {
      const pdf = new jsPDF();
      const currentDate = new Date().toLocaleDateString();
      const taxRate = this.calculateTaxRate(invoice);

      // Set fonts and colors
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(24);
      pdf.setTextColor(0, 123, 255); // Blue color

      // Header
      pdf.text('Order Management System', 105, 20, { align: 'center' });

      pdf.setFontSize(18);
      pdf.text('INVOICE', 105, 35, { align: 'center' });

      pdf.setFontSize(16);
      pdf.text(invoice.invoiceNumber, 105, 50, { align: 'center' });

      // Reset color and font
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      // Invoice Information
      let yPos = 75;
      pdf.setFont('helvetica', 'bold');
      pdf.text('Invoice Information:', 20, yPos);
      pdf.setFont('helvetica', 'normal');

      yPos += 10;
      pdf.text(`Invoice ID: ${invoice.id}`, 20, yPos);
      yPos += 7;
      pdf.text(`Invoice Number: ${invoice.invoiceNumber}`, 20, yPos);
      yPos += 7;
      pdf.text(`Order ID: ${invoice.order.id}`, 20, yPos);
      yPos += 7;
      pdf.text(
        `Created Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`,
        20,
        yPos
      );
      yPos += 7;
      pdf.text(`Downloaded: ${currentDate}`, 20, yPos);

      // Amount Breakdown Box
      yPos += 20;
      const boxX = 110;
      const boxY = yPos - 5;
      const boxWidth = 80;
      const boxHeight = 45;

      // Draw box
      pdf.setDrawColor(200, 200, 200);
      pdf.setFillColor(248, 249, 250);
      pdf.rect(boxX, boxY, boxWidth, boxHeight, 'FD');

      // Amount breakdown content
      pdf.setFont('helvetica', 'bold');
      pdf.text('Amount Breakdown', boxX + 5, yPos);
      pdf.setFont('helvetica', 'normal');

      yPos += 10;
      pdf.text(`Invoice Amount:`, boxX + 5, yPos);
      pdf.text(
        `$${invoice.invoiceAmount.toFixed(2)}`,
        boxX + boxWidth - 25,
        yPos,
        { align: 'right' }
      );

      yPos += 7;
      pdf.text(`Tax (${taxRate}%):`, boxX + 5, yPos);
      pdf.text(`$${invoice.taxAmount.toFixed(2)}`, boxX + boxWidth - 25, yPos, {
        align: 'right',
      });

      // Total line
      yPos += 10;
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.setTextColor(40, 167, 69); // Green color
      pdf.text('Total Amount:', boxX + 5, yPos);
      pdf.text(
        `$${invoice.totalAmount.toFixed(2)}`,
        boxX + boxWidth - 25,
        yPos,
        { align: 'right' }
      );

      // Reset text settings
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      // Tax calculation details
      yPos += 20;
      pdf.setFillColor(233, 236, 239);
      pdf.rect(20, yPos - 5, 170, 25, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.text('Tax Calculation Details', 25, yPos);
      pdf.setFont('helvetica', 'normal');

      yPos += 10;
      pdf.text(
        `This invoice includes ${taxRate}% tax calculated on the invoice amount of $${invoice.invoiceAmount.toFixed(
          2
        )}.`,
        25,
        yPos
      );
      yPos += 7;
      pdf.setFontSize(9);
      pdf.setTextColor(108, 117, 125);
      pdf.text(
        `Tax Amount: $${invoice.invoiceAmount.toFixed(
          2
        )} × ${taxRate}% = $${invoice.taxAmount.toFixed(2)}`,
        25,
        yPos
      );

      // Footer
      pdf.setTextColor(0, 0, 0);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      yPos = 250;
      pdf.text('Thank you for your business!', 105, yPos, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      yPos += 10;
      pdf.text(
        'This is a computer-generated invoice. For any queries, please contact our support team.',
        105,
        yPos,
        { align: 'center' }
      );
      yPos += 7;
      pdf.text(`Generated on: ${currentDate}`, 105, yPos, { align: 'center' });

      // Save the PDF
      pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);

      this.notificationService.showSuccess(
        'Success',
        'Invoice PDF downloaded successfully!'
      );
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.notificationService.showError(
        'Error',
        'Failed to generate PDF. Please try again.'
      );
    }
  }

  generateInvoiceHtml(invoice: Invoice): string {
    const currentDate = new Date().toLocaleDateString();
    const taxRate = this.calculateTaxRate(invoice);

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            color: #333;
        }
        .header { 
            text-align: center; 
            border-bottom: 2px solid #007bff; 
            padding-bottom: 20px; 
            margin-bottom: 30px;
        }
        .company-name { 
            font-size: 28px; 
            font-weight: bold; 
            color: #007bff; 
            margin-bottom: 5px;
        }
        .invoice-title { 
            font-size: 24px; 
            color: #6c757d; 
            margin: 10px 0;
        }
        .invoice-number { 
            font-size: 20px; 
            font-weight: bold; 
            color: #007bff;
        }
        .invoice-info { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px;
        }
        .info-section { 
            flex: 1; 
            margin-right: 20px;
        }
        .info-section h3 { 
            color: #495057; 
            border-bottom: 1px solid #dee2e6; 
            padding-bottom: 5px;
        }
        .amount-breakdown { 
            background-color: #f8f9fa; 
            padding: 20px; 
            border-radius: 5px; 
            border: 1px solid #dee2e6;
        }
        .amount-row { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 10px;
        }
        .total-row { 
            font-weight: bold; 
            font-size: 18px; 
            color: #28a745; 
            border-top: 2px solid #dee2e6; 
            padding-top: 10px;
        }
        .footer { 
            margin-top: 40px; 
            text-align: center; 
            color: #6c757d; 
            border-top: 1px solid #dee2e6; 
            padding-top: 20px;
        }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">Order Management System</div>
        <div class="invoice-title">INVOICE</div>
        <div class="invoice-number">${invoice.invoiceNumber}</div>
    </div>

    <div class="invoice-info">
        <div class="info-section">
            <h3>Invoice Information</h3>
            <p><strong>Invoice ID:</strong> ${invoice.id}</p>
            <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Order ID:</strong> ${invoice.order.id}</p>
            <p><strong>Created Date:</strong> ${new Date(
              invoice.invoiceDate
            ).toLocaleDateString()}</p>
            <p><strong>Downloaded:</strong> ${currentDate}</p>
        </div>

        <div class="info-section">
            <div class="amount-breakdown">
                <h3 style="margin-top: 0; border: none;">Amount Breakdown</h3>
                <div class="amount-row">
                    <span>Invoice Amount:</span>
                    <span>$${invoice.invoiceAmount.toFixed(2)}</span>
                </div>
                <div class="amount-row">
                    <span>Tax Amount (${taxRate}%):</span>
                    <span>$${invoice.taxAmount.toFixed(2)}</span>
                </div>
                <div class="amount-row total-row">
                    <span>Total Amount:</span>
                    <span>$${invoice.totalAmount.toFixed(2)}</span>
                </div>
            </div>
        </div>
    </div>

    <div style="background-color: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 30px;">
        <h3 style="margin: 0; color: #495057;">Tax Calculation Details</h3>
        <p style="margin: 10px 0;">This invoice includes ${taxRate}% tax calculated on the invoice amount of $${invoice.invoiceAmount.toFixed(
      2
    )}.</p>
        <p style="margin: 0; font-size: 14px; color: #6c757d;">Tax Amount: $${invoice.invoiceAmount.toFixed(
          2
        )} × ${taxRate}% = $${invoice.taxAmount.toFixed(2)}</p>
    </div>

    <div class="footer">
        <p><strong>Thank you for your business!</strong></p>
        <p>This is a computer-generated invoice. For any queries, please contact our support team.</p>
        <p>Generated on: ${currentDate}</p>
    </div>
</body>
</html>`;
  }

  calculateTaxRate(invoice: Invoice): number {
    if (invoice.invoiceAmount > 0) {
      return (
        Math.round((invoice.taxAmount / invoice.invoiceAmount) * 100 * 100) /
        100
      );
    }
    return 0;
  }

  printInvoice(): void {
    if (!this.selectedInvoice) return;

    // Create a new window with the invoice content
    const invoiceHtml = this.generateInvoiceHtml(this.selectedInvoice);
    const printWindow = window.open('', '_blank', 'width=800,height=600');

    if (printWindow) {
      printWindow.document.write(invoiceHtml);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    } else {
      alert('Please allow pop-ups to enable printing functionality');
    }
  }

  getTaxRate(): number {
    if (!this.selectedInvoice) return 0;
    return this.calculateTaxRate(this.selectedInvoice);
  }

  // Filter and Sort Methods
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadInvoices();
  }

  resetFilters(): void {
    this.sortBy = 'invoiceDate';
    this.sortDirection = 'desc';
    this.pageSize = 10;
    this.currentPage = 1;
    this.globalSearch = '';
    this.quickFilters = {
      status: '',
      invoiceNumber: '',
      amountRange: '',
      dateRange: '',
    };
    this.customFilters = [];
    this.showAdvancedFilters = false;
    this.loadInvoices();
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
      if (range === '5000+') {
        this.customFilters.push({
          field: 'totalAmount',
          operator: 'GREATER_THAN',
          value: '5000',
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
      (f) => f.field !== 'invoiceDate'
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
        field: 'invoiceDate',
        operator: 'BETWEEN',
        value: startDate.toISOString().split('T')[0] + 'T00:00:00',
        value2: now.toISOString().split('T')[0] + 'T23:59:59',
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
        (f.value || ['IS_NULL', 'IS_NOT_NULL'].includes(f.operator))
    );
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
    this.loadInvoices();
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) {
      return 'fa-sort text-muted';
    }
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }
}
