// app/api/workouts/generate/route.ts
import { NextResponse } from 'next/server';

// The new external API endpoint and host
const AI_WORKOUT_API_HOST = 'ai-workout-planner.p.rapidapi.com';
const AI_WORKOUT_API_URL = `https://${AI_WORKOUT_API_HOST}/generateWorkoutPlan`;

export async function POST(req: Request) {
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    console.error('RapidAPI key is missing.');
    return NextResponse.json(
      { error: 'Server configuration error: Missing API key.' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { time, muscle, type, difficulty } = body;

    if (!time || !muscle || !type || !difficulty) {
      return NextResponse.json({ error: 'Missing required parameters: time, muscle, type, difficulty' }, { status: 400 });
    }

    const externalApiUrl = new URL(AI_WORKOUT_API_URL);
    externalApiUrl.searchParams.append('time', time);
    externalApiUrl.searchParams.append('targetMuscle', muscle);
    externalApiUrl.searchParams.append('fitnessLevel', difficulty);
    
    const response = await fetch(externalApiUrl.toString(), {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': AI_WORKOUT_API_HOST,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AI Workout Planner API Error:', errorData);
      return NextResponse.json(
        { error: `Failed to generate workout plan: ${errorData.message || 'Unknown error'}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data.plan || data);

  } catch (error) {
    console.error('Error in workout generation proxy:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while generating workout.' },
      { status: 500 }
    );
  }
}
