# Wifey Account APIs - Complete Documentation Package

Welcome to the Wifey Account APIs documentation package! This folder contains everything a mobile developer needs to integrate the account page features into a mobile application.

## 📦 Package Contents

### 1. **Account_APIs_Collection.json**
The complete Postman collection with all API endpoints organized by feature/tab.

**What's included:**
- User Profile APIs (Info Tab)
- Orders APIs
- Notifications APIs
- Loyalty Points APIs
- Wishlist APIs
- Partners/Discounts APIs
- Favorites APIs
- Inspo Boards APIs
- Playlist Progress APIs
- Authentication APIs

### 2. **Wifey_Development_Environment.json**
Postman environment file with pre-configured variables for testing.

**Variables included:**
- `base_url` - API base URL
- `user_email` - Test user email
- `user_id` - User ID
- `auth_token` - Authentication token
- `notification_id` - Sample notification ID
- `order_id` - Sample order ID
- `board_id` - Sample inspo board ID
- `item_id` - Sample item ID

### 3. **README.md**
Comprehensive documentation covering:
- Import instructions
- Environment setup
- Authentication details
- All API endpoints with examples
- Request/response formats
- Data models and interfaces
- Error handling
- Subscription-required features
- Integration notes

### 4. **QUICK_REFERENCE.md**
Quick lookup guide with:
- API endpoints table
- Key response fields
- UI implementation tips
- Common issues and solutions
- Mobile-specific considerations
- Data sync strategies

### 5. **ARCHITECTURE.md**
System architecture documentation:
- Architecture diagrams
- Data flow diagrams
- Authentication flow
- Database relationships
- Integration checklist
- Performance metrics

### 6. **INDEX.md** (This file)
Overview and navigation guide for all documentation.

---

## 🚀 Quick Start Guide

### Step 1: Import into Postman
1. Open Postman
2. Click **Import** button
3. Import **Account_APIs_Collection.json**
4. Import **Wifey_Development_Environment.json**

### Step 2: Configure Environment
1. Select "Wifey Account APIs - Development" environment
2. Update `base_url` to your API server URL
3. Update `user_email` to a test user email
4. Add `auth_token` if using token-based auth

### Step 3: Test Endpoints
1. Start with authentication endpoints
2. Test user profile endpoints
3. Explore other tabs (orders, notifications, etc.)
4. Test subscription-required features

### Step 4: Review Documentation
1. Read **README.md** for detailed API documentation
2. Check **QUICK_REFERENCE.md** for quick lookups
3. Review **ARCHITECTURE.md** for system understanding

---

## 📱 Account Page Tabs Overview

### 1. **Partners/Discounts Tab** 🎫
- **Requires:** Subscription
- **APIs:** GET /api/partners
- **Features:** View partner discounts and offers

### 2. **Favorites Tab** ⭐
- **Requires:** Subscription
- **APIs:** GET, POST, DELETE /api/favorites
- **Features:** Save and manage favorite items

### 3. **Inspo Tab** ✨
- **Requires:** Subscription
- **APIs:** GET, POST, PUT, DELETE /api/inspos
- **Features:** Create and manage inspiration boards

### 4. **Notifications Tab** 🔔
- **Requires:** Authentication
- **APIs:** GET, PUT /api/notifications
- **Features:** View and manage notifications
- **Special:** Shows unread count badge

### 5. **Loyalty Tab** 🎁
- **Requires:** Authentication
- **APIs:** POST /api/loyalty/transactions, POST /api/loyalty/award-bonus
- **Features:** View loyalty points and transaction history

### 6. **Info Tab** 👤
- **Requires:** Authentication
- **APIs:** GET, PUT /api/user/profile
- **Features:** View and edit user profile
- **Special:** Awards loyalty points for first-time entries

### 7. **Wishlist Tab** ❤️
- **Requires:** Authentication
- **APIs:** Client-side only (local storage)
- **Features:** Manage product wishlist

### 8. **Orders Tab** 🛍️
- **Requires:** Authentication
- **APIs:** GET /api/orders
- **Features:** View order history and details

---

## 🔑 Key Features

### Authentication
- Session-based (web) or token-based (mobile)
- Secure token storage required
- Session refresh handling

### Subscription System
- Check `user.isSubscribed` before accessing premium features
- Show upgrade prompts for non-subscribed users
- Handle subscription expiry

### Loyalty Points
- Automatic points for profile completion
- Points for purchases
- Bonus points system
- Earn and spend tracking

### Notifications
- Real-time updates (implement polling or WebSocket)
- Unread count badge
- Mark as read functionality
- Deep linking to content

---

## 📊 API Endpoint Summary

| Category | Endpoints | Auth Required | Subscription Required |
|----------|-----------|---------------|----------------------|
| User Profile | 2 | ✅ | ❌ |
| Orders | 1 | ✅ | ❌ |
| Notifications | 3 | ✅ | ❌ |
| Loyalty | 2 | ✅ | ❌ |
| Partners | 1 | ✅ | ✅ |
| Favorites | 3 | ✅ | ✅ |
| Inspo Boards | 4 | ✅ | ✅ |
| Playlist Progress | 1 | ✅ | ✅ |
| **Total** | **17** | - | - |

