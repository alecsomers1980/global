import { NextRequest, NextResponse } from 'next/server';
import { createOrder, Order } from '@/lib/orders';
import { sql } from '@vercel/postgres';
import { sendAdminOrderNotification } from '@/lib/email';
import { payfast } from '@/lib/payfast';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
    try {
        const rateLimitResult = checkRateLimit(request, 5, 60000);
        if (!rateLimitResult.success) {
            return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { 
                status: 429,
                headers: rateLimitResult.headers
            });
        }

        const body = await request.json();

        // Validate required fields
        const {
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            items,
            subtotal,
            shipping,
            total
        } = body;

        if (!customerName || !customerEmail || !customerPhone || !customerAddress || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Create the order
        const order = createOrder({
            customerName,
            customerEmail,
            customerPhone,
            customerAddress,
            items,
            subtotal,
            shipping,
            total
        });

        // Save order to Database
        try {
            await sql`
                INSERT INTO orders (id, order_number, customer_email, status, payment_status, total, created_at, updated_at, data)
                VALUES (
                    ${order.id}, 
                    ${order.orderNumber}, 
                    ${order.customerEmail}, 
                    ${order.status}, 
                    ${order.paymentStatus}, 
                    ${order.total}, 
                    ${order.createdAt}, 
                    ${order.updatedAt}, 
                    ${JSON.stringify(order)}
                )
            `;
        } catch (dbError) {
            console.error('Database error:', dbError);
            return NextResponse.json(
                { error: 'Database connection failed' },
                { status: 500 }
            );
        }

        // Trigger Admin Notification immediately (Pending Order)
        try {
            // Notify Admin of new order (Pending)
            await sendAdminOrderNotification(order);
            console.log('Admin notification queued');
        } catch (emailError) {
            console.error('Failed to send admin notification:', emailError);
            // Don't fail the request
        }

        console.log('Order created:', order.orderNumber);

        // Generate PayFast data
        const [firstName, ...lastNameParts] = customerName.split(' ');
        const payfastData = payfast.createPaymentData({
            orderId: order.id,
            amount: order.total,
            customerFirstName: firstName,
            customerLastName: lastNameParts.join(' ') || firstName,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            itemName: `Aloe Signs Order - ${items.length} items`,
        });

        const response = NextResponse.json({
            success: true,
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                total: order.total
            },
            payfastData,
            payfastUrl: payfast.getPaymentUrl()
        });

        // Set pending order cookie for payment return fallback
        response.cookies.set('pending_order_id', order.id, {
            httpOnly: true,
            path: '/',
            maxAge: 3600 // 1 hour
        });

        return response;

    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}

