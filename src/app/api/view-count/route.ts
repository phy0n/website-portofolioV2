import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Check if user has visited before using cookie
    const hasVisited = cookieStore.get('portfolio-visited');
    
    // Get current count from query param or default to 0
    const currentCount = parseInt(req.nextUrl.searchParams.get('current') || '0');
    
    if (!hasVisited) {
      // New visitor - increment count
      const newCount = currentCount + 1;
      
      // Set cookie to mark as visited (expires in 1 year)
      const response = NextResponse.json({
        count: newCount,
        isNewVisitor: true
      });
      
      response.cookies.set('portfolio-visited', 'true', {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        path: '/',
        sameSite: 'strict'
      });
      
      return response;
    }
    
    // Returning visitor - don't increment
    return NextResponse.json({
      count: currentCount,
      isNewVisitor: false
    });
  } catch (error) {
    console.error('Error tracking view count:', error);
    return NextResponse.json({ error: 'Failed to track view count' }, { status: 500 });
  }
}
