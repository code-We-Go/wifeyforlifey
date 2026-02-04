# Account Page API Architecture

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE APP                                │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Login   │  │ Profile  │  │  Orders  │  │  Notifs  │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
│       │             │             │             │               │
└───────┼─────────────┼─────────────┼─────────────┼───────────────┘
        │             │             │             │
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     API GATEWAY / BACKEND                        │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Authentication Layer                     │  │
│  │              (NextAuth.js / JWT Tokens)                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   /api/     │  │   /api/     │  │   /api/     │            │
│  │   user/     │  │   orders    │  │notifications│            │
│  │   profile   │  │             │  │             │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│         │                │                │                     │
│  ┌──────┴──────┐  ┌──────┴──────┐  ┌──────┴──────┐            │
│  │   /api/     │  │   /api/     │  │   /api/     │            │
│  │   loyalty/  │  │   partners  │  │   favorites │            │
│  │transactions │  │             │  │             │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│         │                │                │                     │
│  ┌──────┴──────┐  ┌──────┴──────┐                              │
│  │   /api/     │  │   /api/     │                              │
│  │   inspos    │  │   playlist- │                              │
│  │             │  │   progress  │                              │
│  └─────────────┘  └─────────────┘                              │
│                                                                  │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Users   │  │  Orders  │  │  Loyalty │  │ Notifs   │       │
│  │Collection│  │Collection│  │Collection│  │Collection│       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Partners │  │Favorites │  │  Inspos  │  │ Playlists│       │
│  │Collection│  │Collection│  │Collection│  │Collection│       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow by Feature

### 1. User Profile Update Flow
```
Mobile App
    │
    ├─► PUT /api/user/profile
    │   ├─ Request: { email, username, firstName, lastName, ... }
    │   │
    │   ├─► Backend validates data
    │   │
    │   ├─► Check for first-time entries
    │   │   ├─ First time birthDate? → Award loyalty points
    │   │   ├─ First time weddingDate? → Award loyalty points
    │   │   ├─ First time firstName? → Award loyalty points
    │   │   └─ First time lastName? → Award loyalty points
    │   │
    │   ├─► Update Users collection
    │   │
    │   └─► Response: { success: true }
    │
    └─► GET /api/user/profile?email={email}
        └─► Response: { user: {...} }
```

### 2. Orders Retrieval Flow
```
Mobile App
    │
    └─► GET /api/orders?email={email}
        │
        ├─► Backend queries Orders collection
        │   └─ Filter by user email
        │
        ├─► Populate cart items with product details
        │
        └─► Response: { orders: [...] }
            ├─ Order details
            ├─ Status (pending/confirmed/shipped/delivered)
            ├─ Payment status
            └─ Cart items with images
```

### 3. Notifications Flow
```
Mobile App
    │
    ├─► GET /api/notifications
    │   │
    │   ├─► Backend queries Notifications collection
    │   │   └─ Filter by current user
    │   │
    │   ├─► Populate userId with user details
    │   │
    │   └─► Response: { notifications: [...] }
    │       ├─ Unread count
    │       └─ Notification details
    │
    ├─► PUT /api/notifications (Mark as read)
    │   ├─ Request: { notificationId: "..." }
    │   └─► Update notification.read = true
    │
    └─► PUT /api/notifications (Mark all as read)
        ├─ Request: { markAll: true }
        └─► Update all user notifications.read = true
```

### 4. Loyalty Points Flow
```
Mobile App
    │
    ├─► POST /api/loyalty/transactions
    │   ├─ Request: { email: "..." }
    │   │
    │   ├─► Backend queries LoyaltyTransactions collection
    │   │   └─ Filter by user email
    │   │
    │   ├─► Populate bonusID with bonus details
    │   │
    │   └─► Response: { transactions: [...] }
    │       ├─ Type (earn/spend)
    │       ├─ Amount
    │       ├─ Reason
    │       └─ Bonus details
    │
    └─► POST /api/loyalty/award-bonus
        ├─ Request: { email: "...", bonusType: "birthday" }
        │
        ├─► Backend checks if bonus already awarded
        │
        ├─► Create new loyalty transaction
        │   ├─ Type: "earn"
        │   ├─ Amount: bonus points
        │   └─ Reason: bonus description
        │
        └─► Response: { success: true, message: "..." }
```

### 5. Subscription-Required Features Flow
```
Mobile App
    │
    ├─► Check user.isSubscribed
    │   │
    │   ├─ If FALSE → Show "Subscribe to access" message
    │   │
    │   └─ If TRUE → Allow access
    │       │
    │       ├─► GET /api/partners
    │       │   └─► Response: { partners: [...] }
    │       │
    │       ├─► GET /api/favorites
    │       │   └─► Response: { favorites: [...] }
    │       │
    │       ├─► GET /api/inspos
    │       │   └─► Response: { inspos: [...] }
    │       │
    │       └─► GET /api/playlist-progress
    │           └─► Response: { progressList: [...] }
```

---

## 🔐 Authentication Flow

### Initial Login
```
Mobile App
    │
    ├─► User enters credentials
    │
    ├─► POST /api/auth/signin
    │   ├─ Request: { email, password }
    │   │
    │   ├─► Backend validates credentials
    │   │
    │   ├─► Generate session/JWT token
    │   │
    │   └─► Response: { token, user: {...} }
    │
    ├─► Store token securely (Keychain/Keystore)
    │
    └─► POST /api/auth/login-tracking
        ├─ Request: { userId, email, fingerprint, ... }
        └─► Track login for security
```

### Authenticated Requests
```
Mobile App
    │
    ├─► Retrieve stored token
    │
    ├─► Add to request headers:
    │   Authorization: Bearer {token}
    │
    ├─► Make API request
    │
    └─► Handle response
        ├─ 200 → Success
        ├─ 401 → Token expired → Refresh or re-login
        └─ 403 → Subscription required
```

---

## 📦 Data Models Relationships

```
User
  ├─► Orders (1:N)
  │   └─► CartItems (1:N)
  │       └─► Products (N:1)
  │
  ├─► Notifications (1:N)
  │   └─► TriggeredBy: User (N:1)
  │
  ├─► LoyaltyTransactions (1:N)
  │   └─► BonusID (N:1)
  │
  ├─► Favorites (1:N) [Subscription Required]
  │   └─► Items (N:N)
  │
  ├─► InspoBoards (1:N) [Subscription Required]
  │   └─► Items (N:N)
  │
  ├─► PlaylistProgress (1:N) [Subscription Required]
  │   ├─► Playlist (N:1)
  │   └─► LastWatchedVideo (N:1)
  │
  └─► Wishlist (1:N) [Client-side only]
      └─► Products (N:N)
```

---

## 🎯 API Response Patterns

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Technical error message",
  "message": "User-friendly error message"
}
```

### Paginated Response (Future)
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## 🚀 Mobile App Integration Checklist

### Phase 1: Core Features
- [ ] Implement authentication (login/logout)
- [ ] User profile view and edit
- [ ] Orders list and details
- [ ] Notifications list with unread badge
- [ ] Loyalty points display

### Phase 2: Enhanced Features
- [ ] Wishlist management (local storage)
- [ ] Mark notifications as read
- [ ] Profile image upload
- [ ] Order status tracking

### Phase 3: Subscription Features
- [ ] Subscription status check
- [ ] Partners/Discounts (if subscribed)
- [ ] Favorites management (if subscribed)
- [ ] Inspo boards (if subscribed)
- [ ] Continue watching (if subscribed)

### Phase 4: Optimization
- [ ] Implement caching strategy
- [ ] Add pull-to-refresh
- [ ] Implement pagination
- [ ] Add offline support
- [ ] Push notifications integration

---

## 📊 Performance Metrics

### Recommended Response Times
- User Profile: < 200ms
- Orders List: < 500ms
- Notifications: < 300ms
- Loyalty Transactions: < 400ms

### Caching Strategy
- **User Profile**: Cache for 5 minutes
- **Orders**: Cache for 2 minutes
- **Notifications**: No cache (real-time)
- **Loyalty Points**: Cache for 1 minute

### Data Size Estimates
- User Profile: ~2KB
- Single Order: ~5KB
- Notifications (20 items): ~10KB
- Loyalty Transactions (50 items): ~15KB

---

**Version:** 1.0.0  
**Last Updated:** February 1, 2026
