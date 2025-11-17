// app/api/exercises/search/route.ts
import { NextResponse } from 'next/server';
import pool from '@/app/lib/db';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 15; // Return 15 results per page
  const offset = (page - 1) * limit;

  if (!query) {
    return NextResponse.json({ results: [], hasMore: false });
  }

  const client = await pool.connect();
  try {
    const searchQuery = `
      SELECT id, name 
      FROM exercises 
      WHERE name ILIKE $1 
      ORDER BY 
        CASE 
          WHEN name ILIKE $2 THEN 1
          ELSE 2
        END,
        name
      LIMIT $3 OFFSET $4;
    `;
    
    const result = await client.query(searchQuery, [`%${query}%`, `${query}%`, limit + 1, offset]);
    
    const hasMore = result.rows.length > limit;
    const results = result.rows.slice(0, limit);

    return NextResponse.json({ results, hasMore });
  } catch (error) {
    console.error('Error searching exercises:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    client.release();
  }
}
