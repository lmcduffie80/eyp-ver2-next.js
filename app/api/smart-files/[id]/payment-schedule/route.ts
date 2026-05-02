import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/smartFiles/requireAdmin';
import { listPaymentSchedule, upsertPaymentScheduleItem, deletePaymentScheduleItem } from '@/lib/smartFiles/repo';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const { id } = await params;
    const items = await listPaymentSchedule(Number(id));
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to list payment schedule' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const { id } = await params;
    const body = await request.json();
    if (!body.label || !body.amountCents || !body.dueDate) {
      return NextResponse.json({ success: false, error: 'label, amountCents, dueDate required' }, { status: 400 });
    }
    const item = await upsertPaymentScheduleItem(Number(id), body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to upsert payment schedule item' }, { status: 500 });
  }
}

// DELETE ?scheduleId=123
export async function DELETE(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const schedId = request.nextUrl.searchParams.get('scheduleId');
    if (!schedId) return NextResponse.json({ success: false, error: 'scheduleId required' }, { status: 400 });
    await deletePaymentScheduleItem(Number(schedId));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete payment schedule item' }, { status: 500 });
  }
}
