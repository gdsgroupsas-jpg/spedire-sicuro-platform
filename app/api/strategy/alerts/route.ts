// API Route for Budget Alerts management
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getUnreadAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
} from '@/lib/services/strategy-service';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const alerts = await getUnreadAlerts();

    return NextResponse.json({ data: alerts }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/strategy/alerts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, markAllAsRead } = body;

    if (markAllAsRead) {
      await markAllAlertsAsRead(user.id);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (!id) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 });
    }

    await markAlertAsRead(id, user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in PUT /api/strategy/alerts:', error);
    return NextResponse.json(
      { error: 'Failed to mark alert as read' },
      { status: 500 }
    );
  }
}
