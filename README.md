# PaaSmart Admin Panel

PaaSmart Admin Panel is an administrative application built with React Native and Expo for managing the PaaSmart e-commerce and multi-tenant platform.

The admin panel communicates with the PaaSmart Spring Boot backend through REST APIs and provides administrative tools for managing shops, users, orders, coupons, delivery pricing, and tenants.

##  Tech Stack

- React Native
- Expo
- Expo Router
- TypeScript
- React 19
- React Native 0.86
- Expo SDK 57
- AsyncStorage
- React Native Web
- REST API
- PaaSmart Spring Boot Backend

##  Features

### Dashboard
- Platform overview
- Order statistics
- Administrative information

### Shop Management
- View shops
- Review pending shops
- Approve shops
- Reject shops
- Suspend shops

### User Management
- View users
- Block users
- Unblock users

### Order Management
- View orders
- Monitor order information
- Review order status

### Coupon Management
- View coupons
- Create coupons
- Deactivate coupons

### Delivery Settings
- View delivery pricing
- Update base delivery fee
- Update per-kilometer delivery fee

### Multi-Tenant Management
- View tenants
- Create tenants
- Activate tenants
- Suspend tenants
- Create tenant administrators

##  Backend

The Admin Panel communicates with the PaaSmart backend API.

Production backend:

https://paasmart-backend.onrender.com

API endpoints are organized under:

`/api/v1`

##  Configuration

The application uses a configurable backend API URL.

For local development, the application can point to the local backend.

For production, it should use:

`https://paasmart-backend.onrender.com`

Do not store passwords, API secrets, private keys, database credentials, or other sensitive information in the repository.

##  Project Structure

```text
paasmart-admin-app/
├── assets/
├── src/
│   ├── api/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── screens/
│   ├── theme/
│   └── utils/
├── app.json
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md