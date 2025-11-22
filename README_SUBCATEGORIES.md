# Sub-Categories Feature

## Overview
This feature adds support for sub-categories in the PIMS system, allowing for more granular organization of materials and products.

## Backend Implementation

### Database Schema
- Added `sub_categories` table with the following fields:
  - `id`: Primary key
  - `code`: Unique code for the sub-category
  - `name`: Name of the sub-category
  - `categoryId`: Foreign key referencing the categories table
  - `createdAt`: Timestamp of creation
  - `updatedAt`: Timestamp of last update

### API Endpoints
- `GET /api/sub-categories` - Get all sub-categories
- `GET /api/sub-categories/:id` - Get a specific sub-category
- `POST /api/sub-categories` - Create a new sub-category
- `PUT /api/sub-categories/:id` - Update a sub-category
- `DELETE /api/sub-categories/:id` - Delete a sub-category

### Models
- `SubCategory.js` - Model for sub-category operations

### Controllers
- `subCategoryController.js` - Controller for sub-category operations

### Routes
- `subCategories.js` - Route definitions for sub-categories

## Frontend Implementation

### Components
- `sub-categories-list.tsx` - List view for sub-categories
- `sub-category-form.tsx` - Form for creating/editing sub-categories

### Types
- Added `SubCategory` interface to `types/index.ts`

### Routing
- Added routes for sub-categories in `App.tsx`

### Navigation
- Added "Sub Categories" tab to the sidebar navigation

## Database Migration
To create the sub-categories table, run:
```bash
npm run migrate
```

## Usage
1. Navigate to the "Sub Categories" tab in the sidebar
2. Click "Add Sub-Category" to create a new sub-category
3. Select a parent category from the dropdown
4. Enter the sub-category name
5. Save the sub-category

The sub-category will appear in the list with its code, name, and parent category.