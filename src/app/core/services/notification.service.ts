import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timeout?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<NotificationMessage[]>([]);
  
  get notifications() {
    return this.notifications$.asObservable();
  }

  showSuccess(title: string, message: string, timeout: number = 5000): void {
    this.addNotification('success', title, message, timeout);
  }

  showError(title: string, message: string, timeout: number = 8000): void {
    this.addNotification('error', title, message, timeout);
  }

  showWarning(title: string, message: string, timeout: number = 6000): void {
    this.addNotification('warning', title, message, timeout);
  }

  showInfo(title: string, message: string, timeout: number = 5000): void {
    this.addNotification('info', title, message, timeout);
  }

  private addNotification(type: NotificationMessage['type'], title: string, message: string, timeout: number): void {
    const notification: NotificationMessage = {
      id: this.generateId(),
      type,
      title,
      message,
      timeout
    };

    const currentNotifications = this.notifications$.value;
    this.notifications$.next([...currentNotifications, notification]);

    if (timeout > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, timeout);
    }
  }

  removeNotification(id: string): void {
    const currentNotifications = this.notifications$.value;
    this.notifications$.next(currentNotifications.filter(n => n.id !== id));
  }

  clearAll(): void {
    this.notifications$.next([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Helper method to extract error message from API response
  extractErrorMessage(error: any): string {
    // Handle structured API error responses (like from Postman collection)
    if (error?.error?.message) {
      let message = error.error.message;
      
      // Add suggestion if available (for constraint violations like delete conflicts)
      if (error.error.suggestion) {
        message += `\n\nSuggestion: ${error.error.suggestion}`;
      }
      
      // Add error code if available
      if (error.error.errorCode) {
        message += `\n\nError Code: ${error.error.errorCode}`;
      }
      
      return message;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (typeof error?.error === 'string') {
      return error.error;
    }
    
    return 'An unexpected error occurred';
  }

  // Helper method specifically for delete operation errors
  extractDeleteErrorMessage(error: any, itemType: string): string {
    const baseMessage = this.extractErrorMessage(error);
    
    // Handle specific constraint violation errors
    if (error?.error?.errorCode === 'PRODUCT_IN_USE') {
      return `Cannot delete ${itemType} - it is used in existing orders.\n\nSuggestion: Items that have been ordered cannot be deleted to maintain order history integrity.`;
    }
    
    if (error?.error?.errorCode === 'CUSTOMER_HAS_ORDERS') {
      return `Cannot delete ${itemType} - customer has existing orders.\n\nSuggestion: Customers with order history cannot be deleted to maintain data integrity.`;
    }
    
    if (error?.error?.status === 409 || error?.status === 409) {
      return `Cannot delete ${itemType} - it is referenced by other records.\n\nSuggestion: Please ensure the ${itemType} is not being used elsewhere before deletion.`;
    }
    
    return baseMessage;
  }
}