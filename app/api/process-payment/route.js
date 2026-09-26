export async function POST(request) {
  try {
    const body = await request.json();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL;
    if (!backendUrl) {
      return new Response(JSON.stringify({ error: 'Backend URL not configured' }), { status: 500 });
    }

    const res = await fetch(`${backendUrl}/api/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: res.status });
  } catch (err) {
    console.error('Process payment error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
  }
}