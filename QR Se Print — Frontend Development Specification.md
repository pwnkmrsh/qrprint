# QR Se Print — Frontend Development Specification

## Role

You are a Senior Frontend Architect and UI Engineer.

Build a production-ready frontend for a QR-based print automation SaaS called **QR Se Print**.

The frontend must support two experiences:

1. Customer QR Printing Portal
2. Shop Owner Dashboard

Do not build a generic template. Design the UI specifically for a print-shop workflow.

---

## Technology

Use:

- Next.js 15+
- App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query
- Recharts
- Lucide React

Use strict TypeScript.

Avoid unnecessary dependencies.

---

# 1. Project Initialization

Create a clean Next.js application with:

- TypeScript
- ESLint
- Tailwind
- shadcn/ui
- App Router

Configure:

```env
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_APP_NAME=QR Se Print
```

Never hardcode API URLs.

Never expose secrets through `NEXT_PUBLIC_*`.

---

# 2. Application Structure

Use this structure:

```text
app/
├── (customer)/
│   └── s/
│       └── [shopSlug]/
│           ├── page.tsx
│           ├── upload/
│           │   └── page.tsx
│           ├── configure/
│           │   └── page.tsx
│           ├── payment/
│           │   └── page.tsx
│           └── status/
│               └── [jobId]/
│                   └── page.tsx
│
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   └── forgot-password/
│       └── page.tsx
│
├── (dashboard)/
│   └── dashboard/
│       ├── page.tsx
│       ├── jobs/
│       │   ├── page.tsx
│       │   └── [jobId]/
│       │       └── page.tsx
│       ├── printers/
│       │   └── page.tsx
│       ├── agent/
│       │   └── page.tsx
│       ├── pricing/
│       │   └── page.tsx
│       ├── analytics/
│       │   └── page.tsx
│       └── settings/
│           └── page.tsx
│
├── layout.tsx
├── page.tsx
└── globals.css
```

---

# 3. Customer Portal

URL:

```text
/s/{shopSlug}
```

This must be mobile-first.

The customer should not need an account.

---

## Customer Home

Display:

```text
Shop Logo
Shop Name
"Print directly from your phone"
```

Primary CTA:

```text
Upload Document
```

Secondary information:

```text
PDF / JPG / PNG
Fast & Secure
No WhatsApp Required
```

Keep the interface extremely simple.

---

# 4. Upload Screen

Create a large drag/drop and mobile upload area.

Support:

```text
PDF
JPG
JPEG
PNG
```

Show:

```text
Maximum file size
Maximum number of files
Supported formats
```

Each uploaded file should display:

```text
Filename
File size
Page count if available
Upload progress
Remove button
```

States:

```text
Idle
Uploading
Uploaded
Error
```

Use accessible buttons and keyboard navigation.

---

# 5. File Validation

Use Zod for metadata validation.

Client-side checks:

```text
Allowed extension
Allowed MIME type
Maximum size
Maximum number of files
```

Never rely only on client-side validation.

The Laravel backend remains authoritative.

---

# 6. Configure Print

Create a clean print configuration interface.

Options:

### Paper

```text
A4
A3
Letter
Legal
```

### Color

```text
Black & White
Color
```

### Copies

```text
1
2
3
...
```

### Duplex

```text
Single Side
Double Side
```

### Orientation

```text
Portrait
Landscape
```

Show live price:

```text
Estimated Total

₹20
```

The frontend price is only an estimate.

The backend provides the final authoritative amount.

---

# 7. Price Summary

Create a sticky mobile-friendly summary card.

Display:

```text
Files
Pages
Copies
Color Mode
Paper Size
Duplex
Subtotal
Total
```

CTA:

```text
Continue to Payment
```

Disable CTA when:

```text
No files
Uploading
Invalid configuration
API unavailable
```

---

# 8. Payment Screen

Display:

```text
Print Summary
Amount
Payment Method
```

Primary CTA:

```text
Pay & Print
```

After payment:

```text
Payment Successful
Print Job Created
```

Do not trust frontend payment success.

The frontend must refresh job/payment state from the backend.

---

# 9. Print Status Screen

URL:

```text
/s/{shopSlug}/status/{jobId}
```

Display a visual timeline:

```text
✓ Uploaded

✓ Payment Confirmed

✓ Print Queued

● Printing

○ Completed
```

Possible states:

```text
CREATED
UPLOADING
PAYMENT_PENDING
PAID
QUEUED
DOWNLOADING
PRINTING
PRINTED
FAILED
CANCELLED
FILE_DELETED
```

For failed jobs:

```text
Print failed

Try Again
Contact Shop
```

Use TanStack Query polling.

Default:

```text
every 2-5 seconds
```

Stop polling when terminal state is reached.

---

# 10. Customer Success Screen

Display:

```text
✓ Print Completed

Your document has been printed successfully.

Job ID
#QR12345
```

