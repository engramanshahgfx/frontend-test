// app/api/tourism-destinations/route.js
import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const slug = searchParams.get('slug');

    let url = `${API_URL}/tourism-destinations`;
    if (slug) {
      url = `${API_URL}/tourism-destinations/${slug}`;
    } else if (region) {
      url = `${API_URL}/tourism-destinations/region/${region}`;
    }

    console.log('[API Route] Fetching from:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    console.log('[API Route] Response:', data);

    // If the response has image_url, keep it
    // Otherwise, the frontend will handle it
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API Route] Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message
    }, { status: 500 });
  }
}