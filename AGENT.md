# Rebuild the Entire PURE VEIL Theme Using These Exact Brand Colors

The current implementation is incorrect.

Do NOT use black and gold.

Do NOT approximate the colors.

Use ONLY the following brand palette throughout the entire application.

## Official Brand Colors

Primary Beige
#A1997F

Primary Dark Olive
#201E17

Dark Surface
#181C19

Secondary Olive
#494736

Light Olive Surface
#242A23

These colors define the entire brand identity.

Create lighter and darker shades ONLY from these colors when necessary.

Do not introduce unrelated colors.

---

# Design Philosophy

The website should feel like a luxury perfume boutique.

Elegant.

Warm.

Minimal.

Premium.

Sophisticated.

The interface should immediately resemble the PURE VEIL logo.

---

# Theme Tokens

Create a centralized design system.

Example:

Primary: #201E17

Primary Hover: slightly lighter version

Secondary: #494736

Accent: #A1997F

Accent Hover: slightly lighter version

Background: very light tint derived from #A1997F

Surface: #242A23

Card Surface: light warm beige derived from #A1997F

Border: muted olive

Text Primary: #201E17

Text Secondary: #494736

Dark Background: #181C19

Do NOT hardcode colors inside components.

Everything must use theme variables/design tokens.

---

# Apply the New Theme Everywhere

Update every screen without exception.

Including:

- Landing Page
- Hero
- Navbar
- Mobile Navigation
- Footer
- Collections
- Categories
- Product Cards
- Product Details
- Search
- Favorites
- Cart
- Checkout
- User Dashboard
- Authentication
- Admin Dashboard
- Orders
- Products Management
- Categories Management
- Collections Management
- Store Settings
- Tables
- Forms
- Pagination
- Dropdowns
- Modals
- Toasts
- Alerts
- Empty States
- Skeleton Loaders
- Loading Indicators

No page should retain the previous theme.

---

# Backgrounds

Avoid large black backgrounds.

Instead:

Use soft beige backgrounds derived from #A1997F.

Alternate sections using light olive tones derived from:

#242A23

and

#494736.

Dark sections should use:

#181C19

instead of pure black.

---

# Buttons

Primary Buttons

Background:

#201E17

Text:

#A1997F

Hover:

slightly lighter olive.

Secondary Buttons

Background:

#A1997F

Text:

#201E17

Hover:

slightly darker beige.

No yellow.

No gold.

No orange.

---

# Cards

Cards should use:

Warm beige backgrounds.

Soft olive borders.

Very subtle shadows.

Elegant hover animations.

Do not use black cards.

---

# Navigation

Navbar and Footer should primarily use:

#201E17

Active items:

#A1997F

Hover states should transition smoothly between the official brand colors.

---

# Forms

Inputs should use:

Light beige backgrounds.

Olive borders.

Focus state:

#A1997F

Placeholder:

muted olive.

---

# Product Cards

Product cards should:

Use warm backgrounds.

Olive borders.

Beige typography.

Premium hover animations.

Favorite button, badges, and actions should match the new palette.

---

# Admin Dashboard

Apply exactly the same branding.

The admin panel should not have a separate visual identity.

Sidebar:

#201E17

Cards:

warm beige

Buttons:

olive and beige

Tables:

matching the same palette.

---

# Icons

Icons should use only:

#201E17

#494736

#A1997F

No blue or yellow icons except for semantic status indicators.

---

# Gradients

If gradients are used, they must be created ONLY from:

#A1997F

#494736

#242A23

Never introduce black gradients.

---

# Final Audit

Before considering the task complete:

Review every page and every reusable component.

Ensure there is not a single remaining instance of the old black and gold theme.

The storefront and admin dashboard should feel like one cohesive luxury brand built entirely around the official PURE VEIL palette.

---

# Technical Requirements

- Use the exact HEX colors provided above as the foundation of the design system.
- Generate all lighter and darker shades from these colors only.
- Centralize all colors into reusable theme variables/design tokens.
- Remove hardcoded colors throughout the project.
- Preserve existing layouts and functionality.
- Maintain full RTL/LTR support.
- Ensure WCAG-compliant contrast where possible.
- Follow Clean Architecture and the existing design system.
- Deliver a complete, production-ready visual redesign where the entire application consistently reflects the official PURE VEIL olive and beige brand identity.