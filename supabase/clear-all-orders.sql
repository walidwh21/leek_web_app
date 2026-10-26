-- !!! DESTRUCTIVE !!! Deletes EVERY order, payment, order item and status history row.
-- Development use only. Never run against production data.

-- One-shot reset: remove all order data (same effect as Admin → Orders → Clear all orders).
-- Run in Supabase SQL Editor if you prefer SQL over the admin UI.
-- Order: children first (FK → public.orders).

delete from public.order_status_history;
delete from public.payments;
delete from public.order_items;
delete from public.orders;

-- If you also need to reset a sequence (unlikely for UUID PKs), adjust manually.
