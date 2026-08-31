# Bexo BD - API Reference Documentation

## Overview

This document describes all API endpoints, authentication methods, and data models used in Bexo BD.

**Base URL:** `https://your-domain.com/api`  
**Authentication:** Supabase Auth JWT token  
**Rate Limit:** 100 requests/minute per user

---

## Authentication

### How It Works

1. User logs in via `/auth/login`
2. Supabase returns a session with JWT token
3. JWT token is automatically included in requests via Authorization header
4. Token refreshes automatically when expiring

### JWT Token Format

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Token Expiration

- Access token: 1 hour
- Refresh token: 7 days
- Token auto-refreshes on next API call (transparent to user)

---

## Auth Endpoints

### POST /auth/login

**Description:** Authenticate user with email/phone and password

**Request:**
```json
{
  "identifier": "user@example.com",  // email or phone
  "password": "SecurePassword123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "12345",
    "email": "user@example.com",
    "created_at": "2026-08-30T10:00:00Z"
  },
  "profile": {
    "id": "12345",
    "email": "user@example.com",
    "fullName": "আব্দুল করিম",
    "shopName": "করিম এন্টারপ্রাইজেস",
    "phone": "01812345678",
    "balance": 50000,
    "role": "user"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "লগইন ব্যর্থ: অ্যাকাউন্ট পাওয়া যায়নি বা পাসওয়ার্ড ভুল"
}
```

**HTTP Status:**
- `200` — Login successful
- `401` — Invalid credentials
- `429` — Too many attempts (rate limited)
- `500` — Server error

**Security Notes:**
- ✅ Password verified server-side only
- ✅ No password returned in response
- ✅ Session stored securely in httpOnly cookie
- ✅ HTTPS required

---

### POST /auth/register

**Description:** Create new user account

**Request:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123",
  "fullName": "করিম আহমেদ",
  "shopName": "আহমেদ সেলস",
  "phone": "01812345678",
  "address": "ঢাকা, বাংলাদেশ"
}
```

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "67890",
    "email": "newuser@example.com"
  },
  "needsEmailConfirmation": true,
  "message": "ইমেইল নিশ্চিত করতে লিংকে ক্লিক করুন"
}
```

**Validation Rules:**
- Email: Valid email format required
- Password: Min 8 chars, must include letter + number + special char
- Full Name: Min 2 characters
- Shop Name: Min 2 characters
- Phone: Valid Bangladesh phone number
- Address: Min 5 characters

**HTTP Status:**
- `201` — Account created
- `400` — Validation error
- `409` — Email already registered
- `429` — Too many registration attempts

**Post-Registration Flow:**
1. Auth account created in Supabase Auth
2. Confirmation email sent to user
3. User clicks link in email
4. Profile automatically synced
5. User can now log in

---

### POST /auth/logout

**Description:** Sign out user and invalidate session

**Request:**
```json
{}
```

**Response:**
```json
{
  "success": true,
  "message": "লগআউট সফল"
}
```

**Cleanup:**
- Session terminated
- JWT token invalidated
- Local storage cleared
- Realtime subscriptions closed

---

### POST /auth/forgot-password

**Description:** Request password reset email

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "পাসওয়ার্ড রিসেট লিংক ইমেইলে পাঠানো হয়েছে"
}
```

**Note:** Email sent even if user doesn't exist (security measure)

---

### POST /auth/reset-password

**Description:** Reset password using token from email

**Request:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "NewPassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে"
}
```

---

## Profile Endpoints

### GET /profile

**Description:** Get current user's profile

**Headers:**
```
Authorization: Bearer [JWT_TOKEN]
```

**Response:**
```json
{
  "id": "12345",
  "email": "user@example.com",
  "fullName": "করিম আহমেদ",
  "shopName": "আহমেদ সেলস",
  "phone": "01812345678",
  "address": "ঢাকা, বাংলাদেশ",
  "profileImage": "https://cdn.example.com/profile/12345.jpg",
  "balance": 50000,
  "role": "user",
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-08-30T10:00:00Z"
}
```