---

## 🎯 Implementation Roadmap

### Phase 1: Core Features (Week 1-2)
- [ ] Set up authentication
- [ ] Implement user profile view/edit
- [ ] Display orders list
- [ ] Show notifications with badge
- [ ] Display loyalty points

### Phase 2: Enhanced Features (Week 3-4)
- [ ] Wishlist management
- [ ] Mark notifications as read
- [ ] Profile image upload
- [ ] Order details view
- [ ] Loyalty transaction history

### Phase 3: Subscription Features (Week 5-6)
- [ ] Subscription status check
- [ ] Partners/Discounts view
- [ ] Favorites management
- [ ] Inspo boards CRUD
- [ ] Continue watching

### Phase 4: Polish & Optimization (Week 7-8)
- [ ] Implement caching
- [ ] Add pull-to-refresh
- [ ] Offline support
- [ ] Push notifications
- [ ] Performance optimization

---

## 🔧 Technical Requirements

### Mobile App
- **Minimum SDK:** iOS 13+ / Android 8.0+
- **Network:** HTTPS required
- **Storage:** Secure storage for auth tokens
- **Permissions:** Camera (for profile photo), Notifications

### API Server
- **Protocol:** HTTPS
- **Authentication:** Session/JWT
- **Rate Limiting:** TBD with backend team
- **CORS:** Configured for mobile app domain

---

## 📚 Additional Resources

### TypeScript Interfaces
See `app/interfaces/interfaces.ts` in the project for complete type definitions:
- `User`
- `IOrder`
- `INotification`
- `ILoyaltyTransaction`
- `CartItem`
- `Product`
- And more...

### Icons Used
- Partners: `CirclePercent`
- Favorites: `Star`
- Inspo: `Sparkles`
- Notifications: `Bell`
- Loyalty: `Gift`
- Info: `UserCircle`
- Wishlist: `Heart`
- Orders: `ShoppingBag`

### Color Scheme
- Primary: `lovely` (pink/rose)
- Secondary: `creamey` (cream/beige)
- Accent: `everGreen` (green)
- Background: `saga` (light)

---

## ❓ FAQ

### Q: Do I need to implement all tabs at once?
**A:** No, implement in phases. Start with core features (Profile, Orders, Notifications, Loyalty) then add subscription features.

### Q: How do I handle subscription-only features?
**A:** Check `user.isSubscribed` status. If false, show a "Subscribe to access" message with a link to subscription page.

### Q: Is the wishlist stored on the backend?
**A:** Currently, wishlist is client-side only (local storage). You'll need to implement local storage for mobile.

### Q: How often should I poll for notifications?
**A:** Poll every 30-60 seconds when app is active. Consider implementing WebSocket for real-time updates.

### Q: What about image uploads?
**A:** The web app uses UploadThing. For mobile, implement native image picker and upload to the same service or coordinate with backend team.

### Q: How do I test subscription features without a subscription?
**A:** Coordinate with backend team to create test accounts with active subscriptions.

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** 401 Unauthorized errors
- **Solution:** Verify auth token is valid and included in headers

**Issue:** 403 Forbidden on subscription features
- **Solution:** Check user subscription status

**Issue:** Notifications not updating
- **Solution:** Implement polling or WebSocket connection

**Issue:** Images not loading
- **Solution:** Check CORS settings and handle missing images gracefully

**Issue:** Loyalty points not updating after profile edit
- **Solution:** Refresh loyalty data after successful profile update

---

## 📞 Support & Contact

### For Questions About:
- **API Endpoints:** Backend Team
- **Authentication:** DevOps Team  
- **Mobile Integration:** Mobile Team Lead
- **Design/UI:** Design Team

### Resources:
- **API Documentation:** This folder
- **Backend Code:** `app/api/` directory
- **Frontend Code:** `app/account/page.tsx`
- **Interfaces:** `app/interfaces/interfaces.ts`

---

## 📝 Version History

### Version 1.0.0 (February 1, 2026)
- Initial release
- Complete API documentation
- Postman collection with all endpoints
- Architecture diagrams
- Quick reference guide
- Mobile integration guidelines

---

## ✅ Pre-Integration Checklist

Before starting mobile app development:

- [ ] Reviewed all documentation files
- [ ] Imported Postman collection
- [ ] Set up environment variables
- [ ] Tested all API endpoints in Postman
- [ ] Understood authentication flow
- [ ] Reviewed data models and interfaces
- [ ] Coordinated with backend team on authentication strategy
- [ ] Planned implementation phases
- [ ] Set up development environment
- [ ] Created test accounts (with and without subscription)

---

## 🎉 Ready to Start?

1. **Read** the README.md for detailed API documentation
2. **Import** the Postman collection and test endpoints
3. **Review** the ARCHITECTURE.md to understand the system
4. **Use** the QUICK_REFERENCE.md for quick lookups during development
5. **Start** implementing following the roadmap above

**Good luck with your integration!** 🚀

---

**Package Version:** 1.0.0  
**Last Updated:** February 1, 2026  
**Maintained By:** Wifey Development Team
