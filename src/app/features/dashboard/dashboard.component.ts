import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';
import { CustomerService } from '../../core/services/customer.service';
import { OrderService } from '../../core/services/order.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { User } from '../../core/models/auth.model';
import { Observable, forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule],
  template: `
    <div class="container-fluid py-4">
      <!-- Welcome Section -->
      <div class="row mb-4" *ngIf="currentUser$ | async as user">
        <div class="col-12">
          <div class="card border-0" style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));">
            <div class="card-body text-white">
              <div class="row align-items-center">
                <div class="col">
                  <h3 class="mb-2">
                    <i class="fas fa-tachometer-alt me-2"></i>
                    Order Management System
                  </h3>
                  <p class="mb-0">
                    Welcome, <strong>{{ user.username }}</strong> ({{ user.role }})
                  </p>
                </div>
                <div class="col-auto">
                  <i class="fas fa-chart-line fa-2x"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row mb-4">
        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card text-center">
            <div class="card-body">
              <i class="fas fa-shopping-bag fa-2x text-primary mb-2"></i>
              <h4 class="mb-1">{{ stats.totalOrders }}</h4>
              <p class="text-muted mb-0">Total Orders</p>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card text-center">
            <div class="card-body">
              <i class="fas fa-users fa-2x text-success mb-2"></i>
              <h4 class="mb-1">{{ stats.totalCustomers }}</h4>
              <p class="text-muted mb-0">Total Customers</p>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card text-center">
            <div class="card-body">
              <i class="fas fa-box fa-2x text-warning mb-2"></i>
              <h4 class="mb-1">{{ stats.totalProducts }}</h4>
              <p class="text-muted mb-0">Total Products</p>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6 mb-3">
          <div class="card text-center">
            <div class="card-body">
              <i class="fas fa-file-invoice fa-2x text-info mb-2"></i>
              <h4 class="mb-1">{{ stats.totalInvoices }}</h4>
              <p class="text-muted mb-0">Total Invoices</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-bolt me-2"></i>Quick Actions
              </h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-lg-3 col-md-6 mb-2">
                  <button class="btn btn-primary w-100" routerLink="/orders/create">
                    <i class="fas fa-plus me-2"></i>Create Order
                  </button>
                </div>
                <div class="col-lg-3 col-md-6 mb-2">
                  <button class="btn btn-success w-100" routerLink="/customers">
                    <i class="fas fa-users me-2"></i>Customers
                  </button>
                </div>
                <div class="col-lg-3 col-md-6 mb-2">
                  <button class="btn btn-warning w-100" routerLink="/products">
                    <i class="fas fa-box me-2"></i>Products
                  </button>
                </div>
                <div class="col-lg-3 col-md-6 mb-2">
                  <button class="btn btn-info w-100" routerLink="/invoices">
                    <i class="fas fa-file-invoice me-2"></i>Invoices
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Status Overview -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-chart-bar me-2"></i>Order Status Overview
              </h5>
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div class="col-md-4 mb-3">
                  <div class="border rounded p-3">
                    <h3 class="text-warning">{{ stats.pendingOrders }}</h3>
                    <p class="mb-0">Pending Orders</p>
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <div class="border rounded p-3">
                    <h3 class="text-success">{{ stats.confirmedOrders }}</h3>
                    <p class="mb-0">Confirmed Orders</p>
                  </div>
                </div>
                <div class="col-md-4 mb-3">
                  <div class="border rounded p-3">
                    <h3 class="text-info">{{ stats.completedOrders }}</h3>
                    <p class="mb-0">Completed Orders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn {
      transition: all 0.2s ease;
    }
    .btn:hover {
      transform: translateY(-1px);
    }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser$: Observable<User | null>;
  
  stats = {
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalInvoices: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    completedOrders: 0
  };

  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private customerService: CustomerService,
    private orderService: OrderService,
    private invoiceService: InvoiceService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.loadDashboardStats();
  }

  loadDashboardStats(): void {
    // Load real data from API services
    forkJoin({
      products: this.productService.getAllProducts({ page: 0, size: 1000 }),
      customers: this.customerService.getAllCustomers({ page: 0, size: 1000 }),
      orders: this.orderService.getAllOrders({ page: 0, size: 1000 }),
      invoices: this.invoiceService.getAllInvoices({ page: 0, size: 1000 })
    }).subscribe({
      next: (data) => {
        const orders = data.orders.data?.content || [];
        
        this.stats = {
          totalOrders: data.orders.data?.totalElements || 0,
          totalCustomers: data.customers.data?.totalElements || 0,
          totalProducts: data.products.data?.totalElements || 0,
          totalInvoices: data.invoices.data?.totalElements || 0,
          pendingOrders: orders.filter(o => o.orderStatus === 'PENDING').length,
          confirmedOrders: orders.filter(o => o.orderStatus === 'CONFIRMED').length,
          completedOrders: orders.filter(o => o.orderStatus === 'COMPLETED').length
        };
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        // Fallback to basic stats if API calls fail
        this.stats = {
          totalOrders: 0,
          totalCustomers: 0,
          totalProducts: 0,
          totalInvoices: 0,
          pendingOrders: 0,
          confirmedOrders: 0,
          completedOrders: 0
        };
      }
    });
  }
}