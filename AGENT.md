````text id="a8pq5n"
# Implement Authentication, Admin Panel, User Account Management, Favorites, and Database Integration

Continue building the project into a production-ready application.

The database connection credentials have already been added to the `.env` file:

```env
DB_NAME=PUREVEIL
DB_USER=root
DB_PASS=41468158
DB_HOST=localhost
DB_PORT=3306
```

Use MySQL as the database for all persistence instead of temporary or mock storage.

---

# 1. Connect the Entire Application to the Database

Replace any remaining mock state, local storage, in-memory data, or temporary data with real database integration.

Review every feature and connect it to MySQL.

This includes:

- Authentication
- User Profiles
- Suppliers
- Favorites
- Categories
- Products/Services
- Contact Information
- Branches
- Working Hours
- Documents
- Verification Status
- Dashboard Data
- Any other entity currently using mock data

If some backend endpoints are missing, implement them.

---

# 2. Seed Mock Data into the Database

Populate the database with realistic seed data.

Create enough sample data to properly test the application.

Include:

- Admin account
- Multiple supplier accounts
- Regular user accounts
- Categories
- Suppliers
- Products
- Services
- Favorites
- Branches
- Reviews (if supported)
- Verification statuses
- Images/placeholders where applicable

The frontend should load this seeded data through the API rather than using hardcoded values.

---

# 3. Create a Protected Admin Panel

Build a dedicated Admin Panel that is completely separate from the public website.

Requirements:

- Accessible only to authenticated administrators.
- Prevent normal users from accessing admin routes.
- Redirect unauthorized users appropriately.
- Protect both frontend routes and backend APIs.

Create a clean admin layout with its own navigation.

At a minimum, include management pages for:

- Dashboard
- Users
- Suppliers
- Categories
- Products / Services
- Favorites (if applicable)
- Business Verification
- Uploaded Documents
- Branches
- Reports (placeholder if not yet implemented)
- Settings

Design the admin panel using the existing design system.

---

# 4. Role-Based Authentication & Authorization

Implement proper role-based access control.

Support roles such as:

- Admin
- Supplier
- User

Ensure:

- Protected routes.
- Protected API endpoints.
- Role validation.
- Secure authorization middleware.
- Proper redirects.

---

# 5. Favorites Page

A Favorites page is currently missing.

Create a complete Favorites page.

Requirements:

Users should be able to:

- View all favorite suppliers.
- Remove suppliers from favorites.
- Navigate to supplier profiles.
- Display an empty state when there are no favorites.
- Load data from the database.

Ensure this page is fully responsive and localized.

---

# 6. Login & Registration

Complete the authentication flow.

Registration should:

- Create a user in the database.
- Validate all fields.
- Prevent duplicate email addresses.
- Hash passwords securely.
- Return proper validation messages.

Login should:

- Authenticate against the database.
- Generate the project's existing authentication token/session.
- Redirect according to the user's role.
- Display localized error messages.

---

# 7. User Account Settings

Allow users to edit their account information.

Support updating:

- Full Name
- Password

Password updates should:

- Require validation.
- Confirm the new password.
- Store hashed passwords only.
- Follow existing security rules.

---

# 8. API Review

Review every API endpoint.

Ensure:

- Proper validation.
- Proper status codes.
- Error handling.
- Localization compatibility.
- Consistent response format.
- No remaining mock endpoints.

---

# 9. Localization

All newly added pages, forms, buttons, validation messages, labels, and notifications must support:

- English
- Arabic

No hardcoded strings should remain.

---

# 10. Responsive Design

Ensure every newly created page is fully responsive.

Review layouts for:

- Mobile
- Tablet
- Desktop

The mobile experience should feel like a native application.

---

# Technical Requirements

- Use the existing MySQL connection from the `.env` file.
- Remove reliance on mock storage wherever backend support exists.
- Seed the database with realistic sample data for development.
- Reuse existing components whenever possible.
- Preserve the current design system.
- Maintain Clean Architecture.
- Keep the code modular and reusable.
- Preserve existing functionality.
- Follow the project's coding standards.
- Deliver a production-ready implementation where authentication, authorization, admin features, favorites, and user account management are fully integrated with the MySQL database.
````
