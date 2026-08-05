import { createAdminClient } from '@/lib/supabase/admin'
import type { Order } from '@/lib/orders'

type RefundResult =
| { ok: true; order: Order; alreadyProcessed: boolean }
| { ok: false; error: string }

/**
 * Marks an order as Refunded and restores stock for its line items. Idempotent —
 * safe to call multiple times for the same reference (Paystack may redeliver the
 * refund.processed webhook, or the DB write could partially fail and get retried).
 */
export async function refundPaystackOrder(reference: string): Promise<RefundResult> {
if (!reference) return { ok: false, error: 'Missing payment reference.' }

const admin = createAdminClient()

const { data: order, error: orderError } = await admin
    .from('orders')
    .select('*')
    .eq('payment_reference', reference)
    .maybeSingle()

if (orderError) {
    return { ok: false, error: orderError.message }
}

if (!order) {
    // The refund webhook can in principle arrive before the charge.success webhook
    // finishes creating the order. Treat as retryable rather than a hard failure.
    return { ok: false, error: 'No order found for this payment reference yet.' }
}

if (order.status === 'Refunded') {
    return { ok: true, order: order as Order, alreadyProcessed: true }
}

  // Restore stock before flipping status, so a crash mid-way never leaves stock
  // permanently short with no order-status signal that something's off.
for (const item of order.items as Array<{ product_id?: string; quantity: number | string }>) {
    if (!item.product_id) continue
    const quantity = Number(item.quantity)
    if (!Number.isFinite(quantity)) continue
    const { error: stockError } = await admin.rpc('increment_stock', {
        p_product_id: item.product_id,
        p_quantity: quantity,
    })
    if (stockError) {
        console.error('Stock restore failed for', item.product_id, stockError.message)
    }
}

const { data: updated, error: updateError } = await admin
    .from('orders')
    .update({ status: 'Refunded' })
    .eq('payment_reference', reference)
    .select()
    .single()

if (updateError || !updated) {
    return { ok: false, error: updateError?.message || 'Failed to update order status.' }
}

await admin.from('payments').update({ status: 'refunded' }).eq('reference', reference)

return { ok: true, order: updated as Order, alreadyProcessed: false }
}
//this is lib\orders\refund-paystack-order.ts