import { NextRequest, NextResponse } from 'next/server';
import { getExerciseProvider } from '@/lib/exercises/provider';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 20;

    const provider = getExerciseProvider();
    const exercises = await provider.searchExercises(query, { limit, includeVideos: false });

    return NextResponse.json({ query, exercises, total: exercises.length }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('[API /api/exercises/search] Error:', error);
    return NextResponse.json(
      { error: 'Failed to search exercises', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
