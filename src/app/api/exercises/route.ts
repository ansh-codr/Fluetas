import { NextRequest, NextResponse } from 'next/server';
import { getExerciseProvider } from '@/lib/exercises/provider';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const muscle = searchParams.get('muscle') || undefined;
    const equipment = searchParams.get('equipment') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20;
    const includeVideos = searchParams.get('includeVideos') === 'true';

    const provider = getExerciseProvider();
    const result = await provider.getExercises({
      search,
      muscle,
      equipment,
      difficulty,
      page,
      limit,
      includeVideos,
    });

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[API /api/exercises] Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve exercise library', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
