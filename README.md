# Order Management System (OMS) - Angular Frontend

A comprehensive Order Management System built with Angular 17+, featuring JWT authentication, role-based access control, and modern UI components.

## 🚀 Features

### Authentication & Authorization

- JWT-based authentication
- Role-based access control (Admin/Customer)
- Secure API interceptors
- Auto token management

### Core Functionality

- **Customer Management**: Create, view, and manage customers
- **Product Catalog**: Browse products with filtering and sorting
- **Order Management**: Create orders, approve orders, track status
- **Invoice System**: Auto-generated invoices with tax calculations
- **Dashboard**: Overview of system statistics and quick actions

### Technical Features

- Responsive design with Bootstrap
- Lazy loading for optimal performance
- Error handling and validation
- Modern Angular architecture with standalone components
- TypeScript for type safety

## 🛠️ Technology Stack

- **Frontend**: Angular 17+
- **UI Framework**: Bootstrap 5 + ng-bootstrap
- **Icons**: Font Awesome 6
- **HTTP Client**: Angular HttpClient with interceptors
- **Routing**: Angular Router with guards
- **State Management**: RxJS Observables
- **Build Tool**: Angular CLI

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (v17 or higher)

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd oms-angular-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   - Update `src/environments/environment.ts` with your API URL
   - Default API URL: `http://localhost:8080/api`

4. **Start the development server**

   ```bash
   ng serve
   ```

5. **Open your browser**
   - Navigate to `http://localhost:4200`

## 🏗️ Project Structure

```
src/
├── app/
│   ├── core/                    # Core services and models
│   │   ├── guards/             # Route guards
│   │   ├── interceptors/       # HTTP interceptors
│   │   ├── models/             # TypeScript interfaces
│   │   └── services/           # API services
│   ├── features/               # Feature modules
│   │   ├── auth/               # Authentication
│   │   ├── customers/          # Customer management
│   │   ├── dashboard/          # Dashboard
│   │   ├── invoices/           # Invoice management
│   │   ├── orders/             # Order management
│   │   └── products/           # Product catalog
│   ├── shared/                 # Shared components
│   │   └── components/         # Reusable components
│   ├── app.component.*         # Root component
│   ├── app.config.ts           # App configuration
│   └── app.routes.ts           # Route configuration
├── environments/               # Environment configs
└── styles.scss                 # Global styles
```

## 🔐 Authentication

### Login Credentials

**Admin User:**

- Username: `admin`
- Password: `admin123`

**Test Customer:**

- Username: `john.doe`
- Password: `customer123`

### Route Protection

- **Public Routes**: `/login`
- **Protected Routes**: All other routes require authentication
- **Admin Routes**: Customer management, order creation require admin role

## 📱 Features Overview

### Dashboard

- System statistics overview
- Quick action buttons
- Order status visualization
- System information

### Customer Management (Admin Only)

- View paginated customer list
- Add new customers
- Customer details and order history
- Delete customers

### Product Catalog

- Browse products with pagination
- Filter and sort products
- Add new products (Admin)
- Stock quantity tracking
- Category-based organization

### Order Management

- View all orders with status
- Create new orders (Admin)
- Order approval workflow
- Order details with line items
- Customer order history

### Invoice System

- Auto-generated invoices on order approval
- Tax calculation
- Invoice details view
- Download/print functionality (placeholder)

## 🌐 API Integration

The application integrates with a Spring Boot backend API with the following endpoints:

### Authentication

- `POST /v1/auth/login` - User login

### Products

- `GET /v1/products` - Get products (paginated, filtered, sorted)
- `GET /v1/products/{id}` - Get product by ID
- `POST /v1/products` - Create product
- `DELETE /v1/products/{id}` - Delete product

### Customers

- `GET /v1/customers` - Get customers (paginated)
- `GET /v1/customers/{id}` - Get customer by ID
- `POST /v1/customers` - Create customer
- `DELETE /v1/customers/{id}` - Delete customer

### Orders

- `GET /v1/orders` - Get orders (paginated)
- `GET /v1/orders/{id}` - Get order by ID
- `POST /v1/orders` - Create order
- `PUT /v1/orders/{id}/approve` - Approve order
- `GET /v1/orders/customer/{id}` - Get customer orders

### Invoices

- `GET /v1/invoices` - Get invoices (paginated)
- `GET /v1/invoices/{id}` - Get invoice by ID
- `GET /v1/invoices/order/{id}` - Get order invoice

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface with Bootstrap
- **Loading States**: Spinner components for better UX
- **Error Handling**: User-friendly error messages
- **Form Validation**: Client-side validation with feedback
- **Modal Dialogs**: Smooth modal interactions
- **Status Badges**: Color-coded status indicators
- **Pagination**: Efficient data browsing
- **Search & Filter**: Enhanced data discovery
