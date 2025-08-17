import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject.asObservable();

  handleError(error: any): void {
    let errorMessage = 'An unknown error occurred';

    if (error instanceof HttpErrorResponse) {
      // HTTP error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = `HTTP Error ${error.status}: ${error.statusText}`;
      }
    } else if (error instanceof Error) {
      // JavaScript error
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      // String error
      errorMessage = error;
    }

    console.error('Error occurred:', error);
    this.errorSubject.next(errorMessage);
  }

  clearError(): void {
    this.errorSubject.next(null);
  }

  getCurrentError(): string | null {
    return this.errorSubject.value;
  }
}