-- Atomic, race-free stock decrement for a paid order.
--
-- Called ONLY from the PayFast ITN handler via the service-role client, so
-- RLS is bypassed at the connection level and this function does not need
-- SECURITY DEFINER.
--
-- A single RPC call executes as one Postgres statement, which is always one
-- transaction. Pass 1 locks every variant row this order touches with
-- SELECT ... FOR UPDATE and checks availability; pass 2 performs the
-- decrements. Because the locks from pass 1 are held for the rest of the
-- transaction, a concurrent call for the same variant blocks at its own
-- FOR UPDATE until this call's transaction ends, then re-reads the
-- now-updated stock_qty -- so two orders racing for the last unit cannot
-- both succeed, and stock_qty cannot go negative.
--
-- If ANY line is short, NOTHING is decremented (ok=false, failed_variant_ids
-- lists the short lines) -- the caller marks the order stock_conflict rather
-- than partially fulfilling it.
create or replace function decrement_stock_for_order(p_order_id uuid)
returns table (ok boolean, failed_variant_ids uuid[])
language plpgsql
as $$
declare
  v_failed uuid[] := '{}';
  v_variant_id uuid;
  v_needed integer;
  v_available integer;
begin
  for v_variant_id, v_needed in
    select oi.variant_id, oi.qty from order_items oi where oi.order_id = p_order_id
  loop
    select stock_qty into v_available
    from product_variants
    where id = v_variant_id
    for update;

    if v_available is null or v_available < v_needed then
      v_failed := array_append(v_failed, v_variant_id);
    end if;
  end loop;

  if array_length(v_failed, 1) > 0 then
    return query select false, v_failed;
    return;
  end if;

  update product_variants pv
  set stock_qty = pv.stock_qty - oi.qty
  from order_items oi
  where oi.order_id = p_order_id and pv.id = oi.variant_id;

  return query select true, '{}'::uuid[];
end;
$$;
