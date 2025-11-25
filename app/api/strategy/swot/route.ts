// API Route for SWOT Analysis management
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getSwotItems,
  createSwotItem,
  updateSwotItem,
  deleteSwotItem,
} from '@/lib/services/strategy-service';
import {
  createSwotItemSchema,
  updateSwotItemSchema,
  swotCategorySchema,
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
    const category = searchParams.get('category');

    // Validate category if provided
    let validatedCategory = undefined;
    if (category) {
      try {
        validatedCategory = swotCategorySchema.parse(category);
      } catch {
        return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
      }
    }

    const items = await getSwotItems(validatedCategory);

    return NextResponse.json({ data: items }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/strategy/swot:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SWOT items' },
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
    const validatedData = createSwotItemSchema.parse(body);

    const item = await createSwotItem(validatedData, user.id);

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/strategy/swot:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create SWOT item' },
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
    const validatedData = updateSwotItemSchema.parse(body);

    const item = await updateSwotItem(validatedData.id, validatedData, user.id);

    return NextResponse.json({ data: item }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/strategy/swot:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update SWOT item' },
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

    await deleteSwotItem(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/strategy/swot:', error);
    return NextResponse.json(
      { error: 'Failed to delete SWOT item' },
      { status: 500 }
    );
  }
}