**HTTP Status:**
- `200` — Profile found
- `401` — Not authenticated
- `404` — Profile not found

---

### PUT /profile

**Description:** Update user profile

**Headers:**
```
Authorization: Bearer [JWT_TOKEN]
Content-Type: application/json
```

**Request:**
```json
{
  "fullName": "করিম আহমেদ সাহেব",
  "shopName": "আহমেদ ইন্টারন্যাশনাল সেলস",
  "phone": "01912345678",
  "address": "চট্টগ্রাম, বাংলাদেশ"
}
```

**Response:**
```json
{
  "success": true,
  "profile": {
    "id": "12345",
    "fullName": "করিম আহমেদ সাহেব",
    "shopName": "আহমেদ ইন্টারন্যাশনাল সেলস",
    "phone": "01912345678",
    "address": "চট্টগ্রাম, বাংলাদেশ",
    "updatedAt": "2026-08-30T10:15:00Z"
  }
}
```

**Updates Synced:** Changes appear on all devices within 2 seconds via Realtime

---

### POST /profile/upload-image

**Description:** Upload profile picture

**Headers:**
```
Authorization: Bearer [JWT_TOKEN]
Content-Type: multipart/form-data
```

**Request:**
```
Form Data:
- file: [image file, max 5MB, formats: jpg, png, webp]
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://cdn.example.com/profile/12345-1234567890.jpg",
  "profile": {
    "profileImage": "https://cdn.example.com/profile/12345-1234567890.jpg"
  }
}
```

**Validation:**
- Max size: 5 MB
- Allowed formats: JPEG, PNG, WebP
- Image auto-compressed to 800x800
- Old image deleted automatically

---

## Product Endpoints

### GET /products

**Description:** List user's products with pagination and filtering

**Headers:**
```
Authorization: Bearer [JWT_TOKEN]
```

**Query Parameters:**
```
?page=1&limit=20&status=active&category=Electronics&search=laptop
```

**Response:**
```json
{
  "success": true,
  "products": [
    {
      "id": "prod-123",
      "name": "ল্যাপটপ - Dell XPS 13",
      "description": "উচ্চ কর্মক্ষমতা সম্পন্ন ল্যাপটপ",
      "price": 120000,
      "originalPrice": 150000,
      "image": "https://cdn.example.com/products/prod-123.jpg",
      "images": ["image1.jpg", "image2.jpg"],
      "category": "Electronics",
      "quantity": 5,
      "sku": "DELL-XPS-13-001",
      "status": "active",
      "createdAt": "2026-08-25T10:00:00Z",
      "updatedAt": "2026-08-30T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

**HTTP Status:**
- `200` — Products found
- `401` — Not authenticated
- `400` — Invalid query parameters

---

### POST /products

**Description:** Create new product

**Headers:**
```
Authorization: Bearer [JWT_TOKEN]
Content-Type: application/json
```

**Request:**
```json
{
  "name": "ল্যাপটপ - Dell XPS 13",
  "description": "উচ্চ কর্মক্ষমতা সম্পন্ন ল্যাপটপ, নতুন অবস্থা",
  "price": 120000,
  "originalPrice": 150000,
  "category": "Electronics",
  "quantity": 5,
  "sku": "DELL-XPS-13-001",
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "product": {
    "id": "prod-456",
    "name": "ল্যাপটপ - Dell XPS 13",
    "price": 120000,
    "createdAt": "2026-08-30T11:00:00Z"
  }
}
```

**Validation:**
- Name: Min 5 characters
- Price: 0 < price ≤ 10,000,000 BDT
- Category: Must be valid category
- Quantity: ≥ 1
- SKU: Must be unique per user

**HTTP Status:**
- `201` — Product created
- `400` — Validation error
- `401` — Not authenticated
- `409` — SKU already exists

---

### PUT /products/:productId

**Description:** Update existing product

**Request:**
```json
{
  "name": "ল্যাপটপ - Dell XPS 13 Pro",
  "price": 125000,
  "quantity": 3,
  "status": "active"
}
```

**Response:**
```json
{
  "success": true,
  "product": {
    "id": "prod-456",
    "name": "ল্যাপটপ - Dell XPS 13 Pro",
    "price": 125000,
    "updatedAt": "2026-08-30T11:15:00Z"
  }
}
```

**Note:** Only product owner can edit

---

### DELETE /products/:productId

**Description:** Delete product

**Response:**
```json
{
  "success": true,
  "message": "পণ্য মুছে ফেলা হয়েছে"
}
```

**Note:** Soft delete (archive), not permanent removal

---

### POST /products/:productId/upload-image

**Description:** Upload product image

**Request:**
```
Form Data:
- file: [image file, max 10MB]
```

**Response:**
```json
{
  "success": true,
  "imageUrl": "https://cdn.example.com/products/prod-456-img-001.jpg"
}
```

---

## Admin Endpoints

### GET /admin/users

**Description:** List all users (admin only)

**Headers:**
```
Authorization: Bearer [ADMIN_JWT_TOKEN]
```

**Query Parameters:**
```
?page=1&limit=50&role=user&status=active&search=email
```

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "id": "user-123",
      "email": "user@example.com",
      "fullName": "করিম আহমেদ",
      "role": "user",
      "status": "active",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "total": 1250,
    "pages": 25
  }
}
```

