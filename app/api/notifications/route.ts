import { NextResponse } from 'next/server';
import { getDbData } from '@/lib/jsonDb';

export async function GET() {
  try {
    const db = getDbData();
    
    // Sort notifications by createdAt descending
    const notifications = [...db.notifications].sort((a: any, b: any) => {
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    }).slice(0, 20);
    
    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
