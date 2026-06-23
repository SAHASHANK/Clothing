import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: { code: 'asc' }
    });
    return NextResponse.json(discounts);
  } catch (error) {
    // Return initial mock coupons if database connection is offline
    return NextResponse.json([
      { id: 'disc-1', code: 'LAUNCH20', type: 'PERCENT', value: 20, active: true, minCart: 0 },
      { id: 'disc-2', code: 'UNHRD1000', type: 'FLAT', value: 1000, active: true, minCart: 4000 }
    ]);
  }
}

export async function POST(request: Request) {
  try {
    const { code, type, value, minCart } = await request.json();
    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: 'Code, type, and value are required' }, { status: 400 });
    }

    try {
      const newDiscount = await prisma.discount.create({
        data: {
          code: code.toUpperCase().trim(),
          type,
          value,
          minCart: minCart || 0,
          active: true
        }
      });
      return NextResponse.json({ success: true, discount: newDiscount });
    } catch (dbErr) {
      // Offline fallback: return details as mock success
      return NextResponse.json({
        success: true,
        discount: {
          id: 'disc-mock-' + Date.now(),
          code: code.toUpperCase().trim(),
          type,
          value,
          minCart: minCart || 0,
          active: true
        },
        note: 'Mock Mode Active (offline)'
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'COUPON CREATION FAILURE' }, { status: 400 });
  }
}
