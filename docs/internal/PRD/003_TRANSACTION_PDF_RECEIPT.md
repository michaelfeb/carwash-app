# Transaction PDF Receipt

**Status**: Draft
**Version**: 1.0
**Plan Status**: Approved
**Plan Version**: 1
**Mode**: full-stack
**Requirement Source**: Chat brief

---

## Overview

Provide a downloadable PDF receipt for every completed RK Carwash transaction.

## Background

Transactions currently have detail and list interfaces with separate wash and payment statuses. The application already uses DomPDF for report exports, so the receipt can reuse the existing server-side PDF stack without adding a dependency.

## User Story

As an authenticated cashier or owner, I want to download a receipt for a completed and paid transaction so I can provide proof of service and payment to the customer.

## Scope

- Provide an authenticated, on-demand receipt download.
- Require `wash_status=done` and `payment_status=paid` for receipt eligibility.
- Generate an A6 RK Carwash PDF containing the invoice, date, customer, vehicle and service, cashier, payment method, original price and discount when applicable, and final total.
- Expose download actions on the transaction list and detail views.
- Verify the feature with backend tests, TypeScript, formatting, and a production build.

## Out of Scope

- Database schema changes.
- New PDF or frontend dependencies.
- Persisting generated PDF files.
- Email or WhatsApp sharing.
- Receipts for unfinished or unpaid transactions.

## Acceptance Criteria

- [ ] An eligible transaction downloads a PDF named `struk-{invoice_number}.pdf`.
- [ ] Guests requesting a receipt are redirected to login.
- [ ] An ineligible direct request returns HTTP `409 Conflict`.
- [ ] Receipt data matches the transaction and handles nullable fields.
- [ ] List and detail download actions appear only for eligible transactions.
- [ ] Backend tests, TypeScript checks, formatting checks, and the production build pass.

## Functional Requirements

- Add `GET /transactions/{transaction}/receipt` inside the existing authenticated and verified route group.
- Load the customer, carwash type, payment method, and cashier relationships for receipt rendering.
- Render the receipt through the installed `barryvdh/laravel-dompdf` package.
- Add list and detail download actions using the existing Button, Tooltip, and Lucide conventions.

## Non-Functional Requirements

- Preserve existing routes, status updates, Inertia state flow, and the shadcn/Tailwind UI stack.
- Do not add a database migration or package dependency.
- Wrap long PDF values and keep the receipt printable at A6 size.

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Wash unfinished | Download action is hidden and the endpoint returns `409`. |
| Payment unpaid | Download action is hidden and the endpoint returns `409`. |
| Customer absent | Display `Pelanggan Umum`. |
| License plate absent | Display `-`. |
| Payment method absent | Display `-`. |
| Loyalty discount applied | Display the original price, discount, and final total. |
| Guest request | Redirect to login. |

## Existing-System Findings

| Area | Evidence | Planning Implication |
|------|----------|----------------------|
| Transactions | `app/Http/Controllers/TransactionController.php`, `resources/js/pages/transactions/` | Extend the owning controller and pages. |
| PDF generation | `app/Http/Controllers/ReportController.php`, `resources/views/reports/` | Reuse DomPDF and Blade conventions. |
| Routing and security | `routes/web.php` | Keep the endpoint inside the `auth` and `verified` middleware group. |
| UI system | `components.json`, `resources/js/components/ui/` | Preserve the owned shadcn/Radix and Tailwind components. |
| Branding | `resources/views/reports/partials/header.blade.php`, `public/assets/logo.jpeg` | Reuse the RK Carwash identity. |

## Frontend Stack Profile

- React: 19.2
- App framework/build: Inertia React 2.1 with Vite 7
- Language: TypeScript
- UI system: shadcn-style owned components with Radix primitives
- Styling: Tailwind CSS 4 and CSS variables from `resources/css/app.css`
- Component source: `resources/js/components/ui/`
- Routing and data: Laravel routes and Inertia props; local React state for transaction filters and status controls
- Notifications/icons: existing flash messages and Lucide React
- Tests: no frontend test runner is configured; verify with TypeScript, format, build, and manual checks
- Evidence: `package.json`, `components.json`, `resources/css/app.css`, and the transaction pages
- Migration authorized: No

## Design and Architecture

### Ownership

`TransactionController` validates receipt eligibility and generates the document. A transaction-local Blade view owns PDF presentation. The transaction list and detail React pages own action visibility.

### Flow

The user clicks the receipt action, the browser requests the authenticated receipt route, the controller verifies completed and paid state and loads required relationships, DomPDF renders the Blade view, and the attachment response downloads.

### Decisions and Rationale

| Decision | Rationale |
|----------|-----------|
| Generate receipts server-side on demand. | Reuses the installed PDF stack and avoids browser-specific rendering or file storage. |
| Use A6 portrait paper. | Provides a compact and printable receipt format. |
| Return HTTP `409` for an ineligible transaction. | The request conflicts with the transaction's current state rather than failing authentication or input validation. |
| Expose actions on list and detail views. | Makes the receipt discoverable in both transaction workflows. |

## Contract and Data Changes