Optional:

```text
Start New Print
```

Do not expose sensitive file information.

---

# 11. Authentication

Shop users use:

```text
/login
```

Build:

```text
Email
Password
Remember Me
Login
Forgot Password
```

Use React Hook Form + Zod.

Show inline validation.

Handle:

```text
401
403
422
429
500
Network Error
```

with user-friendly messages.

---

# 12. Dashboard Layout

Create a professional SaaS dashboard.

Desktop:

```text
┌──────────────┬───────────────────────────┐
│              │ Topbar                    │
│   Sidebar    ├───────────────────────────┤
│              │                           │
│              │ Main Content              │
│              │                           │
└──────────────┴───────────────────────────┘
```

Mobile:

```text
Topbar
Content
Bottom/Drawer Navigation
```

---

# 13. Dashboard Sidebar

Menu:

```text
Dashboard
Print Jobs
Printers
Print Agent
Pricing
Analytics
Settings
```

Highlight active route.

Use Lucide icons.

---

# 14. Dashboard Home

Display:

```text
Today's Print Jobs
Today's Revenue
Pending Jobs
Failed Jobs
```

Create cards with:

```text
Value
Comparison
Trend
Icon
```

Example:

```text
Today's Jobs
128

+18.4%
vs yesterday
```

Do not invent real values.

Use mock data only when API is unavailable during development.

Clearly separate mock mode from production mode.

---

# 15. Jobs Page

Create a responsive jobs table.

Columns:

```text
Job ID
Date
Files
Pages
Print Mode
Amount
Status
Printer
Actions
```

Filters:

```text
Date
Status
Payment
Printer
```

Search:

```text
Job ID
Customer mobile
```

Pagination must be server-side.

Use TanStack Query.

---

# 16. Job Details

Display:

```text
Job ID
Created At
Payment Status
Print Status
Printer
Pages
Copies
Paper
Color
Duplex
Amount
```

Create timeline:

```text
Created
Paid
Queued
Printing
Printed
Deleted
```

Do not expose document contents unnecessarily.

---

# 17. Printer Page

Display printer cards.

Example:

```text
Canon G3010

● Online

Default Printer

Last Job:
#QR12452

Agent:
v1.2.4
```

States:

```text
Online
Offline
Busy
Error
Unknown
```

Allow:

```text
Set Default
View Details
```

Do not implement browser-side printer control.

Printer control remains the responsibility of the Windows Print Agent.

---

# 18. Print Agent Page

Display:

```text
Agent Status
Version
Computer Name
Last Seen
Connected Printers
```

Example:

```text
● Agent Online

Version 1.4.2

Last seen:
8 seconds ago
```

When offline:

```text
● Agent Offline

Last seen:
15 minutes ago
```

Show troubleshooting information.

---

# 19. Pricing Page

Use React Hook Form + Zod.

Allow shop owner to configure:

```text
A4 B&W
A4 Color
A3 B&W
A3 Color
Letter
Legal
```

Additional settings:

```text
Minimum order
Maximum copies
Maximum pages
```

Display preview:

```text
Customer Price Preview
```

Save using API mutation.

Show optimistic UI only where safe.

---

# 20. Analytics

Use Recharts.

Charts:

### Print Jobs

Line chart:

```text
Jobs per day
```

### Revenue

Area/line chart:

```text
Revenue per day
```

### Print Mode

Pie/donut chart:

```text
B&W
Color
```

### Paper Size

Bar chart:

```text
A4
A3
Letter
Legal
```

### Peak Hours

Bar chart.

All charts must use API data.

Show:

```text
Loading
Empty
Error
```

states.

---

# 21. Settings

Sections:

```text
Shop Profile
Branding
Contact Information
QR Configuration
Payment Configuration
Print Configuration
Security
```

Use separate forms.

Validate with Zod.

---

# 22. API Client

Create:

```text
lib/api-client.ts
```

Implement:

```text
GET
POST
PUT
PATCH
DELETE
```

Centralize:

```text
Base URL
Headers
Authentication
Error handling
Timeout
```

Never duplicate fetch logic across components.

---

# 23. Services

Create:

```text
services/
├── auth.service.ts
├── shop.service.ts
├── print-job.service.ts
├── printer.service.ts
├── agent.service.ts
├── payment.service.ts
└── analytics.service.ts
```

Services must contain API calls only.

Business state belongs in hooks/domain logic.

---

# 24. TanStack Query Hooks

Create:

```text
hooks/
├── use-auth.ts
├── use-shop.ts
├── use-print-jobs.ts
├── use-print-job.ts
├── use-printers.ts
├── use-agent.ts
├── use-pricing.ts
└── use-analytics.ts
```

Use query keys consistently.

Example:

```text
[
  "print-jobs",
  shopId,
  filters
]
```

Invalidate related queries after mutations.

---

