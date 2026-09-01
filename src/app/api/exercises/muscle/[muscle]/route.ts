import { NextRequest, NextResponse } from 'next/server';
import { getExerciseProvider } from '@/lib/exercises/provider';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ muscle: string }> }
) {
  try {
    const { muscle } = await context.params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20;

    if (!muscle) {
      return NextResponse.json({ error: 'Muscle group is required' }, { status: 400 });
    }

    const provider = getExerciseProvider();
    const exercises = await provider.getExercisesByMuscle(decodeURIComponent(muscle), { limit, includeVideos: false });

    return NextResponse.json({ muscle: decodeURIComponent(muscle), exercises, total: exercises.length }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[API /api/exercises/muscle] Error:', error);
    return NextResponse.json(
      { error: 'Failed to filter exercises by muscle', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
