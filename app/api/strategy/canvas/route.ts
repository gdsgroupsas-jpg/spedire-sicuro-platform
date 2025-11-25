// API Route for Business Model Canvas management
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getCanvasItems,
  createCanvasItem,
  updateCanvasItem,
  deleteCanvasItem,
} from '@/lib/services/strategy-service';
import {
  createCanvasItemSchema,
  updateCanvasItemSchema,
  canvasSegmentSchema,
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
    const segment = searchParams.get('segment');

    // Validate segment if provided
    let validatedSegment = undefined;
    if (segment) {
      try {
        validatedSegment = canvasSegmentSchema.parse(segment);
      } catch {
        return NextResponse.json({ error: 'Invalid segment' }, { status: 400 });
      }
    }

    const items = await getCanvasItems(validatedSegment);

    return NextResponse.json({ data: items }, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/strategy/canvas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch canvas items' },
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
    const validatedData = createCanvasItemSchema.parse(body);

    const item = await createCanvasItem(validatedData, user.id);

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/strategy/canvas:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create canvas item' },
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
    const validatedData = updateCanvasItemSchema.parse(body);

    const item = await updateCanvasItem(validatedData.id, validatedData, user.id);

    return NextResponse.json({ data: item }, { status: 200 });
  } catch (error: any) {
    console.error('Error in PUT /api/strategy/canvas:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update canvas item' },
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

    await deleteCanvasItem(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in DELETE /api/strategy/canvas:', error);
    return NextResponse.json(
      { error: 'Failed to delete canvas item' },
      { status: 500 }
    );
  }
}
