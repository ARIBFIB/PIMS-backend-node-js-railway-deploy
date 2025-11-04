# ProdX Backend API Reference

Base URL: `http://localhost:4000/api`

---

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "staff"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "staff"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### GET /auth/profile
Get current user profile (Protected).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "staff",
    "created_at": "2025-11-01T10:00:00.000Z"
  }
}
```

---

## Inventory

### GET /inventory
Get all inventory items with pagination and filtering.

**Query Parameters:**
- `page` (number, default: 0) - Page number
- `size` (number, default: 10) - Items per page
- `search` (string) - Search in name and description
- `category` (string) - Filter by category

**Example:** `GET /inventory?page=0&size=10&category=Electronics&search=test`

**Response (200):**
```json
{
  "success": true,
  "message": "Inventory items retrieved successfully",
  "data": {
    "totalItems": 25,
    "items": [
      {
        "id": 1,
        "name": "Test Item",
        "description": "Description",
        "quantity": 100,
        "unit": "pcs",
        "category": "Electronics",
        "location": "Warehouse A",
        "min_stock_level": 20,
        "price": "29.99",
        "created_at": "2025-11-01T10:00:00.000Z"
      }
    ],
    "totalPages": 3,
    "currentPage": 0
  }
}
```

### GET /inventory/:id
Get inventory item by ID.

**Response (200):**
```json
{
  "success": true,
  "message": "Inventory item retrieved successfully",
  "data": {
    "id": 1,
    "name": "Test Item",
    "quantity": 100,
    "unit": "pcs",
    "category": "Electronics",
    "price": "29.99"
  }
}
```

### GET /inventory/categories
Get distinct inventory categories.

**Response (200):**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": ["Electronics", "Raw Materials", "Tools"]
}
```

### GET /inventory/low-stock
Get items below minimum stock level.

**Response (200):**
```json
{
  "success": true,
  "message": "Low stock items retrieved successfully",
  "data": [
    {
      "id": 5,
      "name": "Item Low Stock",
      "quantity": 5,
      "min_stock_level": 10
    }
  ]
}
```

### POST /inventory
Create new inventory item (Admin/Staff only).

**Request Body:**
```json
{
  "name": "New Item",
  "description": "Item description",
  "quantity": 100,
  "unit": "pcs",
  "category": "Electronics",
  "location": "Warehouse A",
  "minStockLevel": 20,
  "price": 29.99
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Inventory item created successfully",
  "data": {
    "id": 1,
    "name": "New Item",
    ...
  }
}
```

### PUT /inventory/:id
Update inventory item (Admin/Staff only).

**Request Body:** Same as POST

**Response (200):**
```json
{
  "success": true,
  "message": "Inventory item updated successfully",
  "data": { ... }
}
```

### DELETE /inventory/:id
Delete inventory item (Admin only).

**Response (200):**
```json
{
  "success": true,
  "message": "Inventory item deleted successfully"
}
```

---

## Production (Work Orders)

### GET /production
Get all work orders with pagination and filtering.

**Query Parameters:**
- `page` (number, default: 0)
- `size` (number, default: 10)
- `status` (string) - Filter by status (pending/in_progress/completed/cancelled)
- `assignedTo` (number) - Filter by assigned user ID

**Response (200):**
```json
{
  "success": true,
  "message": "Work orders retrieved successfully",
  "data": {
    "totalItems": 10,
    "items": [
      {
        "id": 1,
        "title": "Work Order Title",
        "description": "Description",
        "priority": "high",
        "assigned_to": 2,
        "assigned_to_name": "John Doe",
        "due_date": "2025-12-31",
        "status": "in_progress",
        "created_at": "2025-11-01T10:00:00.000Z"
      }
    ],
    "totalPages": 1,
    "currentPage": 0
  }
}
```

### GET /production/:id
Get work order by ID with associated inventory items.

**Response (200):**
```json
{
  "success": true,
  "message": "Work order retrieved successfully",
  "data": {
    "id": 1,
    "title": "Work Order Title",
    "priority": "high",
    "status": "in_progress",
    "items": [
      {
        "id": 1,
        "inventory_name": "Test Item",
        "quantity": 10,
        "unit": "pcs"
      }
    ]
  }
}
```

### GET /production/calendar
Get work orders for calendar view.