`GET /transactions/{transaction}/receipt` returns an `application/pdf` attachment named `struk-{invoice_number}.pdf`. Guests follow existing authentication redirect behavior. Transactions that are not both completed and paid return HTTP `409`. There are no schema, DTO, or shared-state changes.

## Impacted Components

### New Files

| File | Purpose |
|------|---------|
| `resources/views/transactions/receipt.blade.php` | Branded PDF receipt presentation. |
| `tests/Feature/TransactionReceiptTest.php` | Receipt endpoint and eligibility coverage. |

### Modified Files

| File | Change |
|------|--------|
| `routes/web.php` | Register the authenticated receipt route. |
| `app/Http/Controllers/TransactionController.php` | Validate eligibility, load relationships, and return the PDF attachment. |
| `resources/js/pages/transactions/index.tsx` | Add the conditional receipt action to eligible rows. |
| `resources/js/pages/transactions/show.tsx` | Add the conditional receipt action to eligible transaction details. |

## Approved Implementation Tasks

### Task 1 — Add the receipt route and controller contract

Description: Register the authenticated download route, validate the completed and paid state, load receipt relationships, and return an A6 DomPDF attachment.

Acceptance criteria:
- [ ] Eligible authenticated requests receive the named PDF attachment.
- [ ] Ineligible requests return `409`, and guests follow the login redirect.

Files:
- New: `tests/Feature/TransactionReceiptTest.php`
- Modified: `routes/web.php`, `app/Http/Controllers/TransactionController.php`

Dependencies: None.

Verification:
- Automated: `php artisan test --filter=TransactionReceiptTest`
- Manual: Inspect the response filename and PDF content.

Risk and rollback: Route behavior is isolated; remove the route and controller action to roll back.

### Task 2 — Add the branded receipt template

Description: Render RK Carwash branding and approved transaction fields with nullable and loyalty-discount handling on A6 portrait paper.

Acceptance criteria:
- [ ] The receipt shows all approved fields and handles every documented nullable or discount edge case.

Files:
- New: `resources/views/transactions/receipt.blade.php`
- Modified: None.

Dependencies: Task 1.

Verification:
- Automated: `php artisan test --filter=TransactionReceiptTest`
- Manual: Open an eligible generated PDF and inspect its A6 layout.

Risk and rollback: Long values may affect layout; wrapping styles mitigate this, and removing the view rolls back presentation.

### Task 3 — Add conditional transaction UI actions

Description: Add receipt download actions to the list and detail views only when the transaction is completed and paid.

Acceptance criteria:
- [ ] Eligible transactions expose the action in both views and ineligible transactions do not.

Files:
- New: None.
- Modified: `resources/js/pages/transactions/index.tsx`, `resources/js/pages/transactions/show.tsx`

Dependencies: Task 1.

Verification:
- Automated: `npm run types`, `npm run build`
- Manual: Check eligible and ineligible rows/details, including keyboard-accessible labels.

Risk and rollback: UI changes are conditional and isolated; remove the added actions to roll back.

### Task 4 — Run regression verification and review

Description: Run targeted and full backend tests, frontend static/build checks, and review the final diff for scope and stack preservation.

Acceptance criteria:
- [ ] All configured verification passes and the diff contains only approved receipt work.

Files:
- New: None.
- Modified: None.

Dependencies: Tasks 1–3.

Verification:
- Automated: `php artisan test --filter=TransactionReceiptTest`, `php artisan test`, `npm run types`, `npm run format:check`, `npm run build`
- Manual: Eligible/ineligible download, PDF layout, final diff, and UI-stack review.

Risk and rollback: Any failure blocks completion until corrected; source changes remain individually reversible.

## Requirement Coverage

| Requirement or Edge Case | Task | Verification |
|--------------------------|------|--------------|
| Authenticated PDF endpoint and eligibility | Task 1 | Targeted feature test |
| Receipt content and nullable/discount cases | Task 2 | Feature test and PDF inspection |
| List and detail action visibility | Task 3 | Type/build checks and manual UI check |
| Compatibility and regression safety | Task 4 | Full backend and frontend verification |

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Long customer or service values overflow the receipt. | Medium | Use wrapping styles and a compact table layout. |
| A saved direct URL is used after transaction state changes. | Low | Recheck eligibility server-side on every request. |

## Open Questions

- None

## Final Verification

- [ ] `php artisan test --filter=TransactionReceiptTest`
- [ ] `php artisan test`
- [ ] `npm run types`
- [ ] `npm run format:check`
- [ ] `npm run build`
- [ ] Manually verify eligible and ineligible downloads and inspect the PDF layout.
- [ ] Review the final diff and confirm no UI frameworks were mixed.

## API Reference

### `GET /transactions/{transaction}/receipt`

- Authentication: existing Laravel session authentication with verified user middleware.
- Path parameter: route-bound transaction ID.
- Success: HTTP `200`, `Content-Type: application/pdf`, attachment filename `struk-{invoice_number}.pdf`.
- Ineligible state: HTTP `409 Conflict`.
- Guest: redirect to the login route.

## Version History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | 2026-08-01 | Full-stack Team | Initial PRD from approved implementation plan |
