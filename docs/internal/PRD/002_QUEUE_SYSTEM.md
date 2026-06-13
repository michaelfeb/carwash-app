# Queue System for Car Wash Transactions

**Status**: Draft
**Version**: 1.0

---

## Overview

A queue management system that assigns every transaction an auto-incrementing queue number at creation. An admin screen displays waiting cars and allows manual assignment to one of two fixed wash bays (Bay 1 / Bay 2). Once a wash is complete, the queue entry is cleared while the transaction record is preserved.

---

## Background

The current car wash process has no built-in queue mechanism. Transactions are created with a `wash_status` field (`waiting` → `washing` → `done`) but without any concept of queue ordering or physical bay allocation. Staff and cashiers need a dedicated screen to see which cars are waiting, assign them to a specific wash bay, and track which bay is occupied. This replaces implicit manual coordination with a clear, visual queue.

The existing `information.md` documents a manual flow where customers drop cars, staff wash them, and cashiers record payments — all without formal queue tracking. This feature digitizes the queue portion of that flow.

---

## User Story

- As a **cashier/admin**, I want to see a real-time queue of waiting cars and assign each to Bay 1 or Bay 2, so that I can coordinate the wash workflow efficiently without confusion about which car is being washed where.

---

## Goals

1. Automatically assign a daily-incrementing queue number to every new transaction.
2. Provide a visual queue screen showing Bay 1 / Bay 2 status and the waiting list.
3. Allow manual assignment of any waiting car to any free bay (not strict FIFO — admin chooses).
4. Clear queue data automatically when a wash is marked done.

---

## Functional Requirements

### Queue Number Generation

- On transaction creation (`TransactionController@store`), auto-generate a `queue_number`.
- Queue numbers reset daily: the first transaction each day gets queue #1, then increments.
- Implementation: query `MAX(queue_number)` for today's transactions where `queue_number IS NOT NULL`, add 1.

### Bay Slots

- Two fixed bays hardcoded: `bay_1` and `bay_2`.
- Each bay can hold exactly one car at a time.
- A bay is considered occupied if a transaction has `slot = 'bay_1'` (or `bay_2`) and `wash_status != 'done'`.
- Design must allow adding more bays in the future by extending a constant/array.

### Queue Screen (Admin Interface)

- **Bay Cards (top row)**: Show the currently assigned car per bay (invoice number, carwash type, license plate, assigned staff) or "Kosong" (Empty) placeholder. Each card has a "Mark Done" / "Selesai" button.
- **Waiting List (table below)**: Lists all transactions with `queue_number` not null, `slot` null, and `wash_status != 'done'`, ordered by `queue_number` ASC. Columns: Queue #, Invoice, Service Type, License Plate, Customer, Actions (Assign to Bay 1 / Assign to Bay 2 buttons).
- All actions use `router.put()` with `preserveState: true` and `preserveScroll: true`.

### Assign Flow

- Admin clicks "Assign to Bay X" on a waiting transaction.
- Backend validates: (a) target bay is free, (b) transaction is in waiting state.
- On success: sets `slot = 'bay_X'`, `wash_status = 'washing'`.

### Release Flow

- Admin clicks "Mark Done" on a bay card.
- Backend validates: transaction is assigned to a bay.
- On success: sets `wash_status = 'done'`, clears `queue_number = null`, clears `slot = null`.
- The transaction disappears from the queue screen (but remains in the transactions table/database).

### Column Definitions

| Column | Type | Nullable | Purpose |
|--------|------|----------|---------|
| `queue_number` | unsignedInteger | yes | Daily auto-increment queue position; cleared on wash done |
| `slot` | string(20) | yes | Assigned bay (`bay_1` or `bay_2`); cleared on wash done |

---

## Non-Functional Requirements

- Queue operations must be fast — single-row updates, no complex joins.
- Bay slot constraint (one car per bay) enforced in application layer, not at DB level.
- The queue screen must auto-refresh on assign/release via Inertia partial reloads.
- No additional database tables — queue data lives on the existing `transactions` table to keep the schema simple.

---

## Workflow / Mechanism

