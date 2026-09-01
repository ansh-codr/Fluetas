import { NextRequest, NextResponse } from 'next/server';
import { getExerciseProvider } from '@/lib/exercises/provider';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const includeVideo = searchParams.get('includeVideo') !== 'false'; // default true for detail

    if (!id) {
      return NextResponse.json({ error: 'Exercise ID is required' }, { status: 400 });
    }

    const provider = getExerciseProvider();
    const exercise = await provider.getExerciseById(id, includeVideo);

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    // Do NOT cache responses containing temporary signed video URLs
    return NextResponse.json(exercise, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[API /api/exercises/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve exercise details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