**Query Parameters:**
- `startDate` (required) - Start date (YYYY-MM-DD)
- `endDate` (required) - End date (YYYY-MM-DD)

**Example:** `GET /production/calendar?startDate=2025-01-01&endDate=2025-12-31`

**Response (200):**
```json
{
  "success": true,
  "message": "Calendar data retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Work Order",
      "due_date": "2025-12-31",
      "status": "pending",
      "priority": "high"
    }
  ]
}
```

### POST /production
Create work order (Admin/Staff only).

**Request Body:**
```json
{
  "title": "New Work Order",
  "description": "Description",
  "priority": "high",
  "assignedTo": 2,
  "dueDate": "2025-12-31",
  "status": "pending",
  "inventoryItems": [
    {
      "inventoryId": 1,
      "quantity": 10
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Work order created successfully",
  "data": { ... }
}
```

### PUT /production/:id
Update work order (Admin/Staff only).

**Request Body:** Same as POST

**Response (200):**
```json
{
  "success": true,
  "message": "Work order updated successfully",
  "data": { ... }
}
```

### DELETE /production/:id
Delete work order (Admin only).

**Response (200):**
```json
{
  "success": true,
  "message": "Work order deleted successfully"
}
```

---

## Analytics

### GET /analytics/summary
Get dashboard summary with inventory and work order statistics.

**Response (200):**
```json
{
  "success": true,
  "message": "Analytics summary retrieved successfully",
  "data": {
    "inventory": {
      "totalItems": 25,
      "totalQuantity": 1500,
      "totalValue": "45000.00",
      "lowStockCount": 3
    },
    "workOrders": {
      "total": 50,
      "completed": 30,
      "inProgress": 15,
      "pending": 5
    },
    "production": [
      {
        "date": "2025-11-01",
        "orders_count": 5
      }
    ],
    "categories": [
      {
        "category": "Electronics",
        "items_count": 10,
        "total_quantity": 500,
        "total_value": 15000
      }
    ]
  }
}
```

### GET /analytics/production-trend
Get production trend data.

**Query Parameters:**
- `days` (number, default: 30) - Number of days to retrieve

**Response (200):**
```json
{
  "success": true,
  "message": "Production trend retrieved successfully",
  "data": [
    {
      "date": "2025-11-01",
      "orders_count": 5,
      "completed_count": 3
    }
  ]
}
```

### GET /analytics/inventory-value
Get inventory value grouped by category.

**Response (200):**
```json
{
  "success": true,
  "message": "Inventory value by category retrieved successfully",
  "data": [
    {
      "category": "Electronics",
      "value": 15000
    }
  ]
}
```

---

## Users (Admin Only)

### GET /users
Get all users with pagination.

**Query Parameters:**
- `page` (number, default: 0)
- `size` (number, default: 10)

**Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "totalItems": 5,
    "items": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "role": "admin",
        "created_at": "2025-11-01T10:00:00.000Z"
      }
    ],
    "totalPages": 1,
    "currentPage": 0
  }
}
```

### GET /users/:id
Get user by ID.

**Response (200):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

### PUT /users/:id
Update user.

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "john.smith@example.com",
  "role": "staff"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": { ... }
}
```

### DELETE /users/:id
Delete user.

**Response (200):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Server error",
  "error": "Detailed error (development only)"
}
```

---

## Role-Based Access Control

| Endpoint | Viewer | Staff | Admin |
|----------|--------|-------|-------|
| Auth endpoints | ✅ | ✅ | ✅ |
| GET Inventory | ✅ | ✅ | ✅ |
| POST/PUT Inventory | ❌ | ✅ | ✅ |
| DELETE Inventory | ❌ | ❌ | ✅ |
| GET Work Orders | ✅ | ✅ | ✅ |
| POST/PUT Work Orders | ❌ | ✅ | ✅ |
| DELETE Work Orders | ❌ | ❌ | ✅ |
| Analytics | ✅ | ✅ | ✅ |
| User Management | ❌ | ❌ | ✅ |

---

## Data Enums

### User Roles
- `admin` - Full access
- `staff` - Create/update access
- `viewer` - Read-only access

### Work Order Status
- `pending` - Not started
- `in_progress` - Currently working
- `completed` - Finished
- `cancelled` - Cancelled

### Work Order Priority
- `low`
- `medium`
- `high`
- `urgent`
