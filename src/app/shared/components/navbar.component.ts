import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../core/models/auth.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark">
      <div class="container-fluid">
        <a class="navbar-brand" routerLink="/dashboard">
          <i class="fas fa-chart-line me-2"></i>
          OMS
        </a>
        
        <button class="navbar-toggler" type="button" 
                data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/dashboard" routerLinkActive="active">
                <i class="fas fa-tachometer-alt me-1"></i>Dashboard
              </a>
            </li>
            <li class="nav-item" *ngIf="authService.isAdmin()">
              <a class="nav-link" routerLink="/customers" routerLinkActive="active">
                <i class="fas fa-users me-1"></i>Customers
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/products" routerLinkActive="active">
                <i class="fas fa-box me-1"></i>Products
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/orders" routerLinkActive="active">
                <i class="fas fa-shopping-bag me-1"></i>Orders
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/invoices" routerLinkActive="active">
                <i class="fas fa-file-invoice me-1"></i>Invoices
              </a>
            </li>
          </ul>
          
          <ul class="navbar-nav" *ngIf="currentUser$ | async as user">
            <li class="nav-item">
              <span class="navbar-text me-3">
                <i class="fas fa-user me-1"></i>
                {{ user.username }} ({{ user.role }})
              </span>
            </li>
            <li class="nav-item">
              <button class="btn btn-outline-light btn-sm" (click)="logout()">
                <i class="fas fa-sign-out-alt me-1"></i>Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar-brand {
      font-weight: bold;
      font-size: 1.5rem;
    }
    .nav-link.active {
      background-color: rgba(255,255,255,0.1);
      border-radius: 4px;
    }
  `]
})
export class NavbarComponent {
  currentUser$: Observable<User | null>;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}