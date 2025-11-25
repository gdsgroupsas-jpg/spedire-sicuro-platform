// API Route for Media Budget management
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getMediaBudgets,
  createMediaBudget,
  updateMediaBudget,
  deleteMediaBudget,
  getCurrentMonthBudget,
  getUnreadAlerts,
  markAlertAsRead,
  markAllAlertsAsRead,
} from '@/lib/services/strategy-service';
import {
  createMediaBudgetSchema,
  updateMediaBudgetSchema,
} from '@/lib/schemas/strategy';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const current = searchParams.get('current');

    // Get current month budget
    if (current === 'true') {
      const budget = await getCurrentMonthBudget();
      return NextResponse.json({ data: budget }, { status: 200 });
    }

    // Get all or filtered budgets
    const yearNum = year ? parseInt(year, 10) : undefined;
    const monthNum = month ? parseInt(month, 10) : undefined;

    const budgets = await getMediaBudgets(yearNum, monthNum);

    return NextResponse.json({ data: budgets }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/strategy/budget:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate request body
    const validatedData = createMediaBudgetSchema.parse(body);

    const budget = await createMediaBudget(validatedData, user.id);

    return NextResponse.json({ data: budget }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/strategy/budget:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create media budget' },
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

    // Validate request body
    const validatedData = updateMediaBudgetSchema.parse(body);

    const budget = await updateMediaBudget(validatedData.id, validatedData, user.id);

    return NextResponse.json({ data: budget }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/strategy/budget:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update media budget' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await deleteMediaBudget(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/strategy/budget:', error);
    return NextResponse.json(
      { error: 'Failed to delete media budget' },
      { status: 500 }
    );
  }
}
