# Wifey Account APIs - Postman Collection

This Postman collection contains all the APIs used in the account page tabs of the Wifey application. This documentation will help mobile developers integrate these endpoints into their mobile application.

## 📋 Table of Contents
- [Import Instructions](#import-instructions)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [API Endpoints by Tab](#api-endpoints-by-tab)
- [Data Models](#data-models)
- [Error Handling](#error-handling)

## 🚀 Import Instructions

1. Open Postman
2. Click on **Import** button (top left)
3. Select the `Account_APIs_Collection.json` file
4. The collection will be imported with all endpoints organized by feature

## 🔧 Environment Variables

Before using the collection, set up these environment variables in Postman:

| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | Base URL of the API server | `http://localhost:3000` or `https://your-production-url.com` |
| `user_email` | Email of the authenticated user | `user@example.com` |

### How to Set Environment Variables:
1. Click on **Environments** in Postman
2. Create a new environment (e.g., "Wifey Development")
3. Add the variables listed above
4. Select the environment from the dropdown in the top right

## 🔐 Authentication

Most endpoints require user authentication. The application uses **NextAuth.js** for authentication. 

### For Mobile App Integration:
- Implement session-based authentication or JWT tokens
- Include authentication headers in all requests
- Handle session expiry and refresh tokens appropriately

**Note:** The current web implementation uses session cookies. For mobile apps, you may need to:
1. Implement a token-based authentication system
2. Add an `Authorization` header to all requests
3. Coordinate with the backend team to support mobile authentication

## 📱 API Endpoints by Tab

### 1. **Info Tab** - User Profile Management

#### Get User Profile
```
GET /api/user/profile?email={{user_email}}
```
**Response:**
```json
{
  "success": true,
  "user": {
    "username": "JaneDoe",
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "imageURL": "https://example.com/image.jpg",
    "birthDate": "1995-05-15T00:00:00.000Z",
    "weddingDate": "2026-06-20T00:00:00.000Z"
  }
}
```

#### Update User Profile
```
PUT /api/user/profile
```
**Request Body:**
```json
{
  "email": "jane@example.com",
  "username": "JaneDoe",
  "firstName": "Jane",
  "lastName": "Doe",
  "imageURL": "https://example.com/image.jpg",
  "birthDate": "1995-05-15",
  "weddingDate": "2026-06-20"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**Special Note:** First-time entries for `birthDate`, `weddingDate`, `firstName`, or `lastName` automatically award loyalty points!

---

### 2. **Orders Tab** - Order History

#### Get User Orders
```
GET /api/orders?email={{user_email}}
```
**Response:**
```json
{
  "success": true,
  "orders": [
    {
      "_id": "order_id_123",
      "email": "jane@example.com",
      "orderID": "ORD-2026-001",
      "firstName": "Jane",
      "lastName": "Doe",
      "address": "123 Main St",
      "city": "Cairo",
      "phone": "+20123456789",
      "cart": [
        {
          "productId": "prod_123",
          "productName": "Wedding Dress",
          "price": 5000,
          "quantity": 1,
          "imageUrl": "https://example.com/dress.jpg"
        }
      ],
      "subTotal": 5000,
      "total": 5200,
      "currency": "EGP",
      "status": "confirmed",
      "payment": "confirmed",
      "createdAt": "2026-01-15T10:30:00.000Z"
    }
  ]
}
```

**Order Status Values:**
- `pending` - Order placed, awaiting confirmation
- `confirmed` - Order confirmed by admin
- `shipped` - Order shipped
- `delivered` - Order delivered
- `cancelled` - Order cancelled

**Payment Status Values:**
- `pending` - Payment pending
- `failed` - Payment failed
- `confirmed` - Payment confirmed

---

### 3. **Notifications Tab** - User Notifications

#### Get Notifications
```
GET /api/notifications
```
**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "_id": "notif_123",
      "userId": {
        "_id": "user_456",
        "firstName": "Sarah",
        "lastName": "Ahmed",
        "imageURL": "https://example.com/sarah.jpg"
      },
      "link": "/playlists/playlist_id?videoId=video_id",
      "actionType": "like",
      "targetType": "video",
      "content": null,
      "read": false,
      "createdAt": "2026-02-01T10:30:00.000Z"
    }
  ]
}
```

**Action Types:**
- `like` - Someone liked your content
- `comment` - Someone commented on your content
- `reply` - Someone replied to your comment

#### Mark Notification as Read
```
PUT /api/notifications
```
**Request Body:**
```json
{
  "notificationId": "notif_123"
}
```

#### Mark All Notifications as Read
```
PUT /api/notifications
```
**Request Body:**
```json
{
  "markAll": true
}
```

---

### 4. **Loyalty Tab** - Loyalty Points System

#### Get Loyalty Transactions
```
POST /api/loyalty/transactions
```
**Request Body:**
```json
{
  "email": "jane@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "_id": "trans_123",
      "userId": "user_456",
      "type": "earn",
      "reason": "Order purchase",
      "amount": 100,
      "timestamp": "2026-01-15T10:30:00.000Z",
      "bonusID": {
        "_id": "bonus_789",
        "title": "First Purchase Bonus",
        "bonusPoints": 50
      }
    }
  ]
}
```

**Transaction Types:**
- `earn` - Points earned (positive amount)
- `spend` - Points spent (negative amount)

#### Award Loyalty Bonus
```
POST /api/loyalty/award-bonus
```
**Request Body:**
```json
{
  "email": "jane@example.com",
  "bonusType": "birthday"
}
```

**Bonus Types:**
- `birthday` - Birthday bonus
- `wedding` - Wedding date bonus
- `firstname` - First name completion bonus
- `lastname` - Last name completion bonus

---

### 5. **Wishlist Tab** - Product Wishlist

**Important Note:** The wishlist is currently managed **client-side** using React Context and local storage. For mobile app integration, you may need to:

1. Implement local storage for wishlist items
2. Sync wishlist with backend (if backend API is created)
3. Store wishlist items in the following format:

```typescript
{
  productId: string,
  productName: string,
  price: number,
  attributes: {
    name: string,
    price?: number,
    stock: number
  },
  variant: {
    name: string,
    price?: number,
    attributeName: string,
    images: Array<{url: string, type: "image" | "video"}>
  },
  imageUrl: string
}
```

---

### 6. **Partners/Discounts Tab** - Partner Discounts
**Requires Subscription**

#### Get Partners
```
GET /api/partners
```
**Response:**
```json
{
  "success": true,
  "partners": [
    {
      "_id": "partner_123",
      "name": "Luxury Venues",
      "description": "Get 20% off on all venue bookings",
      "discount": "20%",
      "imageURL": "https://example.com/partner.jpg",
      "link": "https://partner-website.com"
    }
  ]
}
```

---

### 7. **Favorites Tab** - User Favorites
**Requires Subscription**

#### Get Favorites
```
GET /api/favorites
```

#### Add to Favorites
```
POST /api/favorites
```
**Request Body:**
```json
{
  "itemId": "item_id_here",
  "itemType": "product"
}
```

#### Remove from Favorites
```
DELETE /api/favorites/:itemId
```

---

### 8. **Inspo Tab** - Inspiration Boards
**Requires Subscription**

#### Get Inspo Boards
```
GET /api/inspos
```

#### Create Inspo Board
```
POST /api/inspos
```
**Request Body:**
```json
{
  "title": "My Wedding Inspo",
  "description": "Ideas for my dream wedding",
  "items": []
}
```

#### Update Inspo Board
```
PUT /api/inspos/:boardId
```

#### Delete Inspo Board
```
DELETE /api/inspos/:boardId
```

---

### 9. **Continue Watching** - Playlist Progress
**Requires Subscription**

#### Get Playlist Progress
```
GET /api/playlist-progress
```
**Response:**
```json
{
  "success": true,
  "progressList": [
    {
      "playlistID": {
        "_id": "playlist_123",
        "title": "Wedding Planning 101",
        "thumbnailUrl": "https://example.com/playlist.jpg"
      },
      "lastWatchedVideoID": {
        "_id": "video_456",
        "title": "Choosing Your Venue",
        "thumbnailUrl": "https://example.com/video.jpg"
      },
      "progress": 45.5
    }
  ]
}
```

---

## 📊 Data Models

### User Interface
```typescript
interface User {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  imageURL: string;
  birthDate: Date;
  weddingDate: Date;
  isSubscribed: boolean;
  subscriptionExpiryDate: Date;
}
```

### Order Interface
```typescript
interface IOrder {
  _id: string;
  email: string;
  orderID?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  phone?: string;
  cart?: CartItem[];
  subTotal?: number;
  total?: number;
  currency?: string;
  status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  payment?: "pending" | "failed" | "confirmed";
  createdAt?: Date;
}
```

### Notification Interface
```typescript
interface INotification {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    imageURL?: string;
  };
  link: string;
  actionType: "like" | "comment" | "reply" | string;
  targetType: string;
  read: boolean;
  createdAt: string;
  content?: string;
}
```

### Loyalty Transaction Interface
```typescript
interface ILoyaltyTransaction {
  _id?: string;
  userId: string;
  type: "earn" | "spend";
  reason: string;
  amount: number;
  timestamp: Date;
  bonusID?: {
    _id?: string;
    title: string;
    description: string;
    bonusPoints: number;
  };
}
```

---

## ⚠️ Error Handling

All API endpoints return errors in the following format:

```json
{
  "success": false,
  "error": "Error message here",
  "message": "User-friendly error message"
}
```

### Common HTTP Status Codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (subscription required)
- `404` - Not Found
- `500` - Internal Server Error

### Recommended Error Handling:
```javascript
try {
  const response = await fetch('/api/endpoint');
  const data = await response.json();
  
  if (!response.ok || !data.success) {
    throw new Error(data.error || data.message || 'Request failed');
  }
  
  // Handle success
  return data;
} catch (error) {
  // Handle error
  console.error('API Error:', error);
  // Show user-friendly error message
}
```

---

## 🔒 Subscription-Required Features

The following tabs/features require an active subscription:
- **Partners/Discounts Tab** - Partner discount access
- **Favorites Tab** - Save and manage favorites
- **Inspo Tab** - Create and manage inspiration boards
- **Continue Watching** - Video playlist progress tracking

Check `user.isSubscribed` before allowing access to these features.

---

## 📝 Additional Notes

1. **Image Uploads**: Profile image uploads use UploadThing. You may need to implement a separate image upload flow for mobile apps.

2. **Date Formats**: All dates are in ISO 8601 format (`YYYY-MM-DDTHH:mm:ss.sssZ`)

3. **Currency**: The default currency is EGP (Egyptian Pound), but the system supports multiple currencies.

4. **Pagination**: Currently, the APIs don't implement pagination. For large datasets, you may want to request pagination support from the backend team.

5. **Real-time Updates**: Consider implementing WebSocket or Server-Sent Events for real-time notification updates.

---

## 🤝 Support

For questions or issues with the API integration, please contact:
- Backend Team: [backend@wifey.com]
- API Documentation: [docs.wifey.com]

---

**Last Updated:** February 1, 2026
**Version:** 1.0.0