# 25. Error Handling

Create reusable:

```text
ErrorState
EmptyState
LoadingState
NetworkError
Unauthorized
Forbidden
NotFound
```

Never show raw API stack traces.

---

# 26. Responsive Design

Customer:

```text
Mobile first
320px+
```

Dashboard:

```text
Mobile
Tablet
Desktop
Large Desktop
```

Test at:

```text
320
375
414
768
1024
1280
1440
1920
```

---

# 27. Accessibility

Implement:

- semantic HTML
- keyboard navigation
- visible focus states
- ARIA labels where needed
- accessible dialogs
- accessible forms
- color contrast
- screen-reader friendly status updates

Never communicate status using color alone.

Example:

```text
● Online
```

must also have text:

```text
Online
```

---

# 28. Loading UX

Use skeleton loaders for:

```text
Dashboard
Jobs
Printers
Analytics
```

Use progress indicators for:

```text
File upload
Payment
Print status
```

Avoid full-screen spinners for normal API requests.

---

# 29. Design System

Create reusable design tokens.

Components should consistently use:

```text
Button
Input
Select
Dialog
Sheet
Card
Badge
Tabs
Table
Dropdown
Toast
Skeleton
Progress
Alert
Breadcrumb
```

Prefer shadcn/ui components.

Do not build duplicate UI primitives.

---

# 30. Security Requirements

Never:

```text
Expose access tokens in UI
Store secrets in localStorage
Trust client prices
Trust client permissions
Expose private file URLs
Expose internal IDs unnecessarily
```

Use secure authentication strategy compatible with the Laravel API.

Document the selected authentication mechanism.

---

# 31. SEO

Customer portal pages should have dynamic metadata:

```text
Shop Name
Print Online
QR Se Print
```

Example:

```text
Print Online | ABC Cyber Cafe | QR Se Print
```

Dashboard routes should not be indexed.

Use:

```text
robots
noindex
```

for authenticated pages.

---

# 32. Performance

Implement:

- Server Components where appropriate
- Client Components only where interaction is required
- Dynamic imports for heavy charts
- Image optimization
- Lazy loading
- Query caching
- Pagination
- Debounced search

Do not unnecessarily convert every component into a Client Component.

---

# 33. Testing

Use:

```text
Vitest
React Testing Library
Playwright
```

Test:

```text
Upload validation
Print configuration
Price display
Login
Dashboard
Job filters
Job status polling
Printer status
Pricing form
Settings
```

Critical E2E:

```text
Customer scans shop QR
→ uploads PDF
→ configures print
→ reaches payment
→ job status updates
→ print completed
```

---

# 34. Development Mock Mode

Before Laravel APIs are complete, create a mock API layer.

Use:

```text
NEXT_PUBLIC_API_MOCK=true
```

Mock:

```text
Shop
Jobs
Printers
Agent
Analytics
Pricing
```

When:

```text
NEXT_PUBLIC_API_MOCK=false
```

use the real Laravel API.

Do not mix mock data into production services.

---

# 35. Definition of Done

A page is complete only when:

- Responsive
- Accessible
- Loading state implemented
- Empty state implemented
- Error state implemented
- API integration implemented
- Validation implemented
- TypeScript errors resolved
- ESLint passes
- Tests pass
- Production build passes

---

# 36. Implementation Order

Implement in exactly this order:

## Sprint 1

```text
Project setup
Design system
API client
Types
Mock API
```

## Sprint 2

```text
Customer Shop Landing
File Upload
File List
Print Configuration
Price Summary
```

## Sprint 3

```text
Payment
Print Status
Success
```

## Sprint 4

```text
Authentication
Dashboard Layout
Dashboard Home
```

## Sprint 5

```text
Jobs
Job Details
Printers
Agent
```

## Sprint 6

```text
Pricing
Analytics
Settings
```

## Sprint 7

```text
Error handling
Accessibility
SEO
Performance
```

## Sprint 8

```text
Unit tests
E2E tests
Production build
Final QA
```

---

# 37. Important Coding Instruction

Do not implement all sprints in one operation.

After each sprint:

1. Run tests.
2. Run lint.
3. Run TypeScript check.
4. Run production build.
5. Review changed files.
6. Fix errors.
7. Summarize completed work.
8. Stop.

Wait for the next instruction before starting the next sprint.

---

# 38. First Task

Start ONLY with Sprint 1.

Do not create the complete customer portal or dashboard yet.

Implement:

```text
Next.js project foundation
Tailwind
shadcn/ui
TypeScript
API client
Types
Mock API
Global error handling
Loading/empty/error UI primitives
Base layout
```

Then run:

```text
npm run lint
npm run build
```

If package scripts differ, inspect package.json and use the appropriate equivalent.

Report:

```text
Files created
Files modified
Dependencies installed
Tests/checks executed
Build result
Known issues
```

STOP after Sprint 1.