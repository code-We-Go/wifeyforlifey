# Quick Reference - Account APIs

## 🎯 Quick Start Checklist

- [ ] Import `Account_APIs_Collection.json` into Postman
- [ ] Set up environment variables (`base_url`, `user_email`)
- [ ] Test authentication flow
- [ ] Implement session/token management
- [ ] Test each endpoint with sample data

---

## 📋 API Quick Reference

### User Profile (Info Tab)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/user/profile?email={email}` | ✅ | Get user profile |
| PUT | `/api/user/profile` | ✅ | Update user profile |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/orders?email={email}` | ✅ | Get user orders |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/notifications` | ✅ | Get all notifications |
| PUT | `/api/notifications` | ✅ | Mark notification(s) as read |
| PUT | `/api/notifications/{id}/read` | ✅ | Mark specific notification as read |

### Loyalty Points
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/loyalty/transactions` | ✅ | Get loyalty transactions |
| POST | `/api/loyalty/award-bonus` | ✅ | Award loyalty bonus |

### Partners (Requires Subscription)
| Method | Endpoint | Auth | Subscription | Description |
|--------|----------|------|--------------|-------------|
| GET | `/api/partners` | ✅ | ✅ | Get partner discounts |

### Favorites (Requires Subscription)
| Method | Endpoint | Auth | Subscription | Description |
|--------|----------|------|--------------|-------------|
| GET | `/api/favorites` | ✅ | ✅ | Get favorites |
| POST | `/api/favorites` | ✅ | ✅ | Add to favorites |
| DELETE | `/api/favorites/{id}` | ✅ | ✅ | Remove from favorites |

### Inspo Boards (Requires Subscription)
| Method | Endpoint | Auth | Subscription | Description |
|--------|----------|------|--------------|-------------|
| GET | `/api/inspos` | ✅ | ✅ | Get inspo boards |
| POST | `/api/inspos` | ✅ | ✅ | Create inspo board |
| PUT | `/api/inspos/{id}` | ✅ | ✅ | Update inspo board |
| DELETE | `/api/inspos/{id}` | ✅ | ✅ | Delete inspo board |

### Playlist Progress (Requires Subscription)
| Method | Endpoint | Auth | Subscription | Description |
|--------|----------|------|--------------|-------------|
| GET | `/api/playlist-progress` | ✅ | ✅ | Get playlist progress |

---

## 🔑 Key Response Fields

### User Profile
```json
{
  "username": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "imageURL": "string",
  "birthDate": "ISO Date",
  "weddingDate": "ISO Date"
}
```

### Order
```json
{
  "_id": "string",
  "orderID": "string",
  "status": "pending|confirmed|shipped|delivered|cancelled",
  "payment": "pending|failed|confirmed",
  "total": "number",
  "cart": "CartItem[]",
  "createdAt": "ISO Date"
}
```

### Notification
```json
{
  "_id": "string",
  "userId": {
    "firstName": "string",
    "lastName": "string",
    "imageURL": "string"
  },
  "actionType": "like|comment|reply",
  "targetType": "string",
  "read": "boolean",
  "link": "string",
  "createdAt": "ISO Date"
}
```

### Loyalty Transaction
```json
{
  "type": "earn|spend",
  "amount": "number",
  "reason": "string",
  "timestamp": "ISO Date",
  "bonusID": {
    "title": "string",
    "bonusPoints": "number"
  }
}
```

---

## 🎨 UI Implementation Tips

### Account Tabs Order
1. **Partners/Discounts** (CirclePercent icon)
2. **Favorites** (Star icon)
3. **Inspo** (Sparkles icon)
4. **Notifications** (Bell icon) - Show unread count badge
5. **Loyalty** (Gift icon)
6. **Info** (UserCircle icon)
7. **Wishlist** (Heart icon)
8. **Orders** (ShoppingBag icon)

### Tab States
- **Active Tab**: Show with accent color and bottom border
- **Inactive Tab**: Show with muted color
- **Subscription Required**: Show lock icon or "Subscribe" message for non-subscribed users

### Notification Badge
- Show red badge with count on Notifications tab
- Display "9+" if count > 9
- Auto-mark all as read when tab is opened

---

## 🔐 Authentication Notes

### Current Web Implementation
- Uses NextAuth.js with session cookies
- Session stored server-side
- Automatic session refresh

### Mobile App Recommendations
1. Implement JWT token-based authentication
2. Store tokens securely (Keychain/Keystore)
3. Add `Authorization: Bearer {token}` header to all requests
4. Implement token refresh logic
5. Handle 401 responses by redirecting to login

---

## ⚡ Performance Tips

1. **Cache User Profile**: Cache profile data locally, refresh on pull-to-refresh
2. **Pagination**: Request pagination for orders and notifications (future enhancement)
3. **Lazy Loading**: Load tab content only when tab is selected
4. **Image Optimization**: Use image caching and lazy loading for profile images
5. **Offline Support**: Cache critical data for offline viewing

---

## 🎁 Loyalty Points System

### Points Awarded For:
- **First-time profile completion**:
  - Adding birth date: Points awarded
  - Adding wedding date: Points awarded
  - Adding first name: Points awarded
  - Adding last name: Points awarded
- **Purchases**: Points based on order total
- **Special bonuses**: Various promotional bonuses

### Points Usage:
- Redeem for discounts on subscriptions
- Redeem for discounts on products
- Track via Loyalty tab

---

## 🐛 Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution**: Ensure authentication token is valid and included in request headers

### Issue: 403 Forbidden (Subscription Required)
**Solution**: Check `user.isSubscribed` status before accessing subscription-only features

### Issue: Wishlist not syncing
**Solution**: Wishlist is client-side only. Implement local storage for mobile app

### Issue: Notifications not updating
**Solution**: Implement polling or WebSocket for real-time updates

### Issue: Images not loading
**Solution**: Ensure proper CORS headers and handle missing imageURL gracefully

---

## 📱 Mobile-Specific Considerations

1. **Push Notifications**: Integrate with Firebase/APNs for real-time notifications
2. **Deep Linking**: Handle notification links that navigate to specific content
3. **Biometric Auth**: Consider implementing fingerprint/face ID for quick login
4. **Offline Mode**: Cache essential data for offline viewing
5. **Image Upload**: Implement native image picker for profile photo updates

---

## 🔄 Data Sync Strategy

### On App Launch:
1. Fetch user profile
2. Fetch unread notification count
3. Fetch loyalty points balance

### On Tab Selection:
1. Fetch tab-specific data
2. Show loading state
3. Cache response for quick subsequent access

### Background Sync:
1. Periodically check for new notifications
2. Update loyalty points balance
3. Sync wishlist if backend API is implemented

---

## 📞 Contact & Support

**Questions about:**
- API endpoints → Backend Team
- Authentication → DevOps Team
- Mobile integration → Mobile Team Lead

**Resources:**
- Full Documentation: `README.md`
- Postman Collection: `Account_APIs_Collection.json`
- Data Models: See `app/interfaces/interfaces.ts`

---

**Version:** 1.0.0  
**Last Updated:** February 1, 2026