**HTTP Status:**
- `200` — Users fetched
- `401` — Not authenticated
- `403` — Not admin

---

### PUT /admin/users/:userId/role

**Description:** Change user role (admin only)

**Request:**
```json
{
  "role": "collector"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "role": "collector"
  }
}
```

**Valid Roles:** `user`, `collector`, `admin`

---

### GET /admin/reports/sales

**Description:** Get sales analytics (admin only)

**Query Parameters:**
```
?startDate=2026-08-01&endDate=2026-08-31&groupBy=daily
```

**Response:**
```json
{
  "success": true,
  "report": {
    "period": "2026-08-01 to 2026-08-31",
    "totalSales": 5000000,
    "totalOrders": 250,
    "totalUsers": 120,
    "avgOrderValue": 20000,
    "data": [
      {
        "date": "2026-08-01",
        "sales": 150000,
        "orders": 8
      }
    ]
  }
}
```

---

## Error Responses

### Standard Error Format

```json
{
  "success": false,
  "error": "Error message in Bengali",
  "code": "ERROR_CODE",
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

### Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `AUTH_INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `AUTH_EMAIL_NOT_CONFIRMED` | 401 | Email not verified yet |
| `AUTH_EMAIL_EXISTS` | 409 | Email already registered |
| `PROFILE_NOT_FOUND` | 404 | User profile missing |
| `PRODUCT_NOT_FOUND` | 404 | Product not found |
| `PERMISSION_DENIED` | 403 | Not authorized |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `DATABASE_ERROR` | 500 | Database connection error |
| `UNKNOWN_ERROR` | 500 | Unexpected server error |

---

## Rate Limiting

**Current Limits:**
- Auth endpoints: 5 requests/minute per IP
- API endpoints: 100 requests/minute per user
- Upload endpoints: 10 requests/minute per user

