-- Tracks when a Pathao consignment was confirmed cancelled by Pathao.
-- Lets the admin dashboard distinguish a truly-cancelled shipment from an
-- order that is only cancelled locally (e.g. cancelled before the Pathao
-- cancel flow existed) but is still active in Pathao Courier.
alter table public.orders
  add column if not exists pathao_cancelled_at timestamptz;

-- Optional reconciliation: if you have already confirmed (in the Pathao
-- merchant panel) that a cancelled order's shipment is cancelled, you can
-- backfill it here so the dashboard shows "Cancelled" instead of "Cancel
-- pending". Example for a single order:
--   update public.orders
--   set pathao_cancelled_at = now()
--   where order_number = 'CR-20260626-EHWQ';
