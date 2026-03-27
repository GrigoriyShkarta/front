import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route for fetching external resources bypassing CORS limitations.
 * Used for Excalidraw images when the external storage (S3/etc) doesn't have CORS headers.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('URL is required', { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new NextResponse(`Failed to fetch from external resource: ${response.status}`, { status: response.status });
    }

    const blob = await response.blob();
    const contentType = response.headers.get('Content-Type') || 'application/octet-stream';

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Proxy fetch error:', error);
    return new NextResponse('Internal Server Error while fetching resource', { status: 500 });
  }
}
