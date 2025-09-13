import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const routeId = searchParams.get('route_id');
    
    const url = routeId 
      ? `${API_BASE_URL}/demand/forecast?route_id=${routeId}`
      : `${API_BASE_URL}/demand/forecast`;
      
    const response = await fetch(url);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching demand forecast:', error);
    return NextResponse.json({ error: 'Failed to fetch demand forecast' }, { status: 500 });
  }
}

