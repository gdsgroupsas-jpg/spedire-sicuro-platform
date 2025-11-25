// API Route for Mission & Vision management
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getCompanyStrategy,
  createCompanyStrategy,
  updateCompanyStrategy,
} from '@/lib/services/strategy-service';
import {
  createCompanyStrategySchema,
  updateCompanyStrategySchema,
} from '@/lib/schemas/strategy';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const strategy = await getCompanyStrategy();

    return NextResponse.json({ data: strategy }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/strategy/mission-vision:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company strategy' },
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
    const validatedData = createCompanyStrategySchema.parse(body);

    const strategy = await createCompanyStrategy(validatedData, user.id);

    return NextResponse.json({ data: strategy }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/strategy/mission-vision:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create company strategy' },
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
    const validatedData = updateCompanyStrategySchema.parse(body);

    const strategy = await updateCompanyStrategy(
      validatedData.id,
      validatedData,
      user.id
    );

    return NextResponse.json({ data: strategy }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/strategy/mission-vision:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update company strategy' },
      { status: 500 }
    );
  }
}
