import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService, NotificationMessage } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div 
        *ngFor="let notification of notifications" 
        class="notification alert"
        [class.alert-success]="notification.type === 'success'"
        [class.alert-danger]="notification.type === 'error'"
        [class.alert-warning]="notification.type === 'warning'"
        [class.alert-info]="notification.type === 'info'"
        role="alert"
      >
        <div class="d-flex align-items-start">
          <div class="notification-icon me-2">
            <i class="fas" 
               [class.fa-check-circle]="notification.type === 'success'"
               [class.fa-exclamation-circle]="notification.type === 'error'"
               [class.fa-exclamation-triangle]="notification.type === 'warning'"
               [class.fa-info-circle]="notification.type === 'info'">
            </i>
          </div>
          <div class="notification-content flex-grow-1">
            <div class="notification-title fw-bold">{{ notification.title }}</div>
            <div class="notification-message">{{ notification.message }}</div>
          </div>
          <button 
            type="button" 
            class="btn-close" 
            (click)="removeNotification(notification.id)"
            aria-label="Close">
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
      width: 100%;
    }

    .notification {
      margin-bottom: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: none;
      border-radius: 8px;
      animation: slideIn 0.3s ease-out;
    }

    .notification-icon {
      font-size: 1.2em;
    }

    .notification-title {
      font-size: 0.95em;
      margin-bottom: 2px;
    }

    .notification-message {
      font-size: 0.85em;
      opacity: 0.9;
    }

    .btn-close {
      font-size: 0.8em;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 576px) {
      .notification-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: NotificationMessage[] = [];
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notifications
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }
}