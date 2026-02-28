import { NextResponse } from 'next/server';
import { getDbData } from '@/lib/jsonDb';

export async function GET() {
  try {
    const db = getDbData();
    
    // Sort users by risk_score descending
    const users = [...db.users].sort((a: any, b: any) => (b.risk_score || 0) - (a.risk_score || 0));
    
    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
