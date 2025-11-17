import { NextRequest, NextResponse } from 'next/server';
import { seedDemoData } from '@/src/lib/demo-data';

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Seeding demo data...');
    const result = await seedDemoData();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message,
        error: result.error,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Error in seed endpoint:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  // Health check for seed endpoint
  return NextResponse.json({
    status: 'ok',
    message: 'Demo data seeding endpoint',
  });
}