**Response Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1630339200
```

**When Limit Exceeded:**
```json
{
  "success": false,
  "error": "অনেক বেশি অনুরোধ পাঠানো হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।",
  "retryAfter": 60
}
```

---

## Data Models

### User Model

```typescript
interface User {
  id: string;                  // UUID from Supabase Auth
  email: string;               // Unique, lowercase
  phone?: string;              // Bangladesh format
  emailConfirmed: boolean;     // true after email verification
  createdAt: ISO8601;          // Account creation time
  updatedAt: ISO8601;          // Last update time
}
```

### Profile Model

```typescript
interface Profile {
  id: string;                  // Same as user.id
  email: string;               // From user table
  fullName: string;            // Display name
  shopName: string;            // Business name
  phone?: string;              // Contact number
  address?: string;            // Physical address
  profileImage?: string;       // Avatar URL
  balance: number;             // Account balance in BDT
  role: 'user' | 'collector' | 'admin';
  createdAt: ISO8601;
  updatedAt: ISO8601;
}
```

### Product Model

```typescript
interface Product {
  id: string;                  // UUID
  userId: string;              // Owner's ID
  name: string;                // Product name
  description?: string;        // Detailed description
  price: number;               // Current price in BDT
  originalPrice?: number;      // Original/list price
  image?: string;              // Main image URL
  images?: string[];           // Additional images
  category: string;            // Product category
  quantity: number;            // Stock count
  sku?: string;                // Stock keeping unit
  status: 'active' | 'inactive' | 'archived';
  createdAt: ISO8601;
  updatedAt: ISO8601;
}
```

---

## Pagination

### Query Parameters

```
?page=1&limit=20&sort=createdAt&order=desc
```

### Response

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 250,
    "pages": 13,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Defaults

- Default page: 1
- Default limit: 20
- Max limit: 100
- Valid sort fields: `createdAt`, `updatedAt`, `name`, `price`

---

## Filtering

### Examples

**Filter by status:**
```
/products?status=active
```

**Filter by date range:**
```
/products?createdAfter=2026-08-01&createdBefore=2026-08-31
```

**Filter by price range:**
```
/products?priceMin=1000&priceMax=100000
```

**Multiple filters:**
```
/products?status=active&category=Electronics&priceMin=50000
```

---

## Webhooks (Future)

Webhooks will be available for:
- `product.created`
- `product.updated`
- `product.deleted`
- `order.created`
- `user.created`
- `user.updated`

Configuration will be available in Admin Panel.

---

## SDK/Client Libraries

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Example: Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});

// Example: Fetch products
const { data: products } = await supabase
  .from('bexo_products')
  .select('*')
  .eq('status', 'active')
  .limit(20);
```

### REST Calls

```bash
# Login
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"user@example.com","password":"password123"}'

# Get profile
curl -H "Authorization: Bearer JWT_TOKEN" \
  https://your-domain.com/api/profile

# Create product
curl -X POST https://your-domain.com/api/products \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Product","price":10000,"quantity":5}'
```

---

## Best Practices

### Authentication
- ✅ Always include JWT token in Authorization header
- ✅ Handle token expiration and refresh automatically
- ✅ Never expose refresh tokens to frontend
- ✅ Use HTTPS only (never HTTP)

### Data
- ✅ Validate all input on frontend and backend
- ✅ Sanitize data before storage
- ✅ Use pagination for large datasets
- ✅ Cache data locally when possible

### Performance
- ✅ Use specific field selects (not `select('*')`)
- ✅ Add indexes to frequently queried columns
- ✅ Implement caching for read-heavy operations
- ✅ Use batch operations for bulk updates

### Security
- ✅ Check permissions before every operation
- ✅ Log admin actions for audit trail
- ✅ Use rate limiting on sensitive endpoints
- ✅ Validate file uploads (type, size, content)

---

## Support & Debugging

### Enable Debug Logging

```typescript
// In src/utils/logging.ts
logger.debug('[API]', 'Request:', { method, url, headers });
logger.debug('[API]', 'Response:', { status, data });
```

### Common Issues

**"401 Unauthorized"**
- Token expired or invalid
- Include Authorization header
- Check token format

**"403 Forbidden"**
- User doesn't have permission
- Check user role
- Verify RLS policies

**"429 Too Many Requests"**
- Rate limited
- Wait `retryAfter` seconds
- Implement exponential backoff

---

**API Version:** 1.0  
**Last Updated:** August 30, 2026  
**Status:** ✅ Production Ready