```
1. Cashier creates transaction → queue_number auto-assigned (daily increment)
2. Transaction appears in Queue Screen → Waiting List table
3. Cashier clicks "Assign to Bay 1" → slot = 'bay_1', wash_status = 'washing'
4. Car appears in Bay 1 card on queue screen
5. When wash completes, cashier clicks "Mark Done"
6. wash_status = 'done', queue_number = null, slot = null
7. Transaction leaves the queue screen (still in DB + transaction history)
```

---

## Impacted Components

### New Files

| File | Purpose |
|------|---------|
| `database/migrations/xxxx_xx_xx_xxxxxx_add_queue_columns_to_transactions_table.php` | Migration for `queue_number` and `slot` columns |
| `app/Http/Controllers/QueueController.php` | Queue screen rendering, bay assignment, and release logic |
| `resources/js/pages/queue/index.tsx` | React/Inertia queue management page |

### Modified Files

| File | Change |
|------|--------|
| `app/Models/Transaction.php` | Add `queue_number`, `slot` to `$fillable` and `$casts`; add `generateQueueNumber()` static method, `isQueued()`, `isAssignedToSlot()` helpers, `scopeQueued()` scope |
| `app/Http/Controllers/TransactionController.php` | `store()`: include `queue_number` on create; `updateStatus()`: clear `queue_number` and `slot` when `wash_status = done` |
| `routes/web.php` | Add 3 routes: `GET /queue`, `PUT /queue/{transaction}/assign`, `PUT /queue/{transaction}/release` |
| `resources/js/types/index.d.ts` | Add `queue_number?: number \| null` and `slot?: string \| null` to Transaction interface |
| `resources/js/components/app-header.tsx` | Add "Antrian" nav item with `ListOrdered` icon to `mainNavItems` |

---

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Transaction created but never assigned to a bay | Stays in waiting list indefinitely; `queue_number` persists until manually handled or deleted |
| Admin tries to assign to an occupied bay | Backend returns validation error; bay stays unchanged |
| Admin tries to release a car not assigned to any bay | Backend returns error; no action taken |
| All waiting cars cleared (empty waiting list) | Table shows empty state message "Tidak ada antrian" |
| Both bays occupied, new transaction created | New transaction appears in waiting list; admin must wait for a bay to free up |
| Transaction deleted via existing delete flow | Queue data removed with the transaction (cascade via model delete) |
| Multiple transactions with same queue_number (race condition) | Prevented — `generateQueueNumber()` runs inside a DB transaction in `store()` |
| First transaction of the day | `queue_number` = 1 (MAX returns null → coalesce to 0 → +1) |

---

## Open Questions

- _None_ — all requirements clarified with user.

---

## Notes

- Bays are hardcoded as `['bay_1', 'bay_2']` in a constant on the QueueController for easy future extension.
- The queue screen reuses existing UI components: `AppLayout`, `PageHeader`, `FlashMessage`, `DataTable` (or a simple table).
- The existing `wash_status` enum (`waiting`, `washing`, `done`) continues to drive workflow; queue fields supplement it.
- No separate `queues` table — columns on `transactions` keep it simple and avoid extra joins.
- No separate wash staff screen needed — all managed from the admin/cashier queue interface.

---

## API Reference

```
GET /queue
Authorization: Authenticated session (auth + verified middleware)

Response 200:
{
    bays: [{ key: 'bay_1', label: 'Bay 1' }, { key: 'bay_2', label: 'Bay 2' }],
    activeSlots: { bay_1: Transaction | null, bay_2: Transaction | null },
    waitingList: Transaction[]
}
```

```
PUT /queue/{transaction}/assign
Authorization: Authenticated session

Request:
{ slot: 'bay_1' | 'bay_2' }

Response 302 (redirect back):
  success: 'Transaction assigned to Bay 1.'

Validation error 422:
  { errors: { slot: ['Bay 1 is already occupied.'] } }
```

```
PUT /queue/{transaction}/release
Authorization: Authenticated session

Response 302 (redirect back):
  success: 'Transaction released from queue.'
```

---

## Version History

| Version | Date | Author | Notes |
|---------|------|--------|-------|
| 1.0 | 2026-06-10 | Backend Team | Initial PRD |